from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session


def get_db() -> Iterator[Session]:
    # Imported lazily: app.database.session needs DATABASE_URL at import time.
    from app.database.session import SessionLocal

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


DbSession = Annotated[Session, Depends(get_db)]
