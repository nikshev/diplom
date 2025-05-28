"""
Alembic environment configuration for database migrations
"""

from logging.config import fileConfig
import os
import sys
from alembic import context
from sqlalchemy import engine_from_config, pool

# Add parent directory to path to import from database package
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import Base, get_database_url
from database.models import *  # Import all models to ensure they are registered with Base

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set the schema name
schema = 'analytics_service'

# Set target metadata
target_metadata = Base.metadata

# Override the SQLAlchemy URL with our own
config.set_main_option('sqlalchemy.url', get_database_url())

def run_migrations_offline():
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        version_table_schema=schema,
        include_schemas=True
    )

    with context.begin_transaction():
        # Create schema if it doesn't exist
        context.execute(f'CREATE SCHEMA IF NOT EXISTS {schema}')
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        # Create schema if it doesn't exist
        connection.execute(f'CREATE SCHEMA IF NOT EXISTS {schema}')
        
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            version_table_schema=schema,
            include_schemas=True
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
