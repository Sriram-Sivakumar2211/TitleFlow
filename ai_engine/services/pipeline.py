import traceback
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.document import Document, DocumentProcessingStatus, ExtractionResult, DocumentCategory
from ai_engine.extraction.text_extractor import extract_text_from_file
from ai_engine.extraction.classifier import classify_document
from ai_engine.services.llm_provider import get_llm_provider
from app.core.config import settings

def process_document_pipeline(document_id: str, db: Session) -> Optional[ExtractionResult]:
    """
    Executes the end-to-end AI document processing pipeline:
    1. Update status to PROCESSING
    2. Extract text (PDF native or OCR)
    3. Classify document category
    4. Extract structured fields via LLM/Deterministic engine
    5. Save ExtractionResult
    6. Update status to PROCESSED (or NEEDS_REVIEW if low confidence)
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        return None

    try:
        document.processing_status = DocumentProcessingStatus.PROCESSING
        db.commit()

        # Step 1: Text extraction
        text_result = extract_text_from_file(document.file_path, enable_ocr=settings.AI_OCR_ENABLED)
        document.page_count = text_result.page_count
        document.ocr_applied = text_result.ocr_applied

        if not text_result.full_text or len(text_result.full_text.strip()) == 0:
            document.processing_status = DocumentProcessingStatus.FAILED
            document.error_message = "No readable text could be extracted from this document."
            db.commit()
            return None

        # Step 2: Auto-classification if not explicitly set or set to OTHER
        category, class_confidence = classify_document(text_result.full_text)
        if document.category == DocumentCategory.OTHER:
            document.category = category

        # Step 3: Structured Information Extraction
        llm = get_llm_provider()
        structured_schema = llm.extract_structured_data(
            text=text_result.full_text,
            document_type=document.category.value,
            page_texts=text_result.page_texts
        )

        extracted_dict = structured_schema.model_dump()

        # Step 4: Persist or update ExtractionResult
        existing_extraction = db.query(ExtractionResult).filter(ExtractionResult.document_id == document.id).first()
        if existing_extraction:
            existing_extraction.provider = settings.AI_PROVIDER
            existing_extraction.classification_confidence = class_confidence
            existing_extraction.raw_text = text_result.full_text[:10000] # store preview sample
            existing_extraction.extracted_data = extracted_dict
            existing_extraction.status = "SUCCESS"
            result_obj = existing_extraction
        else:
            result_obj = ExtractionResult(
                document_id=document.id,
                provider=settings.AI_PROVIDER,
                classification_confidence=class_confidence,
                raw_text=text_result.full_text[:10000],
                extracted_data=extracted_dict,
                status="SUCCESS"
            )
            db.add(result_obj)

        # Check if fields need human review
        needs_review = any(
            isinstance(item, dict) and item.get("confidence", 0) < 0.75 and item.get("value") is not None
            for item in extracted_dict.values()
        )

        document.processing_status = DocumentProcessingStatus.NEEDS_REVIEW if needs_review else DocumentProcessingStatus.PROCESSED
        document.error_message = None
        db.commit()
        db.refresh(result_obj)

        # Step 5: Automatically run Preliminary Title Risk checks for the transaction
        from ai_engine.analysis.risk_engine import evaluate_transaction_risks
        evaluate_transaction_risks(document.transaction_id, db)

        return result_obj

    except Exception as e:
        db.rollback()
        document.processing_status = DocumentProcessingStatus.FAILED
        document.error_message = f"Pipeline execution error: {str(e)}"
        db.commit()
        return None
