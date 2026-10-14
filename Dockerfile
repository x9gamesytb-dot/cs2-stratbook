# ==========================================
# Multi-stage Docker build CS2 Tactical HQ
# ==========================================

# Étape 1 : Construction du Frontend React
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Étape 2 : Image finale Python FastAPI
FROM python:3.11-slim
WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Dépendances Python
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Code source Backend
COPY backend/ ./backend/

# Injection des fichiers compilés du Frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

WORKDIR /app/backend

EXPOSE 8000

# Démarrage automatique d'Uvicorn avec prise en compte dynamique du port d'hébergement
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
