import os
import hashlib
from pathlib import Path
from fastapi import UploadFile
import shutil
import aiofiles

async def save_uploaded_file(file: UploadFile, directory: Path) -> Path:
    """Save an uploaded file to the specified directory"""
    try:
        # Create directory if it doesn't exist
        directory.mkdir(parents=True, exist_ok=True)
        
        # Generate safe filename
        file_extension = os.path.splitext(file.filename)[1]
        safe_filename = f"{get_file_hash(file.filename)}{file_extension}"
        file_path = directory / safe_filename
        
        # Save file using aiofiles for async file operations
        async with aiofiles.open(str(file_path), "wb") as buffer:
            # Read the file in chunks to handle large files
            while content := await file.read(1024 * 1024):  # 1MB chunks
                await buffer.write(content)
            
        return file_path
    
    except Exception as e:
        print(f"Error saving file {file.filename}: {str(e)}")
        raise
    finally:
        await file.close()  # Ensure file is closed

def get_file_hash(content: str) -> str:
    """Generate a hash from content"""
    return hashlib.md5(content.encode()).hexdigest()[:10]
