from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
    text,
)

from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base

class Block(Base):
    __tablename__ = "blocks"

    __table_args__ = (
        CheckConstraint(
            "blocker_id <> blocked_id",
            name="ck_blocks_different_users",
        ),
    )

    blocker_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )

    blocked_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

class Report(Base):
    __tablename__ = "reports"

    __table_args__ = (
        CheckConstraint(
            "reporter_id <> reported_user_id",
            name="ck_reports_different_users",
        ),
        CheckConstraint(
            "reason IN ('HARASSMENT', 'SPAM', 'INAPPROPRIATE_BEHAVIOR', 'OTHER')",
            name="ck_reports_reason",
        ),
        CheckConstraint(
            "status IN ('PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED')",
            name="ck_reports_status",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    reporter_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    reported_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    reviewed_by_admin_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    reason: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    details: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        server_default=text("'PENDING'"),
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    reviewed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )