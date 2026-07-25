"""
/api/experience endpoint – stores the freelancer's CV text + portfolio link
in the database so it persists across visits instead of re-uploading each time.
"""

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from db_models import Experience
from models import ExperienceResponse
from services.cv_parser import parse_cv

router = APIRouter()

ALLOWED_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
}

MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def _get_or_create(db: Session) -> Experience:
    exp = db.query(Experience).filter(Experience.id == 1).first()
    if not exp:
        exp = Experience(id=1)
        db.add(exp)
        db.commit()
        db.refresh(exp)
    return exp


@router.get("/", response_model=ExperienceResponse)
async def get_experience(db: Session = Depends(get_db)) -> ExperienceResponse:
    """Return the currently stored CV + portfolio info, if any."""
    exp = db.query(Experience).filter(Experience.id == 1).first()
    if not exp:
        return ExperienceResponse()

    skills = exp.cv_skills.split(",") if exp.cv_skills else []
    return ExperienceResponse(
        cv_filename=exp.cv_filename,
        cv_skills=[s for s in skills if s],
        has_cv=bool(exp.cv_text),
        portfolio_url=exp.portfolio_url,
    )


@router.post("/", response_model=ExperienceResponse)
async def save_experience(
    portfolio_url: str = Form(default=""),
    cv: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
) -> ExperienceResponse:
    """
    Save (or update) the freelancer's portfolio link, and optionally a new CV.
    CV is parsed once here and the extracted text stored — proposal generation
    reads it back from the database, so it never needs to be re-uploaded.
    """
    exp = _get_or_create(db)

    if cv is not None:
        if cv.content_type not in ALLOWED_TYPES:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported file type '{cv.content_type}'. Upload a PDF or DOCX.",
            )
        raw = await cv.read()
        if len(raw) > MAX_SIZE_BYTES:
            raise HTTPException(status_code=413, detail="File exceeds 5 MB limit.")

        try:
            parsed = await parse_cv(raw, cv.content_type, cv.filename or "cv")
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"CV parsing failed: {e}")

        exp.cv_text = parsed.extracted_text
        exp.cv_filename = cv.filename
        exp.cv_skills = ",".join(parsed.detected_skills)

    if portfolio_url:
        exp.portfolio_url = portfolio_url

    db.commit()
    db.refresh(exp)

    skills = exp.cv_skills.split(",") if exp.cv_skills else []
    return ExperienceResponse(
        cv_filename=exp.cv_filename,
        cv_skills=[s for s in skills if s],
        has_cv=bool(exp.cv_text),
        portfolio_url=exp.portfolio_url,
    )
