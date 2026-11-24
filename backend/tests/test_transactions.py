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

def test_dashboard_stats():
    token = get_agent_token()
    res = client.get("/api/v1/dashboard/stats", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "total_properties" in data
    assert "active_transactions" in data
    assert "status_breakdown" in data
    assert len(data["recent_transactions"]) > 0

def test_create_property_and_transaction():
    token = get_agent_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create property
    prop_res = client.post("/api/v1/properties", headers=headers, json={
        "address_line1": "450 Ocean Drive",
        "city": "Santa Monica",
        "state": "CA",
        "postal_code": "90401",
        "county": "Los Angeles County",
        "property_type": "SINGLE_FAMILY",
        "apn_pin": "4288-019-002",
        "legal_description": "Lot 5, Tract 1024, Los Angeles County, CA."
    })
    assert prop_res.status_code == 201
    prop_id = prop_res.json()["id"]

    # 2. Create transaction
    txn_res = client.post("/api/v1/transactions", headers=headers, json={
        "property_id": prop_id,
        "purchase_price": 1250000.0,
        "earnest_money_deposit": 50000.0,
        "escrow_account_number": "ESC-CA-99201",
        "notes": "Jumbo loan closing file"
    })
    assert txn_res.status_code == 201
    txn_data = txn_res.json()
    assert txn_data["status"] == "DOCUMENTS_PENDING"
    assert txn_data["transaction_number"].startswith("TXN-")
    assert txn_data["property"]["city"] == "Santa Monica"
    assert txn_data["risk_finding_count"] >= 1  # Should have initial disclaimer and missing doc findings
