"""
Freelance Proposal Writer – FastAPI Backend
Endpoints: /health, /generate, /upload-cv, /fetch-linkedin
"""
from dotenv import load_dotenv
load_dotenv()  # loads .env before anything else
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from routers import proposal, cv, linkedin

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Freelance Proposal Writer API starting up…")
    yield
    print("🛑 API shutting down…")

app = FastAPI(
    title="Freelance Proposal Writer API",
    version="1.0.0",
    description="AI-powered freelance proposal generation with CV & LinkedIn parsing",
    lifespan=lifespan,
)

# Allow Next.js dev server + production origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(proposal.router, tags=["Proposal"])
app.include_router(cv.router, prefix="/upload-cv", tags=["CV Upload"])
app.include_router(linkedin.router, prefix="/fetch-linkedin", tags=["LinkedIn"])


@app.get("/health", tags=["Health"])
async def health_check() -> dict:
    """Liveness probe – returns API status."""
    return {"status": "ok", "version": "1.0.0"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
