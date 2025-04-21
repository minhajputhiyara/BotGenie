from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Form, Request, Body, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordRequestForm 
import json
import uuid
from datetime import datetime, timedelta 
from typing import List, Dict, Any
from pathlib import Path
import aiofiles
import asyncio
from sse_starlette.sse import EventSourceResponse
from sqlalchemy.orm import Session 

from .database.vector_store import VectorStore
from .services.groq_chat import GroqChat
from textblob import TextBlob
import httpx
import os
from dotenv import load_dotenv
from .security import get_current_active_user, authenticate_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from . import models, schemas, crud 
from .db_session import get_db, engine, Base
from .crud_sessions import (
    create_chat_session, get_chat_session, get_active_session_by_user,
    update_session_activity, close_session, get_inactive_sessions,
    add_message_to_session, get_session_messages, create_insight,
    get_all_insights, get_insight_by_session
)
from .services.conversation_analyzer import ConversationAnalyzer

# Load environment variables
load_dotenv()

# Get API key from environment
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is not set")

# Initialize database tables
print("Initializing database tables...")
Base.metadata.create_all(bind=engine)
print("Database tables initialized successfully!")

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for the widget to work
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
vector_store = VectorStore()
groq_chat = GroqChat()
conversation_analyzer = ConversationAnalyzer()

# Store progress updates
chatbot_progress = {}

# Create a background task for checking inactive sessions
from fastapi import BackgroundTasks
import asyncio
import threading

# Flag to control the background task
background_task_running = False

async def periodic_session_check(app_state: dict):
    """Run session check periodically in the background"""
    while app_state["running"]:
        try:
            # Create a new database session for this check
            from .db_session import SessionLocal
            db = SessionLocal()
            
            print("\n----- SCHEDULED SESSION CHECK -----")
            print(f"Running scheduled check at {datetime.now()}")
            
            # Check for inactive sessions
            await check_inactive_sessions(db)
            
            # Close the database session
            db.close()
            
        except Exception as e:
            print(f"Error in periodic session check: {str(e)}")
        
        # Wait for 60 seconds before the next check
        await asyncio.sleep(60)  # Check every minute

@app.on_event("startup")
async def startup_event():
    """Start the background task when the application starts"""
    global background_task_running
    
    # Create a shared state dictionary
    app_state = {"running": True}
    
    # Start the background task
    asyncio.create_task(periodic_session_check(app_state))
    background_task_running = True
    print("Started periodic session check background task")

@app.on_event("shutdown")
async def shutdown_event():
    """Stop the background task when the application shuts down"""
    global background_task_running
    background_task_running = False
    print("Stopped periodic session check background task")

# Background task to check for inactive sessions and generate insights
async def check_inactive_sessions(db: Session):
    print("\n----- CHECKING FOR INACTIVE SESSIONS -----")
    # Get inactive sessions (timeout after 1 minute for testing)
    inactive_sessions = get_inactive_sessions(db, timeout_minutes=1)
    print(f"Found {len(inactive_sessions)} inactive sessions")
    
    for session in inactive_sessions:
        print(f"\nProcessing inactive session: {session.id}")
        print(f"Chatbot ID: {session.chatbot_id}")
        print(f"User: {session.user_identifier}")
        print(f"Started at: {session.started_at}")
        print(f"Last activity: {session.last_activity}")
        
        # Get all messages for the session
        messages = get_session_messages(db, session.id)
        print(f"Found {len(messages)} messages in the session")
        
        if messages:
            # Print message contents for debugging
            print("\nSession messages:")
            for i, msg in enumerate(messages):
                print(f"  {i+1}. {msg.role}: {msg.content[:50]}...")
                
            # Analyze the conversation
            print("\nAnalyzing conversation with LLM...")
            insight = await conversation_analyzer.analyze_conversation(session.id, messages)
            
            if insight:
                print("\nInsight generated:")
                print(f"  Name: {insight.name}")
                print(f"  Email: {insight.email}")
                print(f"  Problem Summary: {insight.problem_summary}")
                print(f"  Bot Solved: {insight.bot_solved}")
                print(f"  Human Needed: {insight.human_needed}")
                print(f"  Emotion: {insight.emotion}")
                
                # Create insight in the database
                try:
                    db_insight = create_insight(db, insight)
                    print(f"\nInsight saved to database with ID: {db_insight.id}")
                except Exception as e:
                    print(f"Error saving insight to database: {str(e)}")
            else:
                print("Failed to generate insight from conversation")
            
            # Close the session
            close_session(db, session.id)
            print(f"Session {session.id} marked as inactive")
        else:
            print("No messages found in session, skipping analysis")
    
    print("----- INACTIVE SESSION CHECK COMPLETE -----\n")

