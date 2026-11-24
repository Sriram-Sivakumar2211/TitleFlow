from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User, UserRole
from app.models.transaction import Transaction
from app.models.document import Document, DocumentCategory, DocumentProcessingStatus, ExtractionResult
from app.models.audit import AuditLog
from app.schemas.document import DocumentResponse, ExtractionResultResponse, ExtractionVerifyRequest
from app.services.storage import get_storage_provider, ALLOWED_MIME_TYPES
from ai_engine.services.pipeline import process_document_pipeline

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    request: Request,
    transaction_id: str = Form(...),
    category: Optional[str] = Form(DocumentCategory.OTHER.value),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify transaction exists
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    # Authorization
    if current_user.role == UserRole.BUYER and txn.buyer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to upload to this transaction")
    if current_user.role == UserRole.SELLER and txn.seller_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to upload to this transaction")

    # Validate MIME type and Extension
    file_ext = Path(file.filename).suffix.lower()
    content_type = file.content_type or ""
    
    # Check mime type or extension
    valid_ext = any(file_ext == allowed_ext for allowed_ext in ALLOWED_MIME_TYPES.values())
    valid_mime = content_type in ALLOWED_MIME_TYPES or valid_ext
    if not valid_mime and not valid_ext:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{content_type}' ({file_ext}). Supported types: PDF, PNG, JPEG, TIFF"
        )

    # Validate category enum
    try:
        cat_enum = DocumentCategory(category)
    except ValueError:
        cat_enum = DocumentCategory.OTHER

    # Save file via storage abstraction
    storage = get_storage_provider()
    storage_path, stored_filename, file_size, file_hash = storage.save_file(file.file, file.filename)

    # Create document record
    doc = Document(
        transaction_id=txn.id,
        uploaded_by_id=current_user.id,
        filename=stored_filename,
        original_filename=file.filename,
        file_path=storage_path,
        file_size_bytes=file_size,
        mime_type=content_type or "application/octet-stream",
        file_hash=file_hash,
        category=cat_enum,
        processing_status=DocumentProcessingStatus.PROCESSING
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="DOCUMENT_UPLOADED",
        entity_type="DOCUMENT",
        entity_id=doc.id,
        details={"filename": file.filename, "size": file_size, "transaction_id": txn.id},
        ip_address=request.client.host if request.client else None
    )
    db.add(audit)
    db.commit()

    # Trigger processing pipeline synchronously for predictable immediate feedback
    process_document_pipeline(doc.id, db)
    db.refresh(doc)

    return doc

@router.get("/transaction/{transaction_id}", response_model=List[DocumentResponse])
def get_transaction_documents(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    # Authorization
    if current_user.role == UserRole.BUYER and txn.buyer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    if current_user.role == UserRole.SELLER and txn.seller_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    docs = db.query(Document).filter(Document.transaction_id == transaction_id).order_by(Document.created_at.desc()).all()
    return docs

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document_details(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    txn = doc.transaction
    if current_user.role == UserRole.BUYER and txn.buyer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    if current_user.role == UserRole.SELLER and txn.seller_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    return doc

@router.get("/{document_id}/download")
def download_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    txn = doc.transaction
    if current_user.role == UserRole.BUYER and txn.buyer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to download this document")
    if current_user.role == UserRole.SELLER and txn.seller_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to download this document")

    storage = get_storage_provider()
    safe_path = storage.get_file_path(doc.file_path)

    return FileResponse(
        path=safe_path,
        media_type=doc.mime_type,
        filename=doc.original_filename
    )

@router.post("/{document_id}/reprocess", response_model=DocumentResponse)
def reprocess_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    if current_user.role not in [UserRole.ADMIN, UserRole.CLOSING_AGENT]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to reprocess documents")

    process_document_pipeline(doc.id, db)
    db.refresh(doc)
    return doc

@router.put("/{document_id}/extraction/verify", response_model=ExtractionResultResponse)
def verify_extraction_result(
    document_id: str,
    verify_req: ExtractionVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.CLOSING_AGENT]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only closing agents and admins can verify extraction data")

    extraction = db.query(ExtractionResult).filter(ExtractionResult.document_id == document_id).first()
    if not extraction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Extraction result not found")

    from datetime import datetime, timezone
    extraction.is_verified = verify_req.is_verified
    extraction.verified_by_id = current_user.id
    extraction.verified_at = datetime.now(timezone.utc)

    if verify_req.updated_fields:
        # Merge updated fields into extracted_data
        updated_data = dict(extraction.extracted_data or {})
        for field, item in verify_req.updated_fields.items():
            if field in updated_data and isinstance(updated_data[field], dict):
                updated_data[field]["value"] = item.get("value")
                updated_data[field]["review_status"] = "VERIFIED"
            else:
                updated_data[field] = item
        extraction.extracted_data = updated_data

    # Also update document processing status to PROCESSED
    doc = extraction.document
    if doc and doc.processing_status == DocumentProcessingStatus.NEEDS_REVIEW:
        doc.processing_status = DocumentProcessingStatus.PROCESSED

    db.commit()
    db.refresh(extraction)

    # Re-evaluate risks after verification
    from ai_engine.analysis.risk_engine import evaluate_transaction_risks
    evaluate_transaction_risks(extraction.document.transaction_id, db)

    return extraction

@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    if current_user.role not in [UserRole.ADMIN, UserRole.CLOSING_AGENT]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete documents")

    storage = get_storage_provider()
    storage.delete_file(doc.file_path)

    txn_id = doc.transaction_id
    db.delete(doc)
    db.commit()

    # Re-evaluate transaction risks after document removal
    from ai_engine.analysis.risk_engine import evaluate_transaction_risks
    evaluate_transaction_risks(txn_id, db)

    return {"message": "Document deleted successfully"}
