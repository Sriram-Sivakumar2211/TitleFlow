from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.transaction import Transaction, TransactionStatus
from app.models.document import Document, DocumentCategory, ExtractionResult
from app.models.risk import RiskFinding, RiskSeverity, FindingReviewStatus
from app.models.property import Property

# Required core document types for standard residential title & escrow closing
REQUIRED_DOCUMENT_CATEGORIES = [
    DocumentCategory.PROPERTY_DEED,
    DocumentCategory.TITLE_REPORT,
    DocumentCategory.PURCHASE_AGREEMENT
]

def evaluate_transaction_risks(transaction_id: str, db: Session) -> List[RiskFinding]:
    """
    Evaluates preliminary title risk and documentation integrity across all documents in a transaction.
    Cross-checks extracted fields against Property master records and other uploaded documents.
    Generates actionable findings with severity and clear rationale.
    """
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        return []

    property_record = transaction.property
    documents = db.query(Document).filter(Document.transaction_id == transaction_id).all()
    existing_findings = {f.title: f for f in db.query(RiskFinding).filter(RiskFinding.transaction_id == transaction_id).all()}

    new_findings: List[RiskFinding] = []

    # Check 1: Mandatory Legal Disclaimer (INFORMATIONAL)
    disclaimer_title = "AI Preliminary Title Review Notice"
    if disclaimer_title not in existing_findings:
        f = RiskFinding(
            transaction_id=transaction_id,
            title=disclaimer_title,
            description="Preliminary automated document analysis is provided to assist closing workflows. This is NOT a certified title search, title commitment, or title insurance underwriting decision.",
            reason="Regulatory & title compliance standard. All findings require review by a licensed closing attorney or title agent.",
            category="COMPLIANCE",
            severity=RiskSeverity.INFORMATIONAL,
            review_status=FindingReviewStatus.ACKNOWLEDGED
        )
        db.add(f)
        new_findings.append(f)

    # Check 2: Missing Core Document Categories
    uploaded_categories = {doc.category for doc in documents}
    for req_cat in REQUIRED_DOCUMENT_CATEGORIES:
        if req_cat not in uploaded_categories:
            cat_name = req_cat.value.replace("_", " ").title()
            title = f"Missing Required Document: {cat_name}"
            if title not in existing_findings:
                f = RiskFinding(
                    transaction_id=transaction_id,
                    title=title,
                    description=f"Transaction is missing an uploaded {cat_name}. Standard closings require deed, title report, and purchase agreement.",
                    reason=f"A complete closing file requires verified {cat_name} documentation before settlement scheduling.",
                    category="MISSING_DOCUMENT",
                    severity=RiskSeverity.NEEDS_REVIEW,
                    review_status=FindingReviewStatus.OPEN
                )
                db.add(f)
                new_findings.append(f)

    # Cross-document data aggregation
    addresses_found = []
    pins_found = []
    lien_items = []
    unverified_docs = []

    for doc in documents:
        extraction = db.query(ExtractionResult).filter(ExtractionResult.document_id == doc.id).first()
        if not extraction or not extraction.extracted_data:
            continue

        data = extraction.extracted_data

        # Check for unverified / low confidence extractions
        if doc.processing_status.value == "NEEDS_REVIEW":
            unverified_docs.append(doc)

        # Collect addresses
        addr_item = data.get("property_address", {})
        if addr_item.get("value"):
            addresses_found.append((doc, addr_item["value"]))

        # Collect APN / PINs
        pin_item = data.get("parcel_pin", {})
        if pin_item.get("value"):
            pins_found.append((doc, pin_item["value"]))

        # Collect Lien references
        lien_item = data.get("lien_references", {})
        if lien_item.get("value"):
            lien_items.append((doc, lien_item["value"]))

    # Check 3: Address Mismatches across documents or against Property master
    if property_record and addresses_found:
        master_addr = property_record.address_line1.lower().strip()
        for doc, doc_addr in addresses_found:
            # Check if main street number or name differs significantly
            doc_addr_clean = doc_addr.lower().strip()
            # If street number or street name doesn't match
            master_first_part = master_addr.split(",")[0].strip()
            if master_first_part not in doc_addr_clean and doc_addr_clean.split(",")[0].strip() not in master_first_part:
                title = f"Property Address Discrepancy: {doc.original_filename}"
                if title not in existing_findings:
                    f = RiskFinding(
                        transaction_id=transaction_id,
                        document_id=doc.id,
                        title=title,
                        description=f"Address extracted from '{doc.original_filename}' ('{doc_addr}') does not match property record ('{property_record.address_line1}, {property_record.city}').",
                        reason="Address variance may indicate legal description error, wrong property file, or unrecorded subdivision update.",
                        category="CROSS_DOCUMENT_MISMATCH",
                        severity=RiskSeverity.POTENTIAL_INCONSISTENCY,
                        review_status=FindingReviewStatus.OPEN
                    )
                    db.add(f)
                    new_findings.append(f)

    # Check 4: APN / Parcel PIN Inconsistencies
    if property_record and property_record.apn_pin and pins_found:
        master_pin = re_clean_pin(property_record.apn_pin)
        for doc, doc_pin in pins_found:
            clean_doc_pin = re_clean_pin(doc_pin)
            if master_pin != clean_doc_pin:
                title = f"Parcel PIN Mismatch: {doc.original_filename}"
                if title not in existing_findings:
                    f = RiskFinding(
                        transaction_id=transaction_id,
                        document_id=doc.id,
                        title=title,
                        description=f"Parcel Identification Number (PIN/APN) in '{doc.original_filename}' ('{doc_pin}') differs from master property record ('{property_record.apn_pin}').",
                        reason="APN mismatch risks conveying incorrect parcel or failing to identify liens attached to specific tax lot numbers.",
                        category="CROSS_DOCUMENT_MISMATCH",
                        severity=RiskSeverity.HIGH_PRIORITY_REVIEW,
                        review_status=FindingReviewStatus.OPEN
                    )
                    db.add(f)
                    new_findings.append(f)

    # Check 5: Potential Liens & Encumbrances Flagged
    for doc, lien_text in lien_items:
        title = f"Potential Encumbrance Detected: {doc.original_filename}"
        if title not in existing_findings:
            f = RiskFinding(
                transaction_id=transaction_id,
                document_id=doc.id,
                title=title,
                description=f"Lien or encumbrance clause detected in '{doc.original_filename}': '{lien_text}'.",
                reason="Unreleased liens, mechanics liens, or tax judgments cloud marketability and must be satisfied prior to closing.",
                category="POTENTIAL_LIEN",
                severity=RiskSeverity.HIGH_PRIORITY_REVIEW,
                review_status=FindingReviewStatus.OPEN
            )
            db.add(f)
            new_findings.append(f)

    # Check 6: Documents Needing Manual Human Review
    for doc in unverified_docs:
        title = f"Document Requires Manual Review: {doc.original_filename}"
        if title not in existing_findings:
            f = RiskFinding(
                transaction_id=transaction_id,
                document_id=doc.id,
                title=title,
                description=f"Automated extraction flagged low confidence fields in '{doc.original_filename}'. Human verification required.",
                reason="Field confidence thresholds require closing agent review to verify names, dates, or financial amounts.",
                category="UNVERIFIED_DATA",
                severity=RiskSeverity.NEEDS_REVIEW,
                review_status=FindingReviewStatus.OPEN
            )
            db.add(f)
            new_findings.append(f)

    if new_findings:
        db.commit()

    return db.query(RiskFinding).filter(RiskFinding.transaction_id == transaction_id).all()

def re_clean_pin(pin_str: str) -> str:
    """Strip spaces, dashes, dots for canonical comparison"""
    import re
    return re.sub(r"[\s\-\.\/]", "", pin_str).upper()
