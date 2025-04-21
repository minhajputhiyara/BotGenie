from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- User Schemas ---

class UserBase(BaseModel):
    email: EmailStr

# Schema for creating a user (requires password)
class UserCreate(UserBase):
    password: str

# Forward declaration for relationship typing
class Chatbot(BaseModel):
    id: str
    name: str
    created_at: datetime
    user_id: int

    class Config:
        # Use from_attributes instead of orm_mode for Pydantic v2
        # orm_mode = True
        from_attributes = True

# Schema for reading user data (includes fields from DB model and related chatbots)
class User(UserBase):
    id: int
    is_active: bool
    chatbots: List[Chatbot] = [] # Add relationship to chatbots

    class Config:
        # Use from_attributes instead of orm_mode for Pydantic v2
        # orm_mode = True
        from_attributes = True

# --- Token Schemas (for JWT later) ---

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Chatbot Schemas ---

class ChatbotBase(BaseModel):
    name: str
    # Add other base fields if needed, e.g., description

class ChatbotCreateDB(ChatbotBase):
    id: str # The generated UUID string
    user_id: int # Foreign key

# Now properly define Chatbot schema inheriting from Base
class Chatbot(ChatbotBase): # Inherit name from ChatbotBase
    id: str
    created_at: datetime
    user_id: int

    class Config:
        # Use from_attributes instead of orm_mode for Pydantic v2
        # orm_mode = True
        from_attributes = True

# --- Chat Session Schemas ---

class ChatMessageBase(BaseModel):
    role: str
    content: str

class ChatMessage(ChatMessageBase):
    id: int
    session_id: str
    timestamp: datetime

    class Config:
        from_attributes = True

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatSessionBase(BaseModel):
    chatbot_id: str
    user_identifier: str

class ChatSession(ChatSessionBase):
    id: str
    started_at: datetime
    last_activity: datetime
    is_active: bool
    messages: List[ChatMessage] = []

    class Config:
        from_attributes = True

class ChatSessionCreate(ChatSessionBase):
    pass

# --- Insight Schemas ---

class InsightBase(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    problem_summary: Optional[str] = None
    bot_solved: Optional[bool] = None
    human_needed: Optional[bool] = None
    emotion: Optional[str] = None

class Insight(InsightBase):
    id: int
    session_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class InsightCreate(InsightBase):
    session_id: str

# Ensure User schema definition comes after Chatbot definition or use forward refs
# The forward declaration above handles this.
