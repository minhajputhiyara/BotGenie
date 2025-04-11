import os
import traceback
import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import PyPDFLoader
from pathlib import Path

class VectorStore:
    def __init__(self):
        # Create the chroma_db directory if it doesn't exist
        db_path = Path("data/chroma_db")
        db_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize ChromaDB client with current configuration
        self.client = chromadb.PersistentClient(
            path=str(db_path),
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        print(f"Initialized ChromaDB at {db_path}")
        
    def create_collection(self, collection_name: str) -> Any:
        """Create a new collection or get existing one"""
        try:
            print(f"Creating collection: {collection_name}")
            # First try to get existing collection
            try:
                collection = self.client.get_collection(name=collection_name)
                print(f"Got existing collection: {collection_name}")
            except:
                # If it doesn't exist, create new one
                collection = self.client.create_collection(
                    name=collection_name,
                    metadata={"hnsw:space": "cosine"}
                )
                print(f"Created new collection: {collection_name}")
            return collection
        except Exception as e:
            print(f"Error creating/getting collection: {str(e)}")
            raise

    def process_document(self, file_path: str) -> List[Dict[str, str]]:
        """Process document and split into chunks"""
        print(f"Processing document: {file_path}")
        
        try:
            # Convert to Path object for better path handling
            file_path = Path(file_path)
            
            # Determine file type and use appropriate loader
            file_extension = file_path.suffix.lower()
            print(f"File extension: {file_extension}")
            
            # Make sure file exists
            if not file_path.exists():
                raise ValueError(f"File does not exist: {file_path}")
            
            if file_extension != '.pdf':
                raise ValueError(f"Only PDF files are supported. Got: {file_extension}")
            
            # Use PyPDFLoader for PDF files
            print("Using PyPDFLoader")
            loader = PyPDFLoader(str(file_path))

            # Load the document
            print(f"Loading document")
            documents = loader.load()
            print(f"Loaded {len(documents)} pages")

            # Split text into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
            )
            
            chunks = text_splitter.split_documents(documents)
            print(f"Split into {len(chunks)} chunks")
            
            # Convert chunks to format expected by ChromaDB
            processed_chunks = []
            for i, chunk in enumerate(chunks):
                processed_chunks.append({
                    'id': f"{file_path.name}_{i}",
                    'text': chunk.page_content,
                    'metadata': {
                        'source': str(file_path),
                        'page': chunk.metadata.get('page', 0)
                    }
                })
            
            print(f"Created {len(processed_chunks)} processed chunks")
            return processed_chunks
            
        except Exception as e:
            print(f"Error processing document {file_path}: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            raise

    def add_documents(self, collection_name: str, file_paths: List[str]) -> None:
        """Add documents to the vector store"""
        try:
            print(f"Adding documents to collection: {collection_name}")
            print(f"File paths: {file_paths}")
            
            collection = self.create_collection(collection_name)
            
            all_chunks = []
            for file_path in file_paths:
                try:
                    print(f"Processing file: {file_path}")
                    chunks = self.process_document(file_path)
                    print(f"Generated {len(chunks)} chunks for {file_path}")
                    all_chunks.extend(chunks)
                except Exception as e:
                    print(f"Error processing file {file_path}: {str(e)}")
                    raise
            
            if all_chunks:
                # Add all chunks to collection at once
                print(f"Adding {len(all_chunks)} total chunks to collection")
                collection.add(
                    ids=[chunk['id'] for chunk in all_chunks],
                    documents=[chunk['text'] for chunk in all_chunks],
                    metadatas=[chunk['metadata'] for chunk in all_chunks]
                )
                print(f"Successfully added all chunks to collection")
            else:
                print("No chunks generated from any files")
                
        except Exception as e:
            print(f"Error adding documents: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            raise

    def query_collection(self, collection_name: str, query: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """Query the vector store"""
        try:
            print(f"Querying collection {collection_name} with: {query}")
            collection = self.client.get_collection(collection_name)
            
            results = collection.query(
                query_texts=[query],
                n_results=n_results
            )
            
            # Format results
            formatted_results = []
            for i in range(len(results['ids'][0])):
                formatted_results.append({
                    'id': results['ids'][0][i],
                    'text': results['documents'][0][i],
                    'metadata': results['metadatas'][0][i],
                    'distance': results['distances'][0][i] if 'distances' in results else None
                })
            
            print(f"Found {len(formatted_results)} results")
            return formatted_results
            
        except Exception as e:
            print(f"Error querying collection: {str(e)}")
            raise

    def delete_collection(self, collection_name: str) -> None:
        """Delete a collection"""
        try:
            print(f"Deleting collection: {collection_name}")
            self.client.delete_collection(collection_name)
            print(f"Collection {collection_name} deleted")
        except Exception as e:
            print(f"Error deleting collection: {str(e)}")
            raise
