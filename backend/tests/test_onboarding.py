import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_onboarding_lifecycle():
    # 1. Complete multi-step onboarding
    test_email = "sarah.onboarding@pacifictitle.com"
    payload = {
        "account": {
            "full_name": "Sarah Jenkins",
            "email": test_email,
            "password": "SecurePassword123!",
            "phone": "+1 (555) 019-9944",
            "job_title": "Senior Escrow Officer"
        },
        "organization": {
            "name": "Pacific Premier Title & Escrow",
            "org_type": "TITLE_COMPANY",
            "website": "https://pacifictitle.com",
            "business_email": test_email,
            "phone": "+1 (555) 019-9944",
            "country": "United States",
            "state": "Oregon",
            "city": "Portland",
            "address": "1200 SW 5th Ave",
            "postal_code": "97204"
        },
        "workspace": {
            "team_size": "6-20",
            "monthly_closing_volume": "51-150",
            "primary_use_case": "Residential Closings & Wire Protection",
            "invited_team_members": ["assistant@pacifictitle.com"]
        }
    }

    res = client.post("/api/v1/organizations/onboarding", json=payload)
    assert res.status_code == 201, res.text
    data = res.json()
    assert "access_token" in data
    assert data["organization_name"] == "Pacific Premier Title & Escrow"
    assert data["user_email"] == test_email
    token = data["access_token"]

    # 2. Duplicate registration protection
    dup_res = client.post("/api/v1/organizations/onboarding", json=payload)
    assert dup_res.status_code == 400
    assert "already exists" in dup_res.json()["detail"]

    # 3. Verify user can query current organization workspace using token
    headers = {"Authorization": f"Bearer {token}"}
    org_res = client.get("/api/v1/organizations/current", headers=headers)
    assert org_res.status_code == 200
    org_data = org_res.json()
    assert org_data["name"] == "Pacific Premier Title & Escrow"
    assert org_data["org_type"] == "TITLE_COMPANY"
