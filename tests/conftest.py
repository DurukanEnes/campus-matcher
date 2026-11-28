import os

# Test settings; set before any app module reads them.
os.environ.setdefault("JWT_SECRET", "test-secret-" + "x" * 32)
os.environ.setdefault("BCRYPT_ROUNDS", "4")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.auth import service as auth_service
from app.auth.passwords import hash_password
from app.database.base import Base
from app.database.dependencies import get_db
from app.database.models import AuthSession, PushToken, User
from app.main import app

DEFAULT_PASSWORD = "campus123"


@pytest.fixture
def db():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    # Only the tables these tests need (other models use PostgreSQL types).
    Base.metadata.create_all(
        engine,
        tables=[User.__table__, PushToken.__table__, AuthSession.__table__],
    )
    session = sessionmaker(bind=engine, autoflush=False)()
    yield session
    session.close()
    engine.dispose()


@pytest.fixture
def client(db):
    app.dependency_overrides[get_db] = lambda: db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def make_user(db):
    def _make(
        email="user@itu.edu.tr",
        password=DEFAULT_PASSWORD,
        role="USER",
        status="ACTIVE",
    ):
        user = User(
            email=email,
            password_hash=hash_password(password),
            account_type="STUDENT",
            role=role,
            status=status,
        )
        db.add(user)
        db.commit()
        return user

    return _make


@pytest.fixture
def auth_headers(db):
    """Signs the user in on a new session and returns the request headers."""

    def _headers(user):
        issued = auth_service.start_session(db, user)
        return {"Authorization": f"Bearer {issued.access_token}"}

    return _headers
