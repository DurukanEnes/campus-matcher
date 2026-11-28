"""Add category relationship to venues

Revision ID: c06ba3508c86
Revises: a7f1c252278a
Create Date: 2026-11-28 14:07:25.401675

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'c06ba3508c86'
down_revision: str | Sequence[str] | None = 'a7f1c252278a'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "venues",
        sa.Column("category_id", sa.Integer(), nullable=False),
    )
    op.create_foreign_key(
        "fk_venues_category_id_categories",
        "venues",
        "categories",
        ["category_id"],
        ["id"],
        ondelete="RESTRICT",
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_venues_category_id_categories",
        "venues",
        type_="foreignkey",
    )
    op.drop_column("venues", "category_id")