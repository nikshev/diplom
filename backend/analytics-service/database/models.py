"""
Database models for analytics service
"""

import uuid
from sqlalchemy import Column, String, Text, DateTime, Date, Integer, Float, Boolean, ForeignKey, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.connection import Base

class Report(Base):
    """Report model for storing report definitions"""
    __tablename__ = 'reports'
    __table_args__ = {'schema': 'analytics_service'}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    type = Column(String(50), nullable=False)
    parameters = Column(JSONB)
    created_by = Column(UUID(as_uuid=True), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    executions = relationship("ReportExecution", back_populates="report", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Report(id='{self.id}', name='{self.name}', type='{self.type}')>"


class ReportExecution(Base):
    """ReportExecution model for storing report execution results"""
    __tablename__ = 'report_executions'
    __table_args__ = {'schema': 'analytics_service'}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id = Column(UUID(as_uuid=True), ForeignKey('analytics_service.reports.id'), nullable=False)
    parameters = Column(JSONB)
    result = Column(JSONB)
    status = Column(String(50), nullable=False)
    executed_by = Column(UUID(as_uuid=True), nullable=False)
    started_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime)
    
    # Relationships
    report = relationship("Report", back_populates="executions")
    
    def __repr__(self):
        return f"<ReportExecution(id='{self.id}', report_id='{self.report_id}', status='{self.status}')>"


class KpiMetric(Base):
    """KpiMetric model for storing KPI metric definitions"""
    __tablename__ = 'kpi_metrics'
    __table_args__ = {'schema': 'analytics_service'}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    category = Column(String(50), nullable=False)
    calculation_query = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    values = relationship("KpiValue", back_populates="metric", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<KpiMetric(id='{self.id}', name='{self.name}', category='{self.category}')>"


class KpiValue(Base):
    """KpiValue model for storing KPI metric values"""
    __tablename__ = 'kpi_values'
    __table_args__ = {'schema': 'analytics_service'}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    metric_id = Column(UUID(as_uuid=True), ForeignKey('analytics_service.kpi_metrics.id'), nullable=False)
    value = Column(Float, nullable=False)
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    metric = relationship("KpiMetric", back_populates="values")
    
    def __repr__(self):
        return f"<KpiValue(id='{self.id}', metric_id='{self.metric_id}', value={self.value})>"
