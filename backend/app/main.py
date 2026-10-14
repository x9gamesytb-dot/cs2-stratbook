import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from .database import engine, Base, SessionLocal
from .models.strat import Strat
from .seed_data import seed_database
from .routers import strats_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialisation de la base SQLite et des tables
    Base.metadata.create_all(bind=engine)
    
    # Injection des stratégies compétitives par défaut si la table est vide
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    
    yield

app = FastAPI(
    title="CS2 Tactical Stratbook API",
    description="Backend API pour la gestion du Map Pool officiel et du Strat Book Counter-Strike 2.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montage unique du routeur de stratégies et de l'outil de dessin tactique
app.include_router(strats_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "CS2 Tactical Stratbook",
        "version": "1.0.0",
        "maps_supported": ["Mirage", "Inferno", "Nuke", "Anubis", "Ancient", "Dust II", "Vertigo"]
    }

# Montage du frontend React (Production / Deploiement Cloud)
possible_dist_paths = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "dist")),
    os.path.abspath("frontend/dist"),
]
for p in possible_dist_paths:
    if os.path.exists(p) and os.path.isdir(p):
        app.mount("/", StaticFiles(directory=p, html=True), name="frontend")
        break

