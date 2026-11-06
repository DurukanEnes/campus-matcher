from pathlib import Path
from typing import Literal

from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field, field_validator

app = FastAPI(title="CampusMatcher API")
HTML_FILE = Path(__file__).parent / "static" / "index.html"

activities: list[dict[str, str]] = [
    {
        "id": "demo-1",
        "activity": "Library",
        "venue": "Mustafa İnan Library",
        "time_window": "Today, 18:00–20:00",
        "note": "Quiet study session",
    }
]


class ActivityCreate(BaseModel):
    activity: Literal["Library", "Gym", "Cafeteria"]
    venue: str = Field(min_length=1, max_length=100)
    time_window: str = Field(min_length=1, max_length=100)
    note: str = Field(default="", max_length=280)

    @field_validator("venue", "time_window")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank.")
        return value


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "CampusMatcher Backend is running!"}


@app.get("/app", include_in_schema=False)
def demo() -> FileResponse:
    return FileResponse(HTML_FILE)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/activities")
def list_activities() -> list[dict[str, str]]:
    return activities


@app.post("/api/activities", status_code=201)
def create_activity(activity: ActivityCreate) -> dict[str, str]:
    new_activity = activity.model_dump()
    new_activity["id"] = f"activity-{len(activities) + 1}"
    activities.insert(0, new_activity)
    return new_activity
