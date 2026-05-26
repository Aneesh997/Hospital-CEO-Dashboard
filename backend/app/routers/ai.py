"""Smart Ask chat endpoints — streaming + non-streaming, context-grounded."""
from __future__ import annotations

import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.services import ai_provider
from app.services.snapshot import build_snapshot

router = APIRouter(prefix="/ai", tags=["ai"])


class ChatTurn(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatTurn]            # full conversation (memory)
    ground_with_snapshot: bool = True   # inject live BI context into the last user turn


def _prepare(req: ChatRequest) -> list[dict]:
    msgs = [m.model_dump() for m in req.messages]
    if req.ground_with_snapshot and msgs and msgs[-1]["role"] == "user":
        snap = json.dumps(build_snapshot())
        msgs[-1]["content"] = f"SNAPSHOT:{snap}\n\nCEO QUESTION: {msgs[-1]['content']}"
    return msgs


@router.post("/chat")
async def chat(req: ChatRequest):
    """Non-streaming completion. Returns {'reply': str}."""
    reply = await ai_provider.complete(_prepare(req))
    return {"reply": reply}


@router.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    """Server-Sent Events token stream for the chatbot UI."""
    prepared = _prepare(req)

    async def gen():
        async for tok in ai_provider.stream(prepared):
            yield f"data: {json.dumps({'token': tok})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream")


@router.get("/summary")
async def executive_summary():
    """AI-generated daily executive briefing."""
    snap = json.dumps(build_snapshot())
    prompt = ("Write a crisp 3-sentence executive briefing for the hospital-group CEO from this "
              f"month's data. Reference specific branches and numbers.\nData:{snap}\n"
              "Return ONLY the 3 sentences.")
    reply = await ai_provider.complete([{"role": "user", "content": prompt}])
    return {"summary": reply}
