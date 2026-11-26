"""Phase 3: add tariff_type column to rentals for weekend tariff support

Revision ID: 003_phase3_weekend_tariff
Revises: 002_phase2_full_model
Create Date: 2026-11-26 20:10:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '003_phase3_weekend_tariff'
down_revision: Union[str, None] = '002_phase2_full_model'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('rentals', schema=None) as batch_op:
        batch_op.add_column(sa.Column('tariff_type', sa.String(length=30), nullable=False, server_default='STANDARD'))


def downgrade() -> None:
    with op.batch_alter_table('rentals', schema=None) as batch_op:
        batch_op.drop_column('tariff_type')
