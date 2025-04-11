from sqlalchemy.orm import Session

from . import models, schemas
from .utils.password_utils import get_password_hash

# --- User CRUD Operations ---

def get_user_by_email(db: Session, email: str):
    """Fetches a single user by their email address."""
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    """Creates a new user in the database."""
    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Chatbot CRUD Operations ---

def create_db_chatbot(db: Session, chatbot: schemas.ChatbotCreateDB):
    """Creates a new chatbot record in the database."""
    db_chatbot = models.Chatbot(**chatbot.model_dump()) # Use model_dump for Pydantic v2
    db.add(db_chatbot)
    db.commit()
    db.refresh(db_chatbot)
    return db_chatbot

def get_user_chatbots(db: Session, user_id: int):
    """Fetches all chatbots owned by a specific user."""
    return db.query(models.Chatbot).filter(models.Chatbot.user_id == user_id).all()

# --- Other CRUD operations can be added later (e.g., for chatbots) ---
