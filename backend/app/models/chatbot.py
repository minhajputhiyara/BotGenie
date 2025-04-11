from pydantic import BaseModel
from typing import List, Optional

class ChatbotCreate(BaseModel):
    business_name: str
    business_type: str
    chatbot_name: str
    chatbot_type: str
    
class ChatbotQuery(BaseModel):
    question: str
    
class ChatbotResponse(BaseModel):
    answer: str
    sources: List[dict]
    confidence: float
