import os
import logging
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

import uvicorn
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, DateTime, Float, Integer, ForeignKey, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.dialects.postgresql import UUID
import pandas as pd
import numpy as np
from pydantic import BaseModel
import matplotlib.pyplot as plt
import seaborn as sns
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("analytics.log"),
    ],
)
logger = logging.getLogger("analytics-service")

# Database configuration
DB_HOST = os.getenv("DB_HOST", "postgres")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "admin")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_NAME = os.getenv("DB_NAME", "erp_analytics")

# Create SQLAlchemy engine
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define SQLAlchemy models
class AnalyticsData(Base):
    __tablename__ = "analytics_data"
    
    id = Column(UUID, primary_key=True, server_default=text("gen_random_uuid()"))
    source = Column(String, nullable=False)
    data_type = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    value = Column(Float)
    dimension = Column(String)
    dimension_value = Column(String)

class KPI(Base):
    __tablename__ = "kpis"
    
    id = Column(UUID, primary_key=True, server_default=text("gen_random_uuid()"))
    name = Column(String, nullable=False, unique=True)
    description = Column(String)
    current_value = Column(Float)
    target_value = Column(Float)
    unit = Column(String)
    last_updated = Column(DateTime, default=datetime.utcnow)

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(UUID, primary_key=True, server_default=text("gen_random_uuid()"))
    name = Column(String, nullable=False)
    description = Column(String)
    query = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    schedule = Column(String)  # cron expression

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models for request/response
class AnalyticsDataCreate(BaseModel):
    source: str
    data_type: str
    value: float
    dimension: Optional[str] = None
    dimension_value: Optional[str] = None

class AnalyticsDataResponse(BaseModel):
    id: str
    source: str
    data_type: str
    timestamp: datetime
    value: float
    dimension: Optional[str] = None
    dimension_value: Optional[str] = None
    
    class Config:
        orm_mode = True

class KPICreate(BaseModel):
    name: str
    description: Optional[str] = None
    current_value: float
    target_value: float
    unit: Optional[str] = None

class KPIResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    current_value: float
    target_value: float
    unit: Optional[str] = None
    last_updated: datetime
    
    class Config:
        orm_mode = True

class ReportCreate(BaseModel):
    name: str
    description: Optional[str] = None
    query: str
    schedule: Optional[str] = None

class ReportResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    query: str
    created_at: datetime
    updated_at: datetime
    schedule: Optional[str] = None
    
    class Config:
        orm_mode = True

class DashboardData(BaseModel):
    kpis: List[KPIResponse]
    sales_trend: Dict[str, Any]
    top_products: Dict[str, Any]
    customer_growth: Dict[str, Any]

# Create FastAPI app
app = FastAPI(title="Analytics Service", description="API for ERP system analytics")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "analytics-service"}

# Analytics data endpoints
@app.post("/api/analytics/data", response_model=AnalyticsDataResponse)
def create_analytics_data(data: AnalyticsDataCreate, db: Session = Depends(get_db)):
    db_data = AnalyticsData(
        source=data.source,
        data_type=data.data_type,
        value=data.value,
        dimension=data.dimension,
        dimension_value=data.dimension_value
    )
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    return db_data