# --- Authentication / User Endpoints ---

@app.post("/api/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/users/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

# --- Chatbot Endpoints ---

def analyze_sentiment(text):
    analysis = TextBlob(text)
    # Get polarity (-1 to 1) and subjectivity (0 to 1)
    sentiment = analysis.sentiment
    if sentiment.polarity > 0:
        return "positive"
    elif sentiment.polarity < 0:
        return "negative"
    return "neutral"

def get_role_prompt(chatbot_type: str, business_name: str) -> str:
    base_prompts = {
        "customer_support": f"""You are a friendly and helpful customer support representative for {business_name}. 
Your goal is to assist customers with their inquiries and concerns in a professional and empathetic manner.
Use the provided context to answer questions accurately. If the answer isn't in the context, be honest and say so.""",
        
        "sales": f"""You are an experienced sales consultant for {business_name}. 
Your role is to understand customer needs and recommend suitable products or services.
Use the provided context to give accurate information about our offerings.""",
        
        "product_faq": f"""You are a product expert for {business_name}. 
Your role is to provide clear and accurate information about our products and services.
Base your answers on the provided context and explain concepts in simple terms.""",
        
        "technical_support": f"""You are a technical support specialist for {business_name}. 
Your role is to help users solve technical problems efficiently.
Use the provided context to give accurate technical guidance.""",
        
        "general": f"""You are a knowledgeable assistant for {business_name}. 
Your role is to provide helpful and accurate information based on the provided context.
Be friendly and professional in your responses."""
    }
    
    return base_prompts.get(chatbot_type, base_prompts["general"])

@app.post("/api/chatbots/create")
async def create_chatbot(
    background_tasks: BackgroundTasks,
    business_name: str = Form(...),
    business_type: str = Form(...),
    chatbot_name: str = Form(...),
    chatbot_type: str = Form(...),
    icon_url: str = Form(None),
    files: List[UploadFile] = File(...),
    current_user: models.User = Depends(get_current_active_user)
):
    try:
        # Generate a unique ID for the chatbot
        chatbot_id = str(uuid.uuid4())
        
        # Create directory for chatbot data
        chatbot_dir = Path(f"data/chatbots/{chatbot_id}")
        chatbot_dir.mkdir(parents=True, exist_ok=True)
        
        # Save metadata including user_id from the authenticated user
        metadata = {
            "business_name": business_name,
            "business_type": business_type,
            "chatbot_name": chatbot_name,
            "chatbot_type": chatbot_type,
            "icon": icon_url,
            "created_at": datetime.now().isoformat(),
            "user_id": current_user.id
        }
        
        metadata_path = chatbot_dir / "metadata.json"
        async with aiofiles.open(metadata_path, "w") as f:
            await f.write(json.dumps(metadata))
        
        # Save uploaded files and add to metadata
        saved_files = []
        for file in files:
            try:
                # Read file content
                content = await file.read()
                
                # Save file
                file_path = chatbot_dir / file.filename
                async with aiofiles.open(file_path, 'wb') as f:
                    await f.write(content)
                
                saved_files.append(str(file_path))
                metadata["files"] = metadata.get("files", [])
                metadata["files"].append({
                    "name": file.filename,
                    "path": str(file_path),
                    "size": len(content)
                })
                
            except Exception as e:
                print(f"Error saving file {file.filename}: {str(e)}")
                raise
        
        # Save metadata
        async with aiofiles.open(metadata_path, 'w') as f:
            await f.write(json.dumps(metadata, indent=2))
        
        # Initialize progress
        chatbot_progress[chatbot_id] = {
            "stage": "processing",
            "message": "Saving files...",
            "progress": 25
        }
        
        # Add files to vector store in background
        def create_vector_store():
            try:
                chatbot_progress[chatbot_id].update({
                    "stage": "processing",
                    "message": "Creating knowledge base...",
                    "progress": 50
                })
                
                vector_store.add_documents(chatbot_id, saved_files)
                
                chatbot_progress[chatbot_id].update({
                    "stage": "complete",
                    "message": "Knowledge base created successfully!",
                    "progress": 100,
                    "collection_name": chatbot_id
                })
                print(f"Successfully created vector store for chatbot {chatbot_id}")
                
            except Exception as e:
                print(f"Error creating vector store: {str(e)}")
                chatbot_progress[chatbot_id].update({
                    "stage": "error",
                    "message": str(e),
                    "progress": 0
                })
                raise
        
        background_tasks.add_task(create_vector_store)
        
        return {
            "id": chatbot_id,
            "message": "Files uploaded successfully. Creating knowledge base..."
        }
        
    except Exception as e:
        print(f"Error in process_chatbot_files: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing files: {str(e)}"
        )

@app.get("/api/chatbots/progress")
async def get_progress(id: str):
    async def event_generator():
        try:
            while True:
                if id in chatbot_progress:
                    progress = chatbot_progress[id]
                    yield {
                        "data": json.dumps(progress)
                    }
                    
                    # If we hit an error or completion, stop sending updates
                    if progress["stage"] in ["error", "complete"]:
                        break
                        
                await asyncio.sleep(1)
                
        except Exception as e:
            print(f"Error in progress stream: {str(e)}")
            yield {
                "data": json.dumps({
                    "stage": "error",
                    "message": str(e),
                    "progress": 0
                })
            }
    
    return EventSourceResponse(event_generator())

@app.get("/api/chatbots")
async def list_chatbots(current_user: models.User = Depends(get_current_active_user)):
    chatbots_list = []
    chatbots_dir = Path("data/chatbots")
    user_id = current_user.id
    
    if not chatbots_dir.is_dir():
        return [] 

    try:
        # Iterate through subdirectories in data/chatbots
        for chatbot_id_dir in chatbots_dir.iterdir():
            if chatbot_id_dir.is_dir():
                metadata_path = chatbot_id_dir / "metadata.json"
                if metadata_path.is_file():
                    try:
                        async with aiofiles.open(metadata_path, 'r') as f:
                            metadata = json.loads(await f.read())
                            # Filter by the current user's ID
                            if metadata.get("user_id") == user_id:
                                chatbots_list.append({
                                    "id": chatbot_id_dir.name, 
                                    "name": metadata.get("chatbot_name", "Unnamed Chatbot"),
                                    "created_at": metadata.get("created_at", ""),
                                    "icon_url": metadata.get("icon") 
                                })
                    except Exception as e:
                        # Log error reading specific metadata file but continue with others
                        print(f"Error reading metadata for {chatbot_id_dir.name}: {e}")
                        
        return chatbots_list 

    except Exception as e:
        print(f"Error listing chatbots: {str(e)}")

@app.get("/api/chatbots/details/{chatbot_id}")
async def get_chatbot_details(chatbot_id: str):
    # Note: This endpoint currently does NOT check ownership.
    # If you want only the owner to see details, add:
    # current_user: models.User = Depends(get_current_active_user)
    # And then check metadata.get("user_id") == current_user.id before returning
    try:
        # Get chatbot details from the database
        chatbot_dir = Path(f"data/chatbots/{chatbot_id}")
        metadata_path = chatbot_dir / "metadata.json"
        async with aiofiles.open(metadata_path, 'r') as f:
            metadata = json.loads(await f.read())
        
        return {
            "name": metadata["chatbot_name"],
            "type": metadata["chatbot_type"],
            "business_name": metadata["business_name"],
            "business_type": metadata["business_type"],
            "icon_url": metadata.get("icon")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chatbots/{collection_name}/query")
async def query_chatbot(collection_name: str, query: dict = Body(...), request: Request = None, db: Session = Depends(get_db)):
    try:
        # Get chatbot metadata
        chatbot_dir = Path(f"data/chatbots/{collection_name}")
        metadata_path = chatbot_dir / "metadata.json"
        async with aiofiles.open(metadata_path, 'r') as f:
            metadata = json.loads(await f.read())

        # Session management - extract user identifier (could be IP, session ID, etc.)
        user_identifier = request.client.host if request else "anonymous"
        
        # Get or create active session for this user
        try:
            session = get_active_session_by_user(db, collection_name, user_identifier)
            if not session:
                session_data = schemas.ChatSessionCreate(
                    chatbot_id=collection_name,
                    user_identifier=user_identifier
                )
                session = create_chat_session(db, session_data)
            else:
                # Update last activity timestamp
                session = update_session_activity(db, session.id)
            
            # Add user message to session
            user_message = schemas.ChatMessageCreate(
                role="user",
                content=query["query"]
            )
            add_message_to_session(db, session.id, user_message)
        except Exception as session_error:
            # If there's an error with session management, log it but continue
            print(f"Error in session management: {str(session_error)}")
            # This allows the chatbot to still function even if session tracking fails

        # Get relevant chunks from vector store
        results = vector_store.query_collection(collection_name, query["query"])
        
        # Format context from results
        context = "\n\n".join([r["text"] for r in results])
        
        # Get role-specific prompt
        role_prompt = get_role_prompt(
            metadata["chatbot_type"],
            metadata["business_name"]
        )

        # Create conversation context
        conversation = [
            {"role": "system", "content": role_prompt},
            {"role": "system", "content": f"Here is the relevant context to use in your response:\n\n{context}"},
            {"role": "user", "content": query["query"]}
        ]

        # Get response from Groq
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:  
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {GROQ_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama3-70b-8192",
                        "messages": conversation,
                        "temperature": 0.7,
                        "max_tokens": 1000,
                    }
                )
                
                if response.status_code != 200:
                    # Attempt to get error details from Groq's response body
                    error_detail = f"Error from Groq API (Status: {response.status_code})"
                    try:
                        groq_error_body = response.json() # Try parsing as JSON
                        error_detail += f": {json.dumps(groq_error_body)}"
                    except json.JSONDecodeError:
                        try:
                            groq_error_body = response.text() # Fallback to text
                            error_detail += f": {groq_error_body}"
                        except Exception:
                            error_detail += " (Could not read response body)"
                    print(f"Groq API Error: {error_detail}") # Log the detailed error
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=error_detail # Include Groq's error if possible
                    )
                    
                result = response.json()
                assistant_response = result["choices"][0]["message"]["content"]
        except (httpx.ConnectTimeout, httpx.ConnectError, httpx.ReadTimeout) as e:
            # Handle connection timeouts and errors
            print(f"API Connection Error: {str(e)}")
            assistant_response = "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment or contact support if the issue persists."
        except Exception as e:
            # Handle other API errors
            print(f"Unexpected API Error: {str(e)}")
            assistant_response = "I apologize, but I encountered an unexpected error. Please try again or contact support if the issue persists."
            
        # Try to add assistant message to session
        try:
            if 'session' in locals() and session:
                assistant_message = schemas.ChatMessageCreate(
                    role="assistant",
                    content=assistant_response
                )
                add_message_to_session(db, session.id, assistant_message)
                
                # Run background task to check for inactive sessions
                background_tasks = BackgroundTasks()
                background_tasks.add_task(check_inactive_sessions, db)
        except Exception as session_error:
            # If there's an error with session management, log it but continue
            print(f"Error in session message tracking: {str(session_error)}")
        
        return {"response": assistant_response}

    except Exception as e:
        print(f"\n--- DETAILED ERROR IN QUERY_CHATBOT ---")
        import traceback
        traceback.print_exc()  # Print the full traceback
        print(f"Error type: {type(e).__name__}")
        print(f"Error details: {e!r}")
        print(f"-------------------------------------\n")
        raise HTTPException(
            status_code=500,
            detail=f"Error querying chatbot: {str(e)}"
        )

@app.get("/api/chatbots/{collection_name}/stream")
async def stream_chat(collection_name: str, request: Request):
    async def event_generator():
        try:
            while True:
                if await request.is_disconnected():
                    break

                # Check if there are new messages
                # You can implement your own message queue here
                await asyncio.sleep(0.1)
                
        except Exception as e:
            print(f"Error in stream: {str(e)}")
            
    return EventSourceResponse(event_generator())

@app.get("/api/insights")
async def get_insights(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    """Get all insights with pagination"""
    try:
        insights = get_all_insights(db, skip=skip, limit=limit)
        return insights
    except Exception as e:
        print(f"Error fetching insights: {str(e)}")
        # Return empty list instead of error if table doesn't exist yet
        return []
