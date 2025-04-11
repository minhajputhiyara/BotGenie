# Chatbot Maker Backend

This is the backend service for the Chatbot Maker application, implementing RAG (Retrieval-Augmented Generation) using ChromaDB for vector storage.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
uvicorn app.main:app --reload
```

The server will start at `http://localhost:8000`

## API Endpoints

### Create Chatbot
```http
POST /api/chatbots/create
```
Creates a new chatbot with knowledge base documents.

### Query Chatbot
```http
POST /api/chatbots/{collection_name}/query
```
Query a chatbot with a question.

### Delete Chatbot
```http
DELETE /api/chatbots/{collection_name}
```
Delete a chatbot and its associated knowledge base.

## Directory Structure

```
backend/
├── app/
│   ├── database/
│   │   └── vector_store.py    # ChromaDB implementation
│   ├── models/
│   │   └── chatbot.py        # Pydantic models
│   ├── utils/
│   │   └── file_processor.py # File handling utilities
│   └── main.py              # FastAPI application
├── data/
│   ├── chroma_db/           # Vector store data
│   └── uploads/             # Uploaded files
└── requirements.txt         # Python dependencies
```

## Features

- Document processing (PDF, DOCX, TXT)
- Vector storage using ChromaDB
- RAG implementation
- File upload handling
- Query processing
