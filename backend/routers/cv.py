"""
/upload-cv endpoint – parse PDF or DOCX and extract skills.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from models import CVUploadResponse
from services.cv_parser import parse_cv

router = APIRouter()

ALLOWED_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
}

MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/", response_model=CVUploadResponse)
async def upload_cv(file: UploadFile = File(...)) -> CVUploadResponse:
    """
    Accept a PDF or DOCX CV, extract raw text, and detect skill keywords.
    Returns extracted text so the frontend can inject it into subsequent requests.
    """
    # Validate content type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{file.content_type}'. Upload a PDF or DOCX.",
        )

    raw = await file.read()

    if len(raw) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 5 MB limit.")

    try:
        return await parse_cv(raw, file.content_type, file.filename or "cv")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"CV parsing failed: {e}")
