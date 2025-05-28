"""
Database connection module for analytics service
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.schema import CreateSchema
from sqlalchemy.exc import ProgrammingError
from contextlib import contextmanager

# Base class for all models
Base = declarative_base()

def get_database_url():
    """Get database URL from environment variables"""
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_name = os.getenv('DB_NAME', 'erp_system')
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', 'postgres')
    
    return f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

def create_engine_with_schema(schema_name='analytics_service'):
    """Create SQLAlchemy engine with schema"""
    db_url = get_database_url()
    engine = create_engine(
        db_url,
        pool_size=10,
        max_overflow=20,
        pool_recycle=3600,
        pool_pre_ping=True,
        connect_args={'options': f'-c search_path={schema_name},public'}
    )
    
    # Create schema if it doesn't exist
    try:
        with engine.connect() as connection:
            connection.execute(CreateSchema(schema_name, if_not_exists=True))
            print(f"Schema '{schema_name}' created or already exists")
    except ProgrammingError as e:
        print(f"Error creating schema '{schema_name}': {e}")
    
    return engine

# Create engine and session factory
engine = create_engine_with_schema()
SessionFactory = sessionmaker(bind=engine)

@contextmanager
def get_db_session():
    """Context manager for database sessions"""
    session = SessionFactory()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()

def init_db():
    """Initialize database by creating all tables"""
    # Import all models to ensure they are registered with Base
    from database import models
    
    # Create all tables
    Base.metadata.create_all(engine)
    print("Database tables created")
