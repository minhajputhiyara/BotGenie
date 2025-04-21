from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, JSON
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
    sessions = relationship("ChatSession", back_populates="chatbot")

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(String, primary_key=True, index=True)
    chatbot_id = Column(String, ForeignKey("chatbots.id"), nullable=False)
    user_identifier = Column(String, index=True)  # Could be email, IP, or session ID
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    chatbot = relationship("Chatbot", back_populates="sessions")
    messages = relationship("ChatMessage", back_populates="session")
    insight = relationship("Insight", uselist=False, back_populates="session")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("chat_sessions.id"), nullable=False)
    role = Column(String, nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    session = relationship("ChatSession", back_populates="messages")

class Insight(Base):
    __tablename__ = "insights"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("chat_sessions.id"), unique=True, nullable=False)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    problem_summary = Column(Text, nullable=True)
    bot_solved = Column(Boolean, nullable=True)
    human_needed = Column(Boolean, nullable=True)
    emotion = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    session = relationship("ChatSession", back_populates="insight")
