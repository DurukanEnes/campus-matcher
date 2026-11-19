import pytest

from app.database.models import PushToken
from app.notifications import fcm, service
from app.notifications.schemas import NotificationPayload

PAYLOAD = NotificationPayload(
    type="JOIN_REQUEST",
    title="New join request",
    body="Someone wants to join your activity",
    data={"activity_id": "7"},
)


@pytest.fixture
def sent(monkeypatch):
    calls = []
    monkeypatch.setattr(
        fcm, "send_message", lambda token, payload: calls.append((token, payload))
    )
    return calls


def test_register_token_creates_row(db, make_user):
    user = make_user()
    service.register_token(db, user.id, "tok-1", "ANDROID")
    row = db.query(PushToken).one()
    assert (row.user_id, row.token, row.platform) == (user.id, "tok-1", "ANDROID")


def test_register_same_token_is_upsert_and_moves_owner(db, make_user):
    first = make_user("a@itu.edu.tr")
    second = make_user("b@itu.edu.tr")
    service.register_token(db, first.id, "tok-1", "ANDROID")
    service.register_token(db, second.id, "tok-1", "IOS")
    row = db.query(PushToken).one()
    assert (row.user_id, row.platform) == (second.id, "IOS")


def test_unregister_only_removes_own_token(db, make_user):
    owner = make_user("a@itu.edu.tr")
    other = make_user("b@itu.edu.tr")
    service.register_token(db, owner.id, "tok-1", "ANDROID")
    assert service.unregister_token(db, other.id, "tok-1") is False
    assert db.query(PushToken).count() == 1
    assert service.unregister_token(db, owner.id, "tok-1") is True
    assert db.query(PushToken).count() == 0


def test_send_reaches_all_devices_and_sets_last_used(db, make_user, sent):
    user = make_user()
    service.register_token(db, user.id, "tok-1", "ANDROID")
    service.register_token(db, user.id, "tok-2", "IOS")
    assert service.send_to_user(db, user.id, PAYLOAD) == 2
    assert {token for token, _ in sent} == {"tok-1", "tok-2"}
    assert all(t.last_used_at is not None for t in db.query(PushToken))


def test_send_without_tokens_is_noop(db, make_user, sent):
    user = make_user()
    assert service.send_to_user(db, user.id, PAYLOAD) == 0
    assert sent == []


def test_invalid_token_is_deleted(db, make_user, monkeypatch):
    user = make_user()
    service.register_token(db, user.id, "dead", "ANDROID")
    service.register_token(db, user.id, "alive", "ANDROID")

    def fake_send(token, payload):
        if token == "dead":
            raise fcm.InvalidTokenError(token)

    monkeypatch.setattr(fcm, "send_message", fake_send)
    assert service.send_to_user(db, user.id, PAYLOAD) == 1
    assert [t.token for t in db.query(PushToken)] == ["alive"]


def test_fcm_failure_does_not_raise_and_keeps_token(db, make_user, monkeypatch):
    user = make_user()
    service.register_token(db, user.id, "tok-1", "ANDROID")

    def boom(token, payload):
        raise RuntimeError("FCM down")

    monkeypatch.setattr(fcm, "send_message", boom)
    assert service.send_to_user(db, user.id, PAYLOAD) == 0
    assert db.query(PushToken).count() == 1
