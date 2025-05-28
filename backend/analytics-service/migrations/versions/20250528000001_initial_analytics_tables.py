"""Initial analytics tables

Revision ID: 20250528000001
Revises: 
Create Date: 2025-05-28 00:00:01.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250528000001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create reports table
    op.create_table('reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('parameters', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        schema='analytics_service'
    )
    op.create_index(op.f('ix_analytics_service_reports_type'), 'reports', ['type'], unique=False, schema='analytics_service')
    
    # Create report_executions table
    op.create_table('report_executions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('report_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('parameters', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('result', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('executed_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('started_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['report_id'], ['analytics_service.reports.id'], ),
        sa.PrimaryKeyConstraint('id'),
        schema='analytics_service'
    )
    op.create_index(op.f('ix_analytics_service_report_executions_report_id'), 'report_executions', ['report_id'], unique=False, schema='analytics_service')
    op.create_index(op.f('ix_analytics_service_report_executions_status'), 'report_executions', ['status'], unique=False, schema='analytics_service')
    
    # Create kpi_metrics table
    op.create_table('kpi_metrics',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('calculation_query', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        schema='analytics_service'
    )
    op.create_index(op.f('ix_analytics_service_kpi_metrics_category'), 'kpi_metrics', ['category'], unique=False, schema='analytics_service')
    
    # Create kpi_values table
    op.create_table('kpi_values',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('metric_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('value', sa.Float(), nullable=False),
        sa.Column('period_start', sa.Date(), nullable=False),
        sa.Column('period_end', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['metric_id'], ['analytics_service.kpi_metrics.id'], ),
        sa.PrimaryKeyConstraint('id'),
        schema='analytics_service'
    )
    op.create_index(op.f('ix_analytics_service_kpi_values_metric_id'), 'kpi_values', ['metric_id'], unique=False, schema='analytics_service')
    op.create_index(op.f('ix_analytics_service_kpi_values_period_start_end'), 'kpi_values', ['period_start', 'period_end'], unique=False, schema='analytics_service')


def downgrade():
    # Drop tables in reverse order
    op.drop_table('kpi_values', schema='analytics_service')
    op.drop_table('kpi_metrics', schema='analytics_service')
    op.drop_table('report_executions', schema='analytics_service')
    op.drop_table('reports', schema='analytics_service')
