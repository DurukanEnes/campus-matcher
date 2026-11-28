
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.models.catalog import Category, Venue
from app.database.session import SessionLocal

router = APIRouter(
    prefix="/venues",
    tags=["Venues"],
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get("/")
def get_venues(
    category: str,
    db: Session = Depends(get_db),  # noqa: B008
):
    category_record = db.scalar(
        select(Category).where(Category.name == category)
    )

    if category_record is None:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )

    venues = db.scalars(
        select(Venue)
        .where(Venue.category_id == category_record.id)
        .order_by(Venue.name)
    ).all()

    return [
        {
            "id": venue.id,
            "name": venue.name,
            "category": category_record.name,
        }
        for venue in venues
    ]
