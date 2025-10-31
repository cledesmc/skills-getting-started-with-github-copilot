from fastapi.testclient import TestClient
from src.app import app, activities

client = TestClient(app)


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    # Expect some known activities from the in-memory DB
    assert "Chess Club" in data
    assert "Programming Class" in data


def test_signup_and_unregister_flow():
    activity = "Programming Class"
    test_email = "tester@example.com"

    # Ensure clean start: remove if already present
    participants = activities[activity]["participants"]
    if test_email in participants:
        participants.remove(test_email)

    # Sign up
    resp = client.post(f"/activities/{activity}/signup", params={"email": test_email})
    assert resp.status_code == 200
    body = resp.json()
    assert "Signed up" in body.get("message", "")

    # Verify presence
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert test_email in data[activity]["participants"]

    # Unregister
    resp = client.delete(f"/activities/{activity}/unregister", params={"email": test_email})
    assert resp.status_code == 200
    body = resp.json()
    assert "Unregistered" in body.get("message", "")

    # Verify removal
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert test_email not in data[activity]["participants"]


def test_unregister_nonexistent_returns_400():
    activity = "Chess Club"
    fake_email = "not-registered@example.com"

    # Ensure not present
    participants = activities[activity]["participants"]
    if fake_email in participants:
        participants.remove(fake_email)

    resp = client.delete(f"/activities/{activity}/unregister", params={"email": fake_email})
    assert resp.status_code == 400
    data = resp.json()
    assert data.get("detail") is not None
