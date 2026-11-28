"""Login, sessions, and RBAC (WBS-2.2).

Done criterion: protected endpoints reject missing, expired, or wrong-role
tokens (NFR-03, FR-04).
"""

from datetime import UTC, datetime, timedelta

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.auth import config, service, tokens
from app.auth.dependencies import AdminUser, CurrentUser
from app.database.dependencies import get_db
from app.database.models import AuthSession

DEFAULT_PASSWORD = "campus123"  # same as make_user in conftest.py


def login(client, email="user@itu.edu.tr", password=DEFAULT_PASSWORD):
    return client.post("/auth/login", json={"email": email, "password": password})


def bearer(token):
    return {"Authorization": f"Bearer {token}"}


def error_code(response):
    return response.json()["detail"]["code"]


# --- Login (FR-03) ---------------------------------------------------------


def test_login_returns_tokens_and_user(client, make_user):
    user = make_user()
    response = login(client)
    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["expires_in"] == 15 * 60
    assert body["refresh_token"]
    assert body["user"] == {
        "id": user.id,
        "email": "user@itu.edu.tr",
        "role": "USER",
        "account_type": "STUDENT",
    }
    me = client.get("/auth/me", headers=bearer(body["access_token"]))
    assert me.status_code == 200
    assert me.json()["id"] == user.id


def test_login_ignores_email_case_and_spaces(client, make_user):
    make_user()
    assert login(client, email="  User@ITU.edu.tr ").status_code == 200


def test_wrong_password_and_unknown_email_get_the_same_answer(client, make_user):
    make_user()
    wrong_password = login(client, password="campus124")
    unknown_email = login(client, email="nobody@itu.edu.tr")
    assert wrong_password.status_code == unknown_email.status_code == 401
    assert wrong_password.json() == unknown_email.json()
    assert error_code(wrong_password) == "INVALID_CREDENTIALS"


def test_unverified_account_cannot_log_in(client, make_user):
    make_user(status="PENDING")
    response = login(client)
    assert response.status_code == 403
    assert error_code(response) == "EMAIL_NOT_VERIFIED"


def test_suspended_account_cannot_log_in(client, make_user):
    make_user(status="SUSPENDED")
    response = login(client)
    assert response.status_code == 403
    assert error_code(response) == "ACCOUNT_SUSPENDED"


def test_suspended_account_with_wrong_password_reveals_nothing(client, make_user):
    make_user(status="SUSPENDED")
    assert error_code(login(client, password="wrong-pass1")) == "INVALID_CREDENTIALS"


def test_login_validates_the_body(client):
    assert client.post("/auth/login", json={"email": "a@itu.edu.tr"}).status_code == 422


# --- Protected endpoints: missing, invalid, expired tokens (NFR-03) ---------


def test_missing_token_is_rejected(client):
    response = client.get("/auth/me")
    assert response.status_code == 401
    assert error_code(response) == "NOT_AUTHENTICATED"
    assert response.headers["WWW-Authenticate"] == "Bearer"


@pytest.mark.parametrize(
    "header",
    ["Basic dXNlcjpwYXNz", "Bearer", "Bearer not-a-jwt", "not-a-jwt"],
)
def test_malformed_authorization_header_is_rejected(client, header):
    response = client.get("/auth/me", headers={"Authorization": header})
    assert response.status_code == 401


def test_expired_token_is_rejected(client, db, make_user):
    user = make_user()
    issued = service.start_session(db, user)
    claims = tokens.decode_access_token(issued.access_token)
    long_ago = datetime.now(UTC) - config.ACCESS_TOKEN_TTL - timedelta(minutes=1)
    expired = tokens.create_access_token(user.id, claims.session_id, "USER", now=long_ago)
    response = client.get("/auth/me", headers=bearer(expired))
    assert response.status_code == 401
    assert error_code(response) == "TOKEN_EXPIRED"


def test_token_of_a_logged_out_session_is_rejected(client, make_user):
    make_user()
    body = login(client).json()
    assert client.post("/auth/logout", json={"refresh_token": body["refresh_token"]}).status_code == 204
    response = client.get("/auth/me", headers=bearer(body["access_token"]))
    assert response.status_code == 401
    assert error_code(response) == "SESSION_REVOKED"


def test_token_for_another_users_session_is_rejected(client, db, make_user):
    first = make_user("a@itu.edu.tr")
    second = make_user("b@itu.edu.tr")
    session_id = tokens.decode_access_token(service.start_session(db, first).access_token).session_id
    forged = tokens.create_access_token(second.id, session_id, "USER")
    assert error_code(client.get("/auth/me", headers=bearer(forged))) == "SESSION_REVOKED"


def test_suspended_member_is_signed_out_at_once(client, db, make_user):
    """FR-23: a valid token stops working when the account is suspended."""
    user = make_user()
    body = login(client).json()
    user.status = "SUSPENDED"
    db.commit()
    response = client.get("/auth/me", headers=bearer(body["access_token"]))
    assert response.status_code == 401
    assert error_code(response) == "ACCOUNT_SUSPENDED"


# --- Refresh and logout ------------------------------------------------------