@app.get("/api/analytics/data", response_model=List[AnalyticsDataResponse])
def get_analytics_data(
    source: Optional[str] = None,
    data_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    dimension: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(AnalyticsData)
    
    if source:
        query = query.filter(AnalyticsData.source == source)
    if data_type:
        query = query.filter(AnalyticsData.data_type == data_type)
    if start_date:
        query = query.filter(AnalyticsData.timestamp >= start_date)
    if end_date:
        query = query.filter(AnalyticsData.timestamp <= end_date)
    if dimension:
        query = query.filter(AnalyticsData.dimension == dimension)
    
    return query.all()

# KPI endpoints
@app.post("/api/kpis", response_model=KPIResponse)
def create_kpi(kpi: KPICreate, db: Session = Depends(get_db)):
    db_kpi = KPI(
        name=kpi.name,
        description=kpi.description,
        current_value=kpi.current_value,
        target_value=kpi.target_value,
        unit=kpi.unit
    )
    db.add(db_kpi)
    db.commit()
    db.refresh(db_kpi)
    return db_kpi

@app.get("/api/kpis", response_model=List[KPIResponse])
def get_kpis(db: Session = Depends(get_db)):
    return db.query(KPI).all()

@app.put("/api/kpis/{kpi_id}", response_model=KPIResponse)
def update_kpi(kpi_id: str, kpi: KPICreate, db: Session = Depends(get_db)):
    db_kpi = db.query(KPI).filter(KPI.id == kpi_id).first()
    if not db_kpi:
        raise HTTPException(status_code=404, detail="KPI not found")
    
    db_kpi.name = kpi.name
    db_kpi.description = kpi.description
    db_kpi.current_value = kpi.current_value
    db_kpi.target_value = kpi.target_value
    db_kpi.unit = kpi.unit
    db_kpi.last_updated = datetime.utcnow()
    
    db.commit()
    db.refresh(db_kpi)
    return db_kpi

# Report endpoints
@app.post("/api/reports", response_model=ReportResponse)
def create_report(report: ReportCreate, db: Session = Depends(get_db)):
    db_report = Report(
        name=report.name,
        description=report.description,
        query=report.query,
        schedule=report.schedule
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

@app.get("/api/reports", response_model=List[ReportResponse])
def get_reports(db: Session = Depends(get_db)):
    return db.query(Report).all()

@app.get("/api/reports/{report_id}/run")
def run_report(report_id: str, db: Session = Depends(get_db)):
    db_report = db.query(Report).filter(Report.id == report_id).first()
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    try:
        # Execute the report query
        result = db.execute(text(db_report.query))
        columns = result.keys()
        data = [dict(zip(columns, row)) for row in result.fetchall()]
        return {"name": db_report.name, "data": data}
    except Exception as e:
        logger.error(f"Error running report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error running report: {str(e)}")

# Overview endpoint for business metrics
@app.get("/api/overview")
def get_business_overview(
    timeframe: str = Query("month", description="Timeframe for overview data: day, week, month, year"),
    db: Session = Depends(get_db)
):
    """Get business overview metrics including revenue, orders, customers, and products."""
    
    # Calculate date range based on timeframe
    end_date = datetime.utcnow()
    if timeframe == "day":
        start_date = end_date - timedelta(days=1)
        previous_start = start_date - timedelta(days=1)
        previous_end = start_date
    elif timeframe == "week":
        start_date = end_date - timedelta(weeks=1)
        previous_start = start_date - timedelta(weeks=1)
        previous_end = start_date
    elif timeframe == "year":
        start_date = end_date - timedelta(days=365)
        previous_start = start_date - timedelta(days=365)
        previous_end = start_date
    else:  # Default to month
        start_date = end_date - timedelta(days=30)
        previous_start = start_date - timedelta(days=30)
        previous_end = start_date
    
    # Mock data for business overview (in real implementation, this would query actual data)
    current_revenue = round(np.random.normal(50000, 10000), 2)
    previous_revenue = round(np.random.normal(45000, 8000), 2)
    revenue_trend = round(((current_revenue - previous_revenue) / previous_revenue) * 100, 2)
    
    current_orders = np.random.randint(100, 500)
    previous_orders = np.random.randint(80, 450)
    orders_trend = round(((current_orders - previous_orders) / previous_orders) * 100, 2)
    
    current_customers = np.random.randint(50, 200)
    previous_customers = np.random.randint(40, 180)
    customers_trend = round(((current_customers - previous_customers) / previous_customers) * 100, 2)
    
    current_products = np.random.randint(20, 100)
    previous_products = np.random.randint(18, 95)
    products_trend = round(((current_products - previous_products) / previous_products) * 100, 2)
    
    # Sales trend data for chart
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    sales_values = np.random.normal(1000, 200, size=len(dates))
    sales_trend_data = [
        {"date": d.strftime("%Y-%m-%d"), "value": round(v, 2)}
        for d, v in zip(dates, sales_values)
    ]
    
    return {
        "revenue": {
            "current": current_revenue,
            "trend": revenue_trend,
            "currency": "UAH"
        },
        "orders": {
            "current": current_orders,
            "trend": orders_trend
        },
        "customers": {
            "current": current_customers,
            "trend": customers_trend
        },
        "products": {
            "current": current_products,
            "trend": products_trend
        },
        "sales_trend": sales_trend_data,
        "timeframe": timeframe,
        "period": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        }
    }

# Dashboard endpoint
@app.get("/api/dashboard", response_model=DashboardData)
def get_dashboard_data(
    period: str = Query("month", description="Period for dashboard data: day, week, month, year"),
    db: Session = Depends(get_db)
):
    # Get KPIs
    kpis = db.query(KPI).all()
    
    # Calculate date range based on period
    end_date = datetime.utcnow()
    if period == "day":
        start_date = end_date - timedelta(days=1)
    elif period == "week":
        start_date = end_date - timedelta(weeks=1)
    elif period == "year":
        start_date = end_date - timedelta(days=365)
    else:  # Default to month
        start_date = end_date - timedelta(days=30)
    
    # Mock data for sales trend
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    sales_values = np.random.normal(1000, 200, size=len(dates))
    sales_trend = {
        "dates": [d.strftime("%Y-%m-%d") for d in dates],
        "values": [round(v, 2) for v in sales_values]
    }
    
    # Mock data for top products
    product_names = ["Product A", "Product B", "Product C", "Product D", "Product E"]
    product_values = sorted(np.random.normal(500, 100, size=5), reverse=True)
    top_products = {
        "names": product_names,
        "values": [round(v, 2) for v in product_values]
    }
    
    # Mock data for customer growth
    months = pd.date_range(start=end_date - timedelta(days=180), end=end_date, freq='M')
    customer_counts = np.cumsum(np.random.randint(5, 20, size=len(months)))
    customer_growth = {
        "months": [m.strftime("%Y-%m") for m in months],
        "counts": [int(c) for c in customer_counts]
    }
    
    return {
        "kpis": kpis,
        "sales_trend": sales_trend,
        "top_products": top_products,
        "customer_growth": customer_growth
    }

# Run the application
if __name__ == "__main__":
    port = int(os.getenv("PORT", "8006"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
