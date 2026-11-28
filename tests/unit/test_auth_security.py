"""Unit tests for password hashing and tokens (WBS-2.2, NFR-01, NFR-03)."""

from datetime import UTC, datetime, timedelta

import jwt
import pytest

from app.auth import config, tokens
from app.auth.passwords import hash_password, verify_password


def test_password_is_stored_as_salted_bcrypt_hash():
    first = hash_password("campus123")
    second = hash_password("campus123")
    assert first.startswith("$2b$")
    assert "campus123" not in first
    assert first != second  # different salts
    assert verify_password("campus123", first)
    assert verify_password("campus123", second)


def test_wrong_password_does_not_verify():
    assert not verify_password("campus124", hash_password("campus123"))


def test_password_longer_than_72_bytes_is_refused():
    with pytest.raises(ValueError):
        hash_password("a1" * 40)
    assert not verify_password("a1" * 40, hash_password("a1" * 36))


def test_non_bcrypt_hash_does_not_verify():
    assert not verify_password("x", "x")


def test_access_token_round_trip():
    token = tokens.create_access_token(user_id=7, session_id=3, role="USER")
    claims = tokens.decode_access_token(token)
    assert (claims.user_id, claims.session_id) == (7, 3)


def test_access_token_expires_after_15_minutes():
    issued = datetime.now(UTC) - config.ACCESS_TOKEN_TTL - timedelta(seconds=1)
    token = tokens.create_access_token(7, 3, "USER", now=issued)
    with pytest.raises(tokens.TokenError) as exc:
        tokens.decode_access_token(token)
    assert exc.value.code == "TOKEN_EXPIRED"


def _claims(**overrides):
    now = datetime.now(UTC)
    payload = {
        "iss": config.JWT_ISSUER,
        "sub": "7",
        "sid": 3,
        "role": "USER",
        "type": "access",
        "iat": now,
        "exp": now + timedelta(minutes=5),
    }
    payload.update(overrides)
    return {k: v for k, v in payload.items() if v is not None}


@pytest.mark.parametrize(
    "token",
    [
        pytest.param("not-a-jwt", id="garbage"),
        pytest.param(jwt.encode(_claims(), "another-secret-" + "y" * 32), id="wrong-secret"),
        pytest.param(jwt.encode(_claims(), None, algorithm="none"), id="alg-none"),
        pytest.param(
            jwt.encode(_claims(type="refresh"), config.jwt_secret()), id="wrong-type"
        ),
        pytest.param(jwt.encode(_claims(iss="someone-else"), config.jwt_secret()), id="issuer"),
        pytest.param(jwt.encode(_claims(sid=None), config.jwt_secret()), id="no-session"),
        pytest.param(jwt.encode(_claims(sub="abc"), config.jwt_secret()), id="bad-subject"),
    ],
)
def test_invalid_access_tokens_are_rejected(token):
    with pytest.raises(tokens.TokenError) as exc:
        tokens.decode_access_token(token)
    assert exc.value.code == "INVALID_TOKEN"


def test_tampered_token_is_rejected():
    token = tokens.create_access_token(7, 3, "USER")
    header, payload, signature = token.split(".")
    tampered = f"{header}.{payload}.{signature[:-2]}{'A' if signature[-2] != 'A' else 'B'}{signature[-1]}"
    with pytest.raises(tokens.TokenError):
        tokens.decode_access_token(tampered)


def test_missing_or_short_secret_is_a_configuration_error(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "short")
    with pytest.raises(RuntimeError):
        tokens.create_access_token(7, 3, "USER")


def test_refresh_tokens_are_random_and_hashed():
    first, second = tokens.new_refresh_token(), tokens.new_refresh_token()
    assert first != second
    assert len(tokens.hash_refresh_token(first)) == 64
    assert tokens.hash_refresh_token(first) == tokens.hash_refresh_token(first)
    assert first not in tokens.hash_refresh_token(first)
