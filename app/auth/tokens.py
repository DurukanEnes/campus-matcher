"""Access and refresh tokens (WBS-2.2).

- Access token: a short-lived JWT (15 min, NFR-03) sent as
  "Authorization: Bearer <token>". It names the user and the session.
- Refresh token: a random opaque string. Only its SHA-256 hash is stored in
  auth_sessions; it is replaced on every refresh (rotation).
"""

import hashlib
import secrets
from dataclasses import dataclass
from datetime import UTC, datetime

import jwt

from app.auth import config


class TokenError(Exception):
    def __init__(self, code: str):
        super().__init__(code)
        self.code = code


@dataclass(frozen=True)
class AccessClaims:
    user_id: int
    session_id: int


def create_access_token(
    user_id: int,
    session_id: int,
    role: str,
    now: datetime | None = None,
) -> str:
    issued_at = now or datetime.now(UTC)
    payload = {
        "iss": config.JWT_ISSUER,
        "sub": str(user_id),
        "sid": session_id,
        "role": role,
        "type": "access",
        "iat": issued_at,
        "exp": issued_at + config.ACCESS_TOKEN_TTL,
    }
    return jwt.encode(payload, config.jwt_secret(), algorithm=config.JWT_ALGORITHM)


def decode_access_token(token: str) -> AccessClaims:
    try:
        payload = jwt.decode(
            token,
            config.jwt_secret(),
            algorithms=[config.JWT_ALGORITHM],
            issuer=config.JWT_ISSUER,
            options={"require": ["exp", "iat", "iss", "sub", "sid", "type"]},
        )
    except jwt.ExpiredSignatureError as exc:
        raise TokenError("TOKEN_EXPIRED") from exc
    except jwt.PyJWTError as exc:
        raise TokenError("INVALID_TOKEN") from exc

    if payload["type"] != "access":
        raise TokenError("INVALID_TOKEN")
    try:
        return AccessClaims(user_id=int(payload["sub"]), session_id=int(payload["sid"]))
    except (TypeError, ValueError) as exc:
        raise TokenError("INVALID_TOKEN") from exc


def new_refresh_token() -> str:
    return secrets.token_urlsafe(32)


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
