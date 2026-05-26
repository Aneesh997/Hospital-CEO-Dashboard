"""
Modular LLM provider layer for Xeralit Smart Ask.

Switch providers via the AI_PROVIDER env var without touching call sites:
    AI_PROVIDER=openrouter | groq | gemini

All three are FREE / developer-friendly. OpenRouter and Groq are
OpenAI-compatible, so they share one client; Gemini uses its own REST shape.

Supports streaming (Server-Sent Events) and non-streaming completions, plus a
context-aware system prompt that grounds answers in the live BI snapshot.
"""
from __future__ import annotations

import json
import os
from typing import AsyncGenerator, Optional

import httpx

# ---- provider registry -----------------------------------------------------
# base_url + default model per provider. Override the model with AI_MODEL.
PROVIDERS = {
    "openrouter": {
        "base_url": "https://openrouter.ai/api/v1/chat/completions",
        "default_model": "meta-llama/llama-3.1-8b-instruct:free",
        "key_env": "OPENROUTER_API_KEY",
        "style": "openai",
    },
    "groq": {
        "base_url": "https://api.groq.com/openai/v1/chat/completions",
        "default_model": "llama-3.3-70b-versatile",
        "key_env": "GROQ_API_KEY",
        "style": "openai",
    },
    "gemini": {
        # {model} is substituted at call time
        "base_url": "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        "default_model": "gemini-1.5-flash",
        "key_env": "GEMINI_API_KEY",
        "style": "gemini",
    },
}

SYSTEM_PROMPT = """You are "Xeralit Smart Ask", an elite healthcare business-intelligence \
analyst embedded in a hospital-group CEO dashboard. You are decisive, numerate and speak in \
executive language — concise, insight-first, no hedging.

You receive a JSON snapshot of the group's live metrics. Ground EVERY claim in that data; cite \
specific branches, departments and numbers (currency INR, amounts in lakh unless stated). Never \
invent metrics absent from the data.

Format: a one-line headline insight, then 2-4 tight bullets, then a **Recommendation:** line when \
useful. Keep most answers under ~140 words.

CHART GENERATION: when a visual helps, append a fenced ```chart block with JSON:
{"type":"bar|line|area|pie","title":"...","x":"label","series":[{"name":"Revenue","field":"revenue"}],"data":[...]}
Use only numbers derivable from the snapshot. Omit the block if a chart adds nothing."""


def _active() -> dict:
    name = os.getenv("AI_PROVIDER", "groq").lower()
    if name not in PROVIDERS:
        raise ValueError(f"Unknown AI_PROVIDER '{name}'. Choose: {list(PROVIDERS)}")
    cfg = dict(PROVIDERS[name])
    cfg["name"] = name
    cfg["model"] = os.getenv("AI_MODEL", cfg["default_model"])
    cfg["api_key"] = os.getenv(cfg["key_env"], "")
    return cfg


def _headers(cfg: dict) -> dict:
    h = {"Content-Type": "application/json"}
    if cfg["style"] == "openai":
        h["Authorization"] = f"Bearer {cfg['api_key']}"
        if cfg["name"] == "openrouter":
            h["HTTP-Referer"] = os.getenv("APP_URL", "http://localhost:3000")
            h["X-Title"] = "Xeralit"
    return h


def _build_payload(cfg: dict, messages: list[dict], stream: bool) -> tuple[str, dict, dict]:
    """Return (url, json_body, headers) shaped for the active provider."""
    if cfg["style"] == "openai":
        body = {
            "model": cfg["model"],
            "messages": [{"role": "system", "content": SYSTEM_PROMPT}] + messages,
            "temperature": 0.3,
            "stream": stream,
        }
        return cfg["base_url"], body, _headers(cfg)

    # gemini
    contents = []
    for m in messages:
        role = "user" if m["role"] == "user" else "model"
        contents.append({"role": role, "parts": [{"text": m["content"]}]})
    body = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": contents,
        "generationConfig": {"temperature": 0.3},
    }
    url = cfg["base_url"].format(model=cfg["model"]) + f"?key={cfg['api_key']}"
    return url, body, {"Content-Type": "application/json"}


async def complete(messages: list[dict]) -> str:
    """Non-streaming completion. `messages` = [{'role','content'}, ...]."""
    cfg = _active()
    url, body, headers = _build_payload(cfg, messages, stream=False)
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(url, json=body, headers=headers)
        r.raise_for_status()
        data = r.json()
    if cfg["style"] == "openai":
        return data["choices"][0]["message"]["content"]
    return data["candidates"][0]["content"]["parts"][0]["text"]


async def stream(messages: list[dict]) -> AsyncGenerator[str, None]:
    """Token stream for SSE. Gemini falls back to a single chunk."""
    cfg = _active()
    if cfg["style"] != "openai":
        yield await complete(messages)
        return
    url, body, headers = _build_payload(cfg, messages, stream=True)
    async with httpx.AsyncClient(timeout=120) as client:
        async with client.stream("POST", url, json=body, headers=headers) as resp:
            async for line in resp.aiter_lines():
                if not line or not line.startswith("data: "):
                    continue
                chunk = line[6:]
                if chunk.strip() == "[DONE]":
                    break
                try:
                    delta = json.loads(chunk)["choices"][0]["delta"].get("content")
                    if delta:
                        yield delta
                except (json.JSONDecodeError, KeyError, IndexError):
                    continue
