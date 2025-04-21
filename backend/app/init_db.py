from .db_session import engine, Base
from . import models

def init_db():
    """Create all tables defined in models.py"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
