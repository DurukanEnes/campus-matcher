from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database.models import User


def get_db() -> Iterator[Session]:
    # Imported lazily: app.database.session needs DATABASE_URL at import time.
    from app.database.session import SessionLocal

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# TEMPORARY: replace with the JWT-based dependency once authentication exists.
def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    x_user_id: Annotated[int | None, Header()] = None,
) -> User:
    user = db.get(User, x_user_id) if x_user_id is not None else None
    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user
