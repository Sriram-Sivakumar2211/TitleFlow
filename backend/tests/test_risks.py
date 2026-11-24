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

def create_synthetic_lien_notice_pdf() -> bytes:
    """Generates a synthetic Notice of Mechanics Lien PDF to test risk detection"""
    doc = fitz.open()
    page = doc.new_page()
    text = """CLAIM OF MECHANIC'S LIEN

STATE OF OREGON, COUNTY OF LANE
NOTICE IS HEREBY GIVEN that Apex Roofing Specialists, Claimant,
claims a mechanic's lien against the real property commonly known as:
Property Address: 742 Evergreen Terrace, Springfield, OR 97477
Parcel ID: 042-881-992-01

Said mechanic's lien amount of $18,450.00 is due and unpaid for labor and materials furnished
upon the residence of Robert M. Sterling.
Dated this 12th day of September, 2026.
"""
    page.insert_text((50, 72), text, fontsize=11)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes

def test_risk_detection_and_resolution():
    token = get_agent_token()
    headers = {"Authorization": f"Bearer {token}"}

    txns = client.get("/api/v1/transactions", headers=headers).json()
    assert len(txns) > 0
    txn_id = txns[0]["id"]

    # Upload lien notice
    pdf_bytes = create_synthetic_lien_notice_pdf()
    files = {
        "file": ("Mechanics_Lien_Notice_Apex.pdf", io.BytesIO(pdf_bytes), "application/pdf")
    }
    data = {
        "transaction_id": txn_id,
        "category": "LIEN_DOCUMENT"
    }
    upload_res = client.post("/api/v1/documents/upload", headers=headers, data=data, files=files)
    assert upload_res.status_code == 201

    # Check risk findings for this transaction
    risks_res = client.get(f"/api/v1/risks/transaction/{txn_id}", headers=headers)
    assert risks_res.status_code == 200
    findings = risks_res.json()
    assert len(findings) > 0

    # Verify potential lien was flagged with HIGH_PRIORITY_REVIEW
    lien_finding = next((f for f in findings if f["category"] == "POTENTIAL_LIEN" or "Encumbrance" in f["title"]), None)
    assert lien_finding is not None
    assert lien_finding["severity"] == "HIGH_PRIORITY_REVIEW"

    # Test human review update on the finding
    finding_id = lien_finding["id"]
    resolve_res = client.put(
        f"/api/v1/risks/{finding_id}/review",
        headers=headers,
        json={
            "review_status": "RESOLVED",
            "resolution_notes": "Payoff statement obtained from Apex Roofing. $18,450.00 held in escrow at closing for lien release."
        }
    )
    assert resolve_res.status_code == 200
    assert resolve_res.json()["review_status"] == "RESOLVED"
    assert "held in escrow" in resolve_res.json()["resolution_notes"]
