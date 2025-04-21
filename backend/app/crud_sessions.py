from sqlalchemy.orm import Session
import uuid
from datetime import datetime, timedelta
from typing import List, Optional

from . import models, schemas

# Session management functions
def create_chat_session(db: Session, session_data: schemas.ChatSessionCreate) -> models.ChatSession:
    """Create a new chat session"""
    session_id = str(uuid.uuid4())
    db_session = models.ChatSession(
        id=session_id,
        chatbot_id=session_data.chatbot_id,
        user_identifier=session_data.user_identifier
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def get_chat_session(db: Session, session_id: str) -> Optional[models.ChatSession]:
    """Get a chat session by ID"""
    return db.query(models.ChatSession).filter(models.ChatSession.id == session_id).first()

def get_active_session_by_user(db: Session, chatbot_id: str, user_identifier: str) -> Optional[models.ChatSession]:
    """Get the active session for a user with a specific chatbot"""
    return db.query(models.ChatSession).filter(
        models.ChatSession.chatbot_id == chatbot_id,
        models.ChatSession.user_identifier == user_identifier,
        models.ChatSession.is_active == True
    ).first()

def update_session_activity(db: Session, session_id: str) -> models.ChatSession:
    """Update the last activity timestamp for a session"""
    db_session = get_chat_session(db, session_id)
    if db_session:
        db_session.last_activity = datetime.now()
        db.commit()
        db.refresh(db_session)
    return db_session

def close_session(db: Session, session_id: str) -> models.ChatSession:
    """Mark a session as inactive"""
    db_session = get_chat_session(db, session_id)
    if db_session:
        db_session.is_active = False
        db.commit()
        db.refresh(db_session)
    return db_session

def get_inactive_sessions(db: Session, timeout_minutes: int = 1) -> List[models.ChatSession]:
    """Get all sessions that have been inactive for longer than the timeout period"""
    timeout_threshold = datetime.now() - timedelta(minutes=timeout_minutes)
    return db.query(models.ChatSession).filter(
        models.ChatSession.is_active == True,
        models.ChatSession.last_activity < timeout_threshold
    ).all()

# Message management functions
def add_message_to_session(db: Session, session_id: str, message_data: schemas.ChatMessageCreate) -> models.ChatMessage:
    """Add a new message to a chat session"""
    db_message = models.ChatMessage(
        session_id=session_id,
        role=message_data.role,
        content=message_data.content
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_session_messages(db: Session, session_id: str) -> List[models.ChatMessage]:
    """Get all messages for a specific session"""
    return db.query(models.ChatMessage).filter(
        models.ChatMessage.session_id == session_id
    ).order_by(models.ChatMessage.timestamp).all()

# Insight management functions
def create_insight(db: Session, insight_data: schemas.InsightCreate) -> models.Insight:
    """Create a new insight entry from session analysis"""
    db_insight = models.Insight(
        session_id=insight_data.session_id,
        name=insight_data.name,
        email=insight_data.email,
        problem_summary=insight_data.problem_summary,
        bot_solved=insight_data.bot_solved,
        human_needed=insight_data.human_needed,
        emotion=insight_data.emotion
    )
    db.add(db_insight)
    db.commit()
    db.refresh(db_insight)
    return db_insight

def get_all_insights(db: Session, skip: int = 0, limit: int = 100) -> List[models.Insight]:
    """Get all insights with pagination"""
    return db.query(models.Insight).offset(skip).limit(limit).all()

def get_insight_by_session(db: Session, session_id: str) -> Optional[models.Insight]:
    """Get insight for a specific session"""
    return db.query(models.Insight).filter(models.Insight.session_id == session_id).first()
