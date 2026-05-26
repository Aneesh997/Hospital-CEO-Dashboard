# Deployment

## Backend (FastAPI)

### Docker
```dockerfile
# backend/Dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
COPY sql ./sql
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```
```bash
docker build -t xeralit-api ./backend
docker run -p 8000:8000 --env-file backend/.env xeralit-api
```

### Managed hosts
- **Render / Railway / Fly.io**: start command
  `uvicorn app.main:app --host 0.0.0.0 --port $PORT`; add `.env` vars in the
  dashboard; attach a managed PostgreSQL and set `DATABASE_URL`.

## Frontend (Next.js)
- **Vercel**: import the repo, set `NEXT_PUBLIC_API_URL` to your API URL, deploy.

## docker-compose (full stack)
```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: xeralit
      POSTGRES_PASSWORD: xeralit
      POSTGRES_DB: xeralit
    ports: ["5432:5432"]
  api:
    build: ./backend
    env_file: ./backend/.env
    depends_on: [db]
    ports: ["8000:8000"]
  web:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    ports: ["3000:3000"]
```

## Production checklist
- [ ] Keys in the host's secret store, never committed.
- [ ] Lock `CORS_ORIGINS` to your real frontend domain.
- [ ] Put the LLM calls behind auth + rate limiting (the chatbot can be costly).
- [ ] Persist `ai_conversation` for audit; persist `forecast`/`anomaly` for explainability.
- [ ] If handling real PHI, this needs HIPAA/GDPR controls (encryption at rest +
      in transit, access logging, BAAs with any LLM vendor). The demo uses
      synthetic data only.
```
