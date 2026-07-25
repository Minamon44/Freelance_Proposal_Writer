"""
/generate endpoint – proposal generation via Groq LLM.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from db_models import Experience
from models import ProposalRequest, ProposalResponse, Platform, Language
from services.proposal import generate_proposal

router = APIRouter()


@router.post("/generate", response_model=ProposalResponse)
async def generate(req: ProposalRequest, db: Session = Depends(get_db)) -> ProposalResponse:
    """
    Generate a platform-specific freelance proposal using an LLM.
    If cv_context/portfolio_url aren't provided in the request, they're
    auto-filled from the stored Experience record so the frontend doesn't
    need to re-send them on every call.
    """
    if not req.cv_context or not req.portfolio_url:
        exp = db.query(Experience).filter(Experience.id == 1).first()
        if exp:
            req.cv_context = req.cv_context or exp.cv_text
            req.portfolio_url = req.portfolio_url or exp.portfolio_url

    try:
        return await generate_proposal(req)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
