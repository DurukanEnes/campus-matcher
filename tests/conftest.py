import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.base import Base
from app.database.models import PushToken, User


@pytest.fixture
def db():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    # Only the tables the notification tests need (other models use PostgreSQL types).
    Base.metadata.create_all(engine, tables=[User.__table__, PushToken.__table__])
    session = sessionmaker(bind=engine, autoflush=False)()
    yield session
    session.close()
    engine.dispose()


@pytest.fixture
def make_user(db):
    def _make(email="user@itu.edu.tr"):
        user = User(
            email=email,
            password_hash="x",
            account_type="STUDENT",
            role="USER",
            status="ACTIVE",
        )
        db.add(user)
        db.commit()
        return user

    return _make
