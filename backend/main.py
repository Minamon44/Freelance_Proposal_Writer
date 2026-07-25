"""
Freelance Proposal Writer – FastAPI Backend
Endpoints: /health, /generate, /api/experience
"""
from dotenv import load_dotenv
load_dotenv()  # loads .env before anything else
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from routers import proposal, experience
from database import engine, Base
import db_models  # noqa: F401 – must be imported so its table is registered on Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Freelance Proposal Writer API starting up…")
    Base.metadata.create_all(bind=engine)
    yield
    print("🛑 API shutting down…")

app = FastAPI(
    title="Freelance Proposal Writer API",
    version="1.0.0",
    description="AI-powered freelance proposal generation with stored CV & portfolio",
    lifespan=lifespan,
)

# Allow Next.js dev server + production origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_origin_regex=r"https://.*\.(vercel\.app|up\.railway\.app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(proposal.router, tags=["Proposal"])
app.include_router(experience.router, prefix="/api/experience", tags=["Experience"])


@app.get("/health", tags=["Health"])
async def health_check() -> dict:
    """Liveness probe – returns API status."""
    return {"status": "ok", "version": "1.0.0"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
