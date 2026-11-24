import io
import fitz
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_agent_token():
    res = client.post("/api/v1/auth/login", json={
        "email": "agent.sarah@titleflow.com",
        "password": "AgentPass123!"
    })
    return res.json()["access_token"]

def create_synthetic_warranty_deed_pdf() -> bytes:
    """Generates a synthetic PDF Warranty Deed for automated testing"""
    doc = fitz.open()
    page = doc.new_page()
    text = """GENERAL WARRANTY DEED

RECORDING REQUESTED BY AND WHEN RECORDED RETURN TO:
TitleFlow Escrow Services, 100 Main St.
Parcel Identification Number (APN): 042-881-992-01

THIS GENERAL WARRANTY DEED, made this 15th day of October, 2026, by and between:
Grantor: Robert M. Sterling, an unmarried person
and
Grantee: Johnathan Vance, a single man

WITNESSETH, that said Grantor, in consideration of the sum of $485,000.00 Dollars,
does hereby grant, bargain, sell, convey and warrant unto Grantee all that certain real property:

Property Address: 742 Evergreen Terrace, Springfield, OR 97477
Legal Description: Lot 12, Block 4, Evergreen Hills Subdivision, as per plat recorded in Book 45, Page 12, Records of Lane County, Oregon.

TOGETHER WITH all tenements, hereditaments and appurtenances thereunto belonging.
SUBJECT TO: Current property taxes for the year 2026.
Instrument No: 2026-0049219
Executed this 15th day of October, 2026.
"""
    page.insert_text((50, 72), text, fontsize=11)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes

def test_document_upload_and_extraction_pipeline():
    token = get_agent_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch a seeded transaction
    txns = client.get("/api/v1/transactions", headers=headers).json()
    assert len(txns) > 0
    txn_id = txns[0]["id"]

    # Upload synthetic warranty deed PDF
    pdf_bytes = create_synthetic_warranty_deed_pdf()
    files = {
        "file": ("Warranty_Deed_742_Evergreen.pdf", io.BytesIO(pdf_bytes), "application/pdf")
    }
    data = {
        "transaction_id": txn_id,
        "category": "PROPERTY_DEED"
    }

    upload_res = client.post("/api/v1/documents/upload", headers=headers, data=data, files=files)
    assert upload_res.status_code == 201
    doc_data = upload_res.json()
    assert doc_data["original_filename"] == "Warranty_Deed_742_Evergreen.pdf"
    assert doc_data["category"] == "PROPERTY_DEED"
    assert doc_data["processing_status"] in ["PROCESSED", "NEEDS_REVIEW"]
    
    # Check extraction results
    assert doc_data["extraction_result"] is not None
    extraction = doc_data["extraction_result"]
    extracted = extraction["extracted_data"]

    # Assert critical title fields extracted
    assert extracted["parcel_pin"]["value"] == "042-881-992-01"
    assert extracted["parcel_pin"]["confidence"] > 0.8
    assert "742 Evergreen Terrace" in extracted["property_address"]["value"]
    assert "Robert M. Sterling" in extracted["seller_names"]["value"]
    assert "Johnathan Vance" in extracted["buyer_names"]["value"]
    assert "$485,000.00" in extracted["financial_amounts"]["value"]

    # Test download endpoint
    doc_id = doc_data["id"]
    download_res = client.get(f"/api/v1/documents/{doc_id}/download", headers=headers)
    assert download_res.status_code == 200
    assert len(download_res.content) > 100

    # Test human verification update
    verify_res = client.put(
        f"/api/v1/documents/{doc_id}/extraction/verify",
        headers=headers,
        json={
            "is_verified": True,
            "updated_fields": {
                "parcel_pin": {"value": "042-881-992-01", "confidence": 1.0, "review_status": "VERIFIED"}
            }
        }
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["is_verified"] is True
