from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func # For default timestamp

from .db_session import Base  # Import Base from our database setup

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True) # Optional: Can be used to deactivate accounts

    # Relationship to Chatbots owned by the user
    chatbots = relationship("Chatbot", back_populates="owner")

class Chatbot(Base):
    __tablename__ = "chatbots"

    id = Column(String, primary_key=True, index=True) # Using the generated chatbot_id as primary key
    name = Column(String, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="chatbots")
