import logging
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.models import PushToken
from app.notifications import fcm
from app.notifications.schemas import NotificationPayload

logger = logging.getLogger(__name__)


def register_token(db: Session, user_id: int, token: str, platform: str) -> PushToken:
    row = db.scalar(select(PushToken).where(PushToken.token == token))
    if row is None:
        row = PushToken(user_id=user_id, token=token, platform=platform)
        db.add(row)
    else:
        row.user_id = user_id
        row.platform = platform
    db.commit()
    return row


def unregister_token(db: Session, user_id: int, token: str) -> bool:
    row = db.scalar(
        select(PushToken).where(
            PushToken.token == token, PushToken.user_id == user_id
        )
    )
    if row is None:
        return False
    db.delete(row)
    db.commit()
    return True


def send_to_user(db: Session, user_id: int, payload: NotificationPayload) -> int:
    """Send a notification to every device of a user; returns the delivered count.

    Never raises: callers (join requests, chat) must not fail because of FCM.
    """
    tokens = db.scalars(select(PushToken).where(PushToken.user_id == user_id)).all()
    delivered = 0
    for row in tokens:
        try:
            fcm.send_message(row.token, payload)
        except fcm.InvalidTokenError:
            db.delete(row)
        except Exception:
            logger.exception("FCM send failed for user %s", user_id)
        else:
            row.last_used_at = datetime.now(UTC)
            delivered += 1
    db.commit()
    return delivered
