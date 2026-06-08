"""
Pydantic models for request/response validation.
"""

from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, Literal
from enum import Enum


class Platform(str, Enum):
    upwork = "upwork"
    khamsat = "khamsat"
    mostaql = "mostaql"
    freelancer = "freelancer"
    other = "other"


class Language(str, Enum):
    english = "english"
    arabic = "arabic"


class Tone(str, Enum):
    professional = "professional"
    confident = "confident"
    friendly = "friendly"
    direct = "direct"


class ProposalRequest(BaseModel):
    job_description: str = Field(..., min_length=20, description="The full job posting text")
    platform: Platform = Field(default=Platform.upwork)
    language: Language = Field(default=Language.english)
    tone: Tone = Field(default=Tone.professional)
    freelancer_skills: str = Field(
        default="",
        description="Comma-separated skills from CV/profile (optional if CV was uploaded)"
    )
    hourly_rate: Optional[str] = Field(default=None, description="e.g. '$25/hr' or 'Open'")
    delivery_days: Optional[int] = Field(default=None, ge=1, le=365)
    cv_context: Optional[str] = Field(
        default=None,
        description="Pre-parsed CV text injected by frontend after upload"
    )


class ProposalResponse(BaseModel):
    proposal: str
    platform: Platform
    language: Language
    tone: Tone
    skill_gaps: list[str] = Field(default_factory=list)
    suggested_budget: Optional[str] = None
    word_count: int


class CVUploadResponse(BaseModel):
    extracted_text: str
    detected_skills: list[str]
    file_type: str
    char_count: int


class LinkedInRequest(BaseModel):
    profile_url: str = Field(..., description="Public LinkedIn profile URL")


class LinkedInResponse(BaseModel):
    name: Optional[str] = None
    headline: Optional[str] = None
    skills: list[str] = Field(default_factory=list)
    summary: Optional[str] = None
    raw_text: str
