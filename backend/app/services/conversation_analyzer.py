import httpx
import os
from typing import List, Dict, Any, Optional
from ..schemas import ChatMessage, InsightCreate
import json
import re

class ConversationAnalyzer:
    """Service to analyze chat conversations and extract insights using LLM"""
    
    def __init__(self):
        self.api_key = os.getenv('GROQ_API_KEY')
        if not self.api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        
        self.emotions = [
            "admiration", "amusement", "anger", "annoyance", "approval", "caring", 
            "confusion", "curiosity", "desire", "disappointment", "disapproval", 
            "disgust", "embarrassment", "excitement", "fear", "gratitude", "grief", 
            "joy", "love", "nervousness", "optimism", "pride", "realization", 
            "relief", "remorse", "sadness", "surprise", "neutral"
        ]
    
    async def analyze_conversation(self, session_id: str, messages: List[ChatMessage]) -> Optional[InsightCreate]:
        """
        Analyze a conversation and extract insights
        
        Args:
            session_id: The ID of the chat session
            messages: List of messages in the conversation
            
        Returns:
            InsightCreate object with extracted insights
        """
        print(f"\n===== ANALYZING CONVERSATION FOR SESSION {session_id} =====")
        if not messages:
            print("No messages to analyze")
            return None
            
        # Format messages for the LLM
        formatted_messages = []
        user_email = "testuser@gmail.com"  # Default email
        user_name = "testuser"  # Default name
        
        for msg in messages:
            formatted_messages.append({
                "role": msg.role,
                "content": msg.content
            })
            
            # Try to extract email and name from user messages if available
            if msg.role == "user":
                # Simple email extraction - can be improved
                email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', msg.content)
                if email_match:
                    user_email = email_match.group(0)
                    print(f"Extracted email: {user_email}")
                
                # Try to find a name (this is very basic - could be improved)
                name_match = re.search(r'(?:my name is|I am|I\'m) ([A-Z][a-z]+(?: [A-Z][a-z]+)?)', msg.content)
                if name_match:
                    user_name = name_match.group(1)
                    print(f"Extracted name: {user_name}")
        
        # Create the system prompt for analysis
        system_prompt = """
        You are an AI assistant that analyzes customer service conversations.
        Extract the following information from the conversation:
        1. Problem Summary: A brief summary of the customer's issue or query
        2. Bot Solved: Whether the bot successfully resolved the customer's issue (true/false)
        3. Human Needed: Whether the customer explicitly or implicitly requested human assistance (true/false)
        4. Emotion: The primary emotion exhibited by the customer from this list: admiration, amusement, anger, annoyance, approval, caring, confusion, curiosity, desire, disappointment, disapproval, disgust, embarrassment, excitement, fear, gratitude, grief, joy, love, nervousness, optimism, pride, realization, relief, remorse, sadness, surprise, neutral
        
        Format your response as a JSON object with these fields.
        """
        
        print(f"Formatted {len(formatted_messages)} messages for analysis")
        
        # Create the conversation for the LLM
        conversation = [
            {"role": "system", "content": system_prompt},
            *formatted_messages,
            {"role": "user", "content": "Please analyze this conversation and provide the requested information in JSON format."}
        ]
        
        try:
            print("Sending request to Groq API...")
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama3-70b-8192",
                        "messages": conversation,
                        "temperature": 0.2,
                        "max_tokens": 500,
                    },
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    print(f"Error from LLM API: {response.status_code} - {response.text}")
                    return self._create_default_insight(session_id, user_name, user_email)
                
                result = response.json()
                analysis_text = result["choices"][0]["message"]["content"]
                print(f"Received analysis from LLM: {analysis_text[:200]}...")
                
                # Extract JSON from the response
                analysis = self._extract_json_from_text(analysis_text)
                if not analysis:
                    return self._create_default_insight(session_id, user_name, user_email)
                
                # Print the extracted analysis
                print("\nExtracted analysis:")
                for key, value in analysis.items():
                    print(f"  {key}: {value}")
                
                # Create the insight
                problem_summary = analysis.get("Problem Summary") or analysis.get("problem_summary")
                bot_solved = analysis.get("Bot Solved") or analysis.get("bot_solved")
                human_needed = analysis.get("Human Needed") or analysis.get("human_needed")
                emotion = analysis.get("Emotion") or analysis.get("emotion")
                
                # Enforce logical consistency between bot_solved and human_needed
                # If bot solved is True, human needed must be False
                # If human needed is True, bot solved must be False
                if bot_solved is True:
                    human_needed = False
                elif human_needed is True:
                    bot_solved = False
                
                # Use default values for name and email if not detected
                if not user_name:
                    user_name = "testuser"
                if not user_email:
                    user_email = "testuser@gmail.com"
                
                insight = InsightCreate(
                    session_id=session_id,
                    name=user_name,
                    email=user_email,
                    problem_summary=problem_summary,
                    bot_solved=bot_solved,
                    human_needed=human_needed,
                    emotion=emotion
                )
                
                print("\nCreated insight object:")
                print(f"  Session ID: {insight.session_id}")
                print(f"  Name: {insight.name}")
                print(f"  Email: {insight.email}")
                print(f"  Problem Summary: {insight.problem_summary}")
                print(f"  Bot Solved: {insight.bot_solved}")
                print(f"  Human Needed: {insight.human_needed}")
                print(f"  Emotion: {insight.emotion}")
                
                return insight
                
        except (httpx.ConnectTimeout, httpx.ConnectError, httpx.ReadTimeout) as e:
            print(f"API Connection Error: {str(e)}")
            return self._create_default_insight(session_id, user_name, user_email)
        except Exception as e:
            print(f"Error analyzing conversation: {str(e)}")
            return self._create_default_insight(session_id, user_name, user_email)
    
    def _extract_json_from_text(self, text: str) -> Dict[str, Any]:
        """Extract JSON from text that might contain markdown formatting"""
        try:
            # Try to parse the entire response as JSON
            analysis = json.loads(text)
            print("Successfully parsed JSON response")
            return analysis
        except json.JSONDecodeError:
            # If that fails, try to extract JSON from the text
            print("Failed to parse response as JSON, trying to extract JSON from text")
            
            # Try to match JSON within triple backticks (```json ... ```)
            json_match = re.search(r'```(?:json)?\s*(.*?)\s*```', text, re.DOTALL)
            if json_match:
                try:
                    json_content = json_match.group(1)
                    print(f"Extracted JSON content from backticks")
                    analysis = json.loads(json_content)
                    print("Successfully extracted and parsed JSON from text")
                    return analysis
                except json.JSONDecodeError:
                    print(f"Failed to parse JSON from LLM response")
            else:
                print(f"No JSON found in LLM response")
            
            # Create a default analysis as fallback
            return {
                "Problem Summary": "Conversation with customer",
                "Bot Solved": True,
                "Human Needed": False,
                "Emotion": "neutral"
            }
    
    def _create_default_insight(self, session_id: str, user_name: str, user_email: str) -> InsightCreate:
        """Create a default insight when analysis fails"""
        print("Creating default insight")
        return InsightCreate(
            session_id=session_id,
            name=user_name,
            email=user_email,
            problem_summary="Conversation with customer",
            bot_solved=True,
            human_needed=False,
            emotion="neutral"
        )
