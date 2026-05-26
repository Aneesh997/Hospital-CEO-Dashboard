# XERALIT — Healthcare Executive Intelligence Platform

An AI-powered business-intelligence console for hospital-group CEOs: branch
performance, financial/operational/patient intelligence, predictive forecasting,
anomaly-based risk detection, and a conversational **Smart Ask** analyst that
reads live data and generates charts on demand.

> Aesthetic target: Bloomberg Terminal × Palantir Gotham × modern SaaS — a dark
> "intelligence console", not a generic admin theme.

---

## What's in this package

```
xeralit/
├── xeralit-dashboard.jsx        # ← the working frontend (single-file React)
├── backend/                     # FastAPI intelligence API
│   ├── app/
│   │   ├── main.py              # entrypoint (CORS, routers)
│   │   ├── routers/
│   │   │   ├── ai.py            # /ai/chat, /ai/chat/stream, /ai/summary
│   │   │   └── metrics.py       # /metrics/snapshot, /forecast, /anomalies, ...
│   │   ├── services/
│   │   │   ├── ai_provider.py   # modular OpenRouter / Groq / Gemini switch
│   │   │   ├── analytics.py     # forecasting + anomaly + recommendations
│   │   │   └── snapshot.py      # LLM-grounding snapshot builder
│   │   └── data/mock.py         # deterministic healthcare dataset
│   ├── sql/schema.sql           # PostgreSQL schema
│   ├── requirements.txt         # core deps
│   ├── requirements-ml.txt      # optional Prophet / XGBoost
│   └── .env.example
└── docs/
    ├── SETUP.md
    └── DEPLOYMENT.md
```

---

## Two ways to run it

### A) Instant demo — frontend only (no backend, no keys)
`xeralit-dashboard.jsx` is a self-contained React component. It renders the full
5-page console with realistic data, real client-side forecasting/anomaly
detection, and a **live AI chatbot** (using the in-canvas Claude completions
endpoint). Drop it into any React + Recharts + lucide-react project, or open it
directly in the Claude artifact viewer.

### B) Full stack — Next.js frontend + FastAPI backend + your own free LLM key

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # set AI_PROVIDER + one API key
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000/docs
```

Get a **free** key from one of:
- **Groq** — https://console.groq.com/keys (fast, recommended default)
- **OpenRouter** — https://openrouter.ai/keys (has `:free` models)
- **Google Gemini** — https://aistudio.google.com/app/apikey

Switching providers is one line in `.env`:
```env
AI_PROVIDER=groq        # or openrouter | gemini
```

See `docs/SETUP.md` for the Next.js wiring and `docs/DEPLOYMENT.md` to ship it.

---

## Feature map

| Capability | Where |
|---|---|
| AI Executive Summary | `GET /ai/summary` · dashboard "AI Executive Briefing" card |
| Smart Ask chatbot (memory + streaming) | `POST /ai/chat`, `/ai/chat/stream` · AI Intelligence Center |
| Dynamic chart generation from chat | LLM emits a `chart` JSON block → frontend renders it |
| Predictive analytics (revenue/occupancy/claims) | `analytics.forecast()` — linear / Prophet / XGBoost |
| Anomaly & risk detection | `analytics.detect_anomalies()` (z-score on MoM deltas) |
| Strategic recommendations | `analytics.recommendations()` + LLM narrative |
| Business health score | `analytics.health_score()` |

## Tech stack
**Frontend:** React/Next.js · TypeScript · Tailwind · Recharts · lucide-react
**Backend:** FastAPI · httpx · Pydantic
**AI:** OpenRouter / Groq / Gemini (modular, OpenAI-compatible where possible)
**Data/ML:** PostgreSQL · pure-python trend model (Prophet/XGBoost optional)

## Notes
- The frontend ships with mock data so it always demos cleanly; point it at the
  FastAPI `/metrics/*` endpoints to go live.
- No secrets in the repo — keys live in `.env` only.
