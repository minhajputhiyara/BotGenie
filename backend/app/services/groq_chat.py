import os
import httpx
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class GroqChat:
    def __init__(self):
        self.api_key = os.getenv('GROQ_API_KEY', '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')
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

    def generate_system_prompt(self, context: str) -> str:
        return f"""You are a helpful AI assistant with access to specific knowledge. 
        Use the following context to answer questions, but don't mention that you're using any context.
        If the context doesn't help answer the question, just say you don't have enough information.If the question is basic questions like hai hello how are you you should just reply like you are a friend to that from your knowledge.Use emogis and friendly tone to make the user engaging.
        
        Context: {context}
        """

    async def get_response(self, query: str, context: str) -> str:
        try:
            messages = [
                {"role": "system", "content": self.generate_system_prompt(context)},
                {"role": "user", "content": query}
            ]

            payload = {
                "model": "mistral-saba-24b",
                "messages": messages,
                "max_tokens": 500,
                "temperature": 0.7,
                "top_p": 1.0
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    headers=self.headers,
                    json=payload
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]

        except httpx.RequestError as e:
            raise Exception(f"Error calling Groq API: {str(e)}")
        except KeyError as e:
            raise Exception(f"Unexpected response format from Groq API: {str(e)}")
        except Exception as e:
            raise Exception(f"Error getting response from Groq: {str(e)}")
