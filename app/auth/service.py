"""Login, session, and token logic (WBS-2.2). FastAPI-free, so other
services (WBS-2.4 password reset, WBS-8.1 suspension) can call it directly."""

from dataclasses import dataclass
from datetime import UTC, datetime

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.auth import config, passwords, tokens
from app.database.models import AuthSession, User

ACTIVE = "ACTIVE"
PENDING = "PENDING"
SUSPENDED = "SUSPENDED"


class AuthError(Exception):
    def __init__(self, status_code: int, code: str, message: str):
        super().__init__(code)
        self.status_code = status_code
        self.code = code
        self.message = message


INVALID_CREDENTIALS = (401, "INVALID_CREDENTIALS", "E-mail or password is wrong.")
EMAIL_NOT_VERIFIED = (403, "EMAIL_NOT_VERIFIED", "Verify your e-mail address first.")
ACCOUNT_SUSPENDED = (403, "ACCOUNT_SUSPENDED", "This account is suspended.")
INVALID_REFRESH_TOKEN = (401, "INVALID_REFRESH_TOKEN", "Sign in again.")
SESSION_REVOKED = (401, "SESSION_REVOKED", "This session has ended. Sign in again.")


@dataclass(frozen=True)
class IssuedTokens:
    access_token: str
    refresh_token: str
    user: User


def normalize_email(email: str) -> str:
    return email.strip().lower()


def _now(now: datetime | None) -> datetime:
    return now or datetime.now(UTC)


def _check_status(user: User) -> None:
    if user.status == PENDING:
        raise AuthError(*EMAIL_NOT_VERIFIED)
    if user.status != ACTIVE:
        raise AuthError(*ACCOUNT_SUSPENDED)


def _issue(db: Session, auth_session: AuthSession, user: User, now: datetime) -> IssuedTokens:
    refresh_token = tokens.new_refresh_token()
    auth_session.refresh_token_hash = tokens.hash_refresh_token(refresh_token)
    auth_session.last_used_at = now
    db.commit()
    access_token = tokens.create_access_token(user.id, auth_session.id, user.role, now=now)
    return IssuedTokens(access_token=access_token, refresh_token=refresh_token, user=user)


def login(db: Session, email: str, password: str, now: datetime | None = None) -> IssuedTokens:
    now = _now(now)
    user = db.scalars(
        select(User).where(func.lower(User.email) == normalize_email(email))
    ).one_or_none()

    if user is None:
        passwords.burn_password_check(password)
        raise AuthError(*INVALID_CREDENTIALS)
    if not passwords.verify_password(password, user.password_hash):
        raise AuthError(*INVALID_CREDENTIALS)
    # The status is checked (in start_session) only after the password, so a
    # wrong password reveals nothing about the account.
    return start_session(db, user, now)


def start_session(db: Session, user: User, now: datetime | None = None) -> IssuedTokens:
    """Signs an active user in on a new device. Also used after e-mail
    verification (WBS-2.1), which logs the member in directly."""
    now = _now(now)
    _check_status(user)
    auth_session = AuthSession(
        user_id=user.id,
        refresh_token_hash="",
        created_at=now,
        expires_at=now + config.REFRESH_TOKEN_TTL,
    )
    db.add(auth_session)
    db.flush()
    return _issue(db, auth_session, user, now)


def _find_active_session(db: Session, refresh_token: str, now: datetime) -> AuthSession | None:
    return db.scalars(
        select(AuthSession).where(
            AuthSession.refresh_token_hash == tokens.hash_refresh_token(refresh_token),
            AuthSession.revoked_at.is_(None),
            AuthSession.expires_at > now,
        )
    ).one_or_none()


def refresh(db: Session, refresh_token: str, now: datetime | None = None) -> IssuedTokens:
    now = _now(now)
    auth_session = _find_active_session(db, refresh_token, now)
    if auth_session is None:
        raise AuthError(*INVALID_REFRESH_TOKEN)
    user = auth_session.user
    try:
        _check_status(user)
    except AuthError:
        auth_session.revoked_at = now
        db.commit()
        raise
    # Rotation: the old refresh token stops working.
    return _issue(db, auth_session, user, now)


def logout(db: Session, refresh_token: str, now: datetime | None = None) -> None:
    now = _now(now)
    auth_session = _find_active_session(db, refresh_token, now)
    if auth_session is not None:
        auth_session.revoked_at = now
        db.commit()


def revoke_all_sessions(db: Session, user_id: int, now: datetime | None = None) -> int:
    """Signs the user out on every device (password reset FR-24, suspension FR-23).
    Commits; returns the number of sessions ended."""
    result = db.execute(
        update(AuthSession)
        .where(AuthSession.user_id == user_id, AuthSession.revoked_at.is_(None))
        .values(revoked_at=_now(now))
    )
    db.commit()
    return result.rowcount


def user_for_access_token(db: Session, access_token: str) -> User:
    """Raises tokens.TokenError or AuthError; used by the get_current_user dependency."""
    claims = tokens.decode_access_token(access_token)
    auth_session = db.get(AuthSession, claims.session_id)
    if (
        auth_session is None
        or auth_session.user_id != claims.user_id
        or auth_session.revoked_at is not None
    ):
        raise AuthError(*SESSION_REVOKED)
    user = auth_session.user
    _check_status(user)
    return user
