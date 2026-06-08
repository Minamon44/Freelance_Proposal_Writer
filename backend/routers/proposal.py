"""
/generate endpoint – proposal generation via Groq LLM.
"""

from fastapi import APIRouter, HTTPException
from models import ProposalRequest, ProposalResponse, Platform, Language
from services.proposal import generate_proposal

router = APIRouter()


@router.post("/generate", response_model=ProposalResponse)
async def generate(req: ProposalRequest) -> ProposalResponse:
    """
    Generate a platform-specific freelance proposal using an LLM.
    Accepts optional CV context and skill gap analysis parameters.
    """
    try:
        return await generate_proposal(req)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