def test_refresh_rotates_the_token_pair(client, make_user):
    make_user()
    first = login(client).json()
    response = client.post("/auth/refresh", json={"refresh_token": first["refresh_token"]})
    assert response.status_code == 200
    second = response.json()
    assert second["refresh_token"] != first["refresh_token"]
    assert client.get("/auth/me", headers=bearer(second["access_token"])).status_code == 200

    reused = client.post("/auth/refresh", json={"refresh_token": first["refresh_token"]})
    assert reused.status_code == 401
    assert error_code(reused) == "INVALID_REFRESH_TOKEN"


def test_unknown_refresh_token_is_rejected(client):
    response = client.post("/auth/refresh", json={"refresh_token": "nope"})
    assert response.status_code == 401


def test_refresh_token_expires_after_30_days(client, db, make_user):
    user = make_user()
    long_ago = datetime.now(UTC) - config.REFRESH_TOKEN_TTL - timedelta(minutes=1)
    issued = service.start_session(db, user, now=long_ago)
    response = client.post("/auth/refresh", json={"refresh_token": issued.refresh_token})
    assert response.status_code == 401


def test_refresh_of_a_suspended_member_ends_the_session(client, db, make_user):
    user = make_user()
    body = login(client).json()
    user.status = "SUSPENDED"
    db.commit()
    response = client.post("/auth/refresh", json={"refresh_token": body["refresh_token"]})
    assert response.status_code == 403
    assert error_code(response) == "ACCOUNT_SUSPENDED"
    assert db.query(AuthSession).one().revoked_at is not None


def test_logout_ends_only_this_device(client, make_user):
    make_user()
    phone = login(client).json()
    tablet = login(client).json()
    client.post("/auth/logout", json={"refresh_token": phone["refresh_token"]})
    assert client.post("/auth/refresh", json={"refresh_token": phone["refresh_token"]}).status_code == 401
    assert client.get("/auth/me", headers=bearer(tablet["access_token"])).status_code == 200


def test_logout_with_unknown_token_is_still_204(client):
    assert client.post("/auth/logout", json={"refresh_token": "nope"}).status_code == 204


def test_revoke_all_sessions_signs_out_every_device(client, db, make_user):
    """Used by password reset (FR-24) and suspension (FR-23)."""
    user = make_user()
    phone = login(client).json()
    tablet = login(client).json()
    assert service.revoke_all_sessions(db, user.id) == 2
    for device in (phone, tablet):
        assert client.get("/auth/me", headers=bearer(device["access_token"])).status_code == 401
        assert client.post("/auth/refresh", json={"refresh_token": device["refresh_token"]}).status_code == 401


def test_refresh_token_is_not_stored_in_plain_text(client, db, make_user):
    make_user()
    body = login(client).json()
    stored = db.query(AuthSession).one().refresh_token_hash
    assert stored == tokens.hash_refresh_token(body["refresh_token"])
    assert stored != body["refresh_token"]


# --- RBAC (FR-04) ---------------------------------------------------------------


@pytest.fixture
def rbac_client(db):
    """A small app with one member and one admin endpoint, as WBS-8.1 will use them."""
    test_app = FastAPI()

    @test_app.get("/member-only")
    def member_only(user: CurrentUser):
        return {"id": user.id}

    @test_app.get("/admin-only")
    def admin_only(admin: AdminUser):
        return {"id": admin.id}

    test_app.dependency_overrides[get_db] = lambda: db
    return TestClient(test_app)


def test_admin_endpoint_rejects_missing_token(rbac_client):
    assert rbac_client.get("/admin-only").status_code == 401


def test_admin_endpoint_rejects_member_token(rbac_client, make_user, auth_headers):
    member = make_user()
    response = rbac_client.get("/admin-only", headers=auth_headers(member))
    assert response.status_code == 403
    assert error_code(response) == "FORBIDDEN"


def test_admin_endpoint_rejects_expired_admin_token(rbac_client, db, make_user):
    admin = make_user("admin@itu.edu.tr", role="ADMIN")
    session_id = tokens.decode_access_token(service.start_session(db, admin).access_token).session_id
    long_ago = datetime.now(UTC) - timedelta(hours=1)
    expired = tokens.create_access_token(admin.id, session_id, "ADMIN", now=long_ago)
    assert rbac_client.get("/admin-only", headers=bearer(expired)).status_code == 401


def test_admin_can_use_admin_and_member_endpoints(rbac_client, make_user, auth_headers):
    admin = make_user("admin@itu.edu.tr", role="ADMIN")
    headers = auth_headers(admin)
    assert rbac_client.get("/admin-only", headers=headers).status_code == 200
    assert rbac_client.get("/member-only", headers=headers).status_code == 200


def test_member_can_use_member_endpoints(rbac_client, make_user, auth_headers):
    member = make_user()
    assert rbac_client.get("/member-only", headers=auth_headers(member)).status_code == 200


def test_role_comes_from_the_database_not_the_token(rbac_client, db, make_user):
    """A token that claims ADMIN does not help a member, and a demoted admin
    loses access on the next request."""
    member = make_user()
    session_id = tokens.decode_access_token(service.start_session(db, member).access_token).session_id
    claims_admin = tokens.create_access_token(member.id, session_id, "ADMIN")
    assert rbac_client.get("/admin-only", headers=bearer(claims_admin)).status_code == 403

    admin = make_user("admin@itu.edu.tr", role="ADMIN")
    issued = service.start_session(db, admin)
    admin.role = "USER"
    db.commit()
    assert rbac_client.get("/admin-only", headers=bearer(issued.access_token)).status_code == 403
