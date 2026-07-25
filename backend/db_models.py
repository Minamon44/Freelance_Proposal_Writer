"""
SQLAlchemy ORM models. Separate from models.py (which holds Pydantic
request/response schemas) to keep the two layers distinct.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, func
from database import Base


class Experience(Base):
    """
    Single-row table holding the freelancer's stored CV text + portfolio link.
    id is always 1 — this app is single-user, so there's one profile record.
    """
    __tablename__ = "experience"

    id = Column(Integer, primary_key=True, index=True)
    cv_text = Column(Text, nullable=True)
    cv_filename = Column(String, nullable=True)
    cv_skills = Column(Text, nullable=True)  # stored as comma-separated string
    portfolio_url = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
