"""Phase 2 full data model: categories, customers, rentals, rental_items (M:N), service_records

Revision ID: 002_phase2_full_model
Revises: 001_initial_equipment
Create Date: 2026-11-26 19:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '002_phase2_full_model'
down_revision: Union[str, None] = '001_initial_equipment'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'categories',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('default_daily_rate', sa.Float(), nullable=False, server_default='250.0'),
        sa.Column('default_deposit', sa.Float(), nullable=False, server_default='1000.0'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_categories_id'), 'categories', ['id'], unique=False)
    op.create_index(op.f('ix_categories_code'), 'categories', ['code'], unique=True)

    with op.batch_alter_table('equipment_items', schema=None) as batch_op:
        batch_op.add_column(sa.Column('category_id', sa.Integer(), nullable=True))
        batch_op.create_index(op.f('ix_equipment_items_category_id'), ['category_id'], unique=False)
        batch_op.create_foreign_key('fk_equipment_items_category_id', 'categories', ['category_id'], ['id'])

    op.create_table(
        'customers',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('phone', sa.String(length=30), nullable=False),
        sa.Column('email', sa.String(length=150), nullable=True),
        sa.Column('id_card_number', sa.String(length=50), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_customers_id'), 'customers', ['id'], unique=False)
    op.create_index(op.f('ix_customers_name'), 'customers', ['name'], unique=False)
    op.create_index(op.f('ix_customers_phone'), 'customers', ['phone'], unique=False)
    op.create_index(op.f('ix_customers_id_card_number'), 'customers', ['id_card_number'], unique=True)

    op.create_table(
        'rentals',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('rental_start', sa.DateTime(), nullable=False),
        sa.Column('rental_end', sa.DateTime(), nullable=False),
        sa.Column('total_deposit', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('discount_amount', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('total_price', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_rentals_id'), 'rentals', ['id'], unique=False)
    op.create_index(op.f('ix_rentals_customer_id'), 'rentals', ['customer_id'], unique=False)
    op.create_index(op.f('ix_rentals_rental_start'), 'rentals', ['rental_start'], unique=False)
    op.create_index(op.f('ix_rentals_rental_end'), 'rentals', ['rental_end'], unique=False)
    op.create_index(op.f('ix_rentals_status'), 'rentals', ['status'], unique=False)

    op.create_table(
        'rental_items',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('rental_id', sa.Integer(), nullable=False),
        sa.Column('equipment_item_id', sa.Integer(), nullable=False),
        sa.Column('agreed_daily_rate', sa.Float(), nullable=False),
        sa.Column('agreed_deposit', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('returned_at', sa.DateTime(), nullable=True),
        sa.Column('late_penalty', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('item_return_condition', sa.String(length=50), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['equipment_item_id'], ['equipment_items.id']),
        sa.ForeignKeyConstraint(['rental_id'], ['rentals.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_rental_items_id'), 'rental_items', ['id'], unique=False)
    op.create_index(op.f('ix_rental_items_rental_id'), 'rental_items', ['rental_id'], unique=False)
    op.create_index(op.f('ix_rental_items_equipment_item_id'), 'rental_items', ['equipment_item_id'], unique=False)

    op.create_table(
        'service_records',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('equipment_item_id', sa.Integer(), nullable=False),
        sa.Column('service_start', sa.DateTime(), nullable=False),
        sa.Column('service_end', sa.DateTime(), nullable=True),
        sa.Column('issue_description', sa.Text(), nullable=False),
        sa.Column('resolution_notes', sa.Text(), nullable=True),
        sa.Column('cost', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['equipment_item_id'], ['equipment_items.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_service_records_id'), 'service_records', ['id'], unique=False)
    op.create_index(op.f('ix_service_records_equipment_item_id'), 'service_records', ['equipment_item_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_service_records_equipment_item_id'), table_name='service_records')
    op.drop_index(op.f('ix_service_records_id'), table_name='service_records')
    op.drop_table('service_records')

    op.drop_index(op.f('ix_rental_items_equipment_item_id'), table_name='rental_items')
    op.drop_index(op.f('ix_rental_items_rental_id'), table_name='rental_items')
    op.drop_index(op.f('ix_rental_items_id'), table_name='rental_items')
    op.drop_table('rental_items')

    op.drop_index(op.f('ix_rentals_status'), table_name='rentals')
    op.drop_index(op.f('ix_rentals_rental_end'), table_name='rentals')
    op.drop_index(op.f('ix_rentals_rental_start'), table_name='rentals')
    op.drop_index(op.f('ix_rentals_customer_id'), table_name='rentals')
    op.drop_index(op.f('ix_rentals_id'), table_name='rentals')
    op.drop_table('rentals')

    op.drop_index(op.f('ix_customers_id_card_number'), table_name='customers')
    op.drop_index(op.f('ix_customers_phone'), table_name='customers')
    op.drop_index(op.f('ix_customers_name'), table_name='customers')
    op.drop_index(op.f('ix_customers_id'), table_name='customers')
    op.drop_table('customers')

    with op.batch_alter_table('equipment_items', schema=None) as batch_op:
        batch_op.drop_constraint('fk_equipment_items_category_id', type_='foreignkey')
        batch_op.drop_index(op.f('ix_equipment_items_category_id'))
        batch_op.drop_column('category_id')

    op.drop_index(op.f('ix_categories_code'), table_name='categories')
    op.drop_index(op.f('ix_categories_id'), table_name='categories')
    op.drop_table('categories')
