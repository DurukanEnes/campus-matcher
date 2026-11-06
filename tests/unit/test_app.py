import pytest
from fastapi.testclient import TestClient

from app.main import activities, app

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_demo_activities() -> None:
    original = activities.copy()
    yield
    activities[:] = original


def test_root_returns_backend_status() -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "CampusMatcher Backend is running!"}


def test_demo_page_is_available_at_app_route() -> None:
    response = client.get("/app")

    assert response.status_code == 200
    assert "CampusMatcher" in response.text
    assert "Add an activity" in response.text


def test_health_check() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_activities_can_be_listed_and_created() -> None:
    response = client.post(
        "/api/activities",
        json={
            "activity": "Gym",
            "venue": "Campus Gym",
            "time_window": "Today, 17:00–18:00",
            "note": "Leg day",
        },
    )

    assert response.status_code == 201
    assert response.json()["activity"] == "Gym"
    assert client.get("/api/activities").json()[0]["venue"] == "Campus Gym"


def test_activity_rejects_unknown_categories() -> None:
    response = client.post(
        "/api/activities",
        json={
            "activity": "Beach",
            "venue": "Somewhere",
            "time_window": "Tomorrow",
        },
    )

    assert response.status_code == 422
