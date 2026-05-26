"""
Xeralit — Healthcare Executive Intelligence Platform
FastAPI application entrypoint.

Run:  uvicorn app.main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""
from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()

from app.routers import ai, metrics

app = FastAPI(
    title="Xeralit Intelligence API",
    description="AI-powered healthcare business-intelligence backend.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(metrics.router)
app.include_router(ai.router)


@app.get("/")
def root():
    return {
        "service": "Xeralit Intelligence API",
        "status": "online",
        "ai_provider": os.getenv("AI_PROVIDER", "groq"),
        "endpoints": ["/metrics/snapshot", "/metrics/forecast", "/metrics/anomalies",
                      "/ai/chat", "/ai/chat/stream", "/ai/summary", "/docs"],
    }


@app.get("/health")
def health():
    return {"ok": True}
