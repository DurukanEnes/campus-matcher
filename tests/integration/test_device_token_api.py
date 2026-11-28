import pytest

from app.database.models import PushToken
from app.notifications import fcm


@pytest.fixture
def auth(auth_headers):
    return auth_headers


def test_requires_authentication(client):
    body = {"token": "t", "platform": "ANDROID"}
    assert client.post("/notifications/device-tokens", json=body).status_code == 401


def test_invalid_token_is_rejected(client):
    body = {"token": "t", "platform": "ANDROID"}
    response = client.post(
        "/notifications/device-tokens",
        json=body,
        headers={"Authorization": "Bearer not-a-jwt"},
    )
    assert response.status_code == 401


def test_register_token(client, db, make_user, auth):
    user = make_user()
    body = {"token": "tok-1", "platform": "IOS"}
    response = client.post("/notifications/device-tokens", json=body, headers=auth(user))
    assert response.status_code == 204
    assert db.query(PushToken).one().token == "tok-1"


def test_invalid_platform_is_422(client, make_user, auth):
    user = make_user()
    body = {"token": "tok-1", "platform": "WINDOWS"}
    response = client.post("/notifications/device-tokens", json=body, headers=auth(user))
    assert response.status_code == 422


def test_delete_token(client, db, make_user, auth):
    user = make_user()
    client.post(
        "/notifications/device-tokens",
        json={"token": "tok-1", "platform": "ANDROID"},
        headers=auth(user),
    )
    assert (
        client.delete("/notifications/device-tokens/tok-1", headers=auth(user)).status_code
        == 204
    )
    assert db.query(PushToken).count() == 0
    assert (
        client.delete("/notifications/device-tokens/tok-1", headers=auth(user)).status_code
        == 404
    )


def test_send_test_notification(client, make_user, monkeypatch, auth):
    user = make_user()
    calls = []
    monkeypatch.setattr(fcm, "send_message", lambda t, p: calls.append((t, p)))
    client.post(
        "/notifications/device-tokens",
        json={"token": "tok-1", "platform": "ANDROID"},
        headers=auth(user),
    )
    response = client.post("/notifications/test", headers=auth(user))
    assert response.status_code == 200
    assert response.json() == {"delivered": 1}
    assert calls[0][0] == "tok-1"
