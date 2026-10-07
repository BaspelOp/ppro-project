"""Initial migration: equipment_items table

Revision ID: 001_initial_equipment
Revises: 
Create Date: 2026-10-07 15:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '001_initial_equipment'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'equipment_items',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('inventory_number', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('size', sa.String(length=50), nullable=False),
        sa.Column('purchase_year', sa.Integer(), nullable=False),
        sa.Column('daily_rate', sa.Float(), nullable=False),
        sa.Column('deposit', sa.Float(), nullable=False),
        sa.Column('condition', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('service_notes', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_equipment_items_id'), 'equipment_items', ['id'], unique=False)
    op.create_index(op.f('ix_equipment_items_inventory_number'), 'equipment_items', ['inventory_number'], unique=True)
    op.create_index(op.f('ix_equipment_items_category'), 'equipment_items', ['category'], unique=False)
    op.create_index(op.f('ix_equipment_items_status'), 'equipment_items', ['status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_equipment_items_status'), table_name='equipment_items')
    op.drop_index(op.f('ix_equipment_items_category'), table_name='equipment_items')
    op.drop_index(op.f('ix_equipment_items_inventory_number'), table_name='equipment_items')
    op.drop_index(op.f('ix_equipment_items_id'), table_name='equipment_items')
    op.drop_table('equipment_items')
