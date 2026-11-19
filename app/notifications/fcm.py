import json
import os

import firebase_admin
from firebase_admin import credentials, exceptions, messaging

from app.notifications.schemas import NotificationPayload


class InvalidTokenError(Exception):
    """The device token is no longer valid and should be removed."""


def _get_app() -> firebase_admin.App:
    try:
        return firebase_admin.get_app()
    except ValueError:
        raw = os.getenv("FIREBASE_CREDENTIALS_JSON")
        if not raw:
            raise RuntimeError("FIREBASE_CREDENTIALS_JSON is not set") from None
        return firebase_admin.initialize_app(
            credentials.Certificate(json.loads(raw))
        )


def send_message(token: str, payload: NotificationPayload) -> None:
    message = messaging.Message(
        token=token,
        notification=messaging.Notification(title=payload.title, body=payload.body),
        data={**payload.data, "type": payload.type},
    )
    try:
        messaging.send(message, app=_get_app())
    except (messaging.UnregisteredError, exceptions.InvalidArgumentError) as exc:
        raise InvalidTokenError(token) from exc
