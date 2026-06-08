"""
/fetch-linkedin endpoint – scrape a public LinkedIn profile page.

NOTE: LinkedIn aggressively blocks scrapers. This works on public /in/ pages
only when not logged in. For production, prefer LinkedIn's official API.
"""

from fastapi import APIRouter, HTTPException
from models import LinkedInRequest, LinkedInResponse
from services.linkedin_scraper import scrape_linkedin

router = APIRouter()


@router.post("/", response_model=LinkedInResponse)
async def fetch_linkedin(body: LinkedInRequest) -> LinkedInResponse:
    """
    Attempt to scrape a public LinkedIn profile and extract name, headline,
    and skills. Returns whatever is publicly visible without authentication.
    """
    if "linkedin.com/in/" not in body.profile_url:
        raise HTTPException(
            status_code=422,
            detail="URL must be a LinkedIn /in/ profile URL.",
        )
    try:
        return await scrape_linkedin(body.profile_url)
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
