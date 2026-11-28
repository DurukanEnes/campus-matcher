"""Authentication settings (WBS-2.2).

Values are read when they are used, not at import time, so the app (and the
Docker health check in CI) starts without JWT_SECRET.
"""

import os
from datetime import timedelta

JWT_ALGORITHM = "HS256"
JWT_ISSUER = "campusmatcher"

ACCESS_TOKEN_TTL = timedelta(minutes=15)
REFRESH_TOKEN_TTL = timedelta(days=30)

MIN_SECRET_LENGTH = 32


def jwt_secret() -> str:
    secret = os.getenv("JWT_SECRET", "")
    if len(secret) < MIN_SECRET_LENGTH:
        raise RuntimeError(
            f"JWT_SECRET must be set and at least {MIN_SECRET_LENGTH} characters long"
        )
    return secret


def bcrypt_rounds() -> int:
    # 12 in production; the tests lower it to keep them fast.
    return int(os.getenv("BCRYPT_ROUNDS", "12"))
