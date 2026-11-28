from fastapi import APIRouter, HTTPException, Response

from app.auth.dependencies import CurrentUser
from app.database.dependencies import DbSession
from app.notifications import service
from app.notifications.schemas import DeviceTokenIn, NotificationPayload

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post("/device-tokens", status_code=204)
def register_device_token(
    body: DeviceTokenIn,
    user: CurrentUser,
    db: DbSession,
):
    service.register_token(db, user.id, body.token, body.platform)
    return Response(status_code=204)


@router.delete("/device-tokens/{token}", status_code=204)
def delete_device_token(
    token: str,
    user: CurrentUser,
    db: DbSession,
):
    if not service.unregister_token(db, user.id, token):
        raise HTTPException(status_code=404, detail="Device token not found")
    return Response(status_code=204)


@router.post("/test")
def send_test_notification(
    user: CurrentUser,
    db: DbSession,
):
    payload = NotificationPayload(
        type="TEST", title="CampusMatcher", body="Test notification"
    )
    return {"delivered": service.send_to_user(db, user.id, payload)}
