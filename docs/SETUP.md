# Setup Guide

## 1. Backend (FastAPI)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`: set `AI_PROVIDER` and the matching key. Then:

```bash
uvicorn app.main:app --reload --port 8000
```

Verify:
```bash
curl http://localhost:8000/metrics/snapshot | jq .group
curl -X POST http://localhost:8000/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Which branch performed best?"}]}'
```

### Optional: advanced forecasting
```bash
pip install -r requirements-ml.txt   # enables method=prophet / method=xgboost
curl "http://localhost:8000/metrics/forecast?metric=revenue&method=xgboost"
```

### Optional: PostgreSQL
```bash
createdb xeralit
psql "$DATABASE_URL" -f sql/schema.sql
```
Then replace `app/data/mock.generate()` calls inside the services with queries
against `branch_monthly_metrics`. The dict shape is identical, so nothing else
changes.

## 2. Frontend

### Quick path — use the included component
`xeralit-dashboard.jsx` runs as-is in the Claude artifact viewer or any React
sandbox with `recharts` + `lucide-react`. Its AI calls use the in-canvas Claude
endpoint, so it needs no key for the demo.

### Production path — Next.js + your backend
```bash
npx create-next-app@latest xeralit-web --ts --tailwind --app
cd xeralit-web
npm i recharts lucide-react zustand
```

Drop the component in as a page, and swap the in-canvas AI call for your backend.
Minimal client for the chatbot:

```ts
// lib/api.ts
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function smartAsk(messages: {role:string;content:string}[]) {
  const res = await fetch(`${API}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  return (await res.json()).reply as string;
}

export async function snapshot() {
  return (await fetch(`${API}/metrics/snapshot`)).json();
}
```

Streaming version (SSE):
```ts
export async function smartAskStream(
  messages: {role:string;content:string}[],
  onToken: (t: string) => void,
) {
  const res = await fetch(`${API}/ai/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    for (const line of dec.decode(value).split("\n")) {
      if (!line.startsWith("data: ")) continue;
      const p = line.slice(6);
      if (p === "[DONE]") return;
      onToken(JSON.parse(p).token);
    }
  }
}
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in the frontend `.env.local`.
