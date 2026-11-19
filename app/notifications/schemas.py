from typing import Literal

from pydantic import BaseModel, Field

NotificationType = Literal["JOIN_REQUEST", "REQUEST_RESPONSE", "MESSAGE", "TEST"]


class DeviceTokenIn(BaseModel):
    token: str = Field(min_length=1)
    platform: Literal["ANDROID", "IOS"]


class NotificationPayload(BaseModel):
    type: NotificationType
    title: str
    body: str
    # FCM data values must be strings (e.g. activity_id, chat_id for deep links).
    data: dict[str, str] = Field(default_factory=dict)
