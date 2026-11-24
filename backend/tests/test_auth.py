import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_login_seeded_admin():
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@titleflow.com",
        "password": "AdminPass123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "ADMIN"
    assert data["user"]["email"] == "admin@titleflow.com"

def test_login_invalid_password():
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@titleflow.com",
        "password": "WrongPassword!"
    })
    assert response.status_code == 401

def test_register_and_login_new_user():
    import uuid
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    reg_response = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "TestPassword123!",
        "full_name": "Test User",
        "role": "BUYER"
    })
    assert reg_response.status_code == 201
    assert reg_response.json()["email"] == email

    login_resp = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "TestPassword123!"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    # Verify /me endpoint
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == email
