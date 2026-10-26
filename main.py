
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ollama import chat
from pydantic import BaseModel, Field

app = FastAPI(title="SilentChat API")

@app.get("/")
def home():
    return {
        "message": "Welcome to SilentChat API!",
        "docs": "/docs",
        "status": "running"
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

MODEL = "qwen3:8b"

SYSTEM_PROMPT = """
You are a helpful AI assistant.
Answer clearly, accurately, and naturally.
Use concise responses unless more detail is requested.
"""


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=10000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=10000)
    history: list[Message] = Field(default_factory=list, max_length=40)


class ChatResponse(BaseModel):
    reply: str
    model: str


@app.get("/health")
def health():
    return {"status": "ok", "app": "SilentChat API"}


@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]

    for item in request.history[-20:]:
        messages.append({
            "role": item.role,
            "content": item.content,
        })

    messages.append({
        "role": "user",
        "content": request.message,
    })

    try:
        response = chat(
            model=MODEL,
            messages=messages,
            think=False,
        )

        return ChatResponse(
            reply=response.message.content.strip(),
            model=MODEL,
        )

    except Exception as exc:
        print(f"Model request failed: {exc}")
        raise HTTPException(
            status_code=503,
            detail="AI model unavailable. Check Ollama and the model.",
        ) from exc
