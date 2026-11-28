"""Password hashing with bcrypt (NFR-01)."""

import bcrypt

from app.auth import config

# bcrypt uses only the first 72 bytes of a password; longer ones are refused
# instead of being silently truncated.
MAX_PASSWORD_BYTES = 72


def hash_password(password: str) -> str:
    encoded = password.encode("utf-8")
    if len(encoded) > MAX_PASSWORD_BYTES:
        raise ValueError(f"Password is longer than {MAX_PASSWORD_BYTES} bytes")
    return bcrypt.hashpw(encoded, bcrypt.gensalt(rounds=config.bcrypt_rounds())).decode(
        "ascii"
    )


def verify_password(password: str, password_hash: str) -> bool:
    encoded = password.encode("utf-8")
    if len(encoded) > MAX_PASSWORD_BYTES:
        return False
    try:
        return bcrypt.checkpw(encoded, password_hash.encode("ascii"))
    except ValueError:
        # Not a bcrypt hash (e.g. a placeholder value).
        return False


_dummy_hash: str | None = None


def burn_password_check(password: str) -> None:
    """Spend the time of one bcrypt check when the e-mail is unknown, so the
    response time does not reveal whether an account exists."""
    global _dummy_hash
    if _dummy_hash is None:
        _dummy_hash = hash_password("not-a-real-password-1")
    verify_password(password, _dummy_hash)
