"""
CV parsing service – supports PDF (pypdf) and DOCX (python-docx).
Extracts raw text then applies a keyword-based skill detector.
"""

import io
import re
from models import CVUploadResponse

# ---------------------------------------------------------------------------
# Skill keyword bank (extend as needed)
# ---------------------------------------------------------------------------
SKILL_KEYWORDS: list[str] = [
    "python", "sql", "postgresql", "mysql", "mongodb", "pandas", "numpy",
    "scikit-learn", "tensorflow", "pytorch", "keras", "fastapi", "django",
    "flask", "react", "next.js", "typescript", "javascript", "node.js",
    "docker", "kubernetes", "aws", "gcp", "azure", "git", "mlflow",
    "airflow", "spark", "kafka", "redis", "graphql", "rest", "api",
    "machine learning", "deep learning", "nlp", "computer vision",
    "data analysis", "data visualization", "tableau", "power bi",
    "excel", "vba", "r", "matlab", "java", "c++", "rust", "go",
    "linux", "bash", "selenium", "scrapy", "beautifulsoup",
]


def _detect_skills(text: str) -> list[str]:
    """Case-insensitive keyword scan; returns unique sorted matches."""
    lower = text.lower()
    found = {kw for kw in SKILL_KEYWORDS if re.search(r"\b" + re.escape(kw) + r"\b", lower)}
    return sorted(found)


# ---------------------------------------------------------------------------
# PDF extraction
# ---------------------------------------------------------------------------

def _extract_pdf(raw: bytes) -> str:
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(raw))
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(pages)


# ---------------------------------------------------------------------------
# DOCX extraction
# ---------------------------------------------------------------------------

def _extract_docx(raw: bytes) -> str:
    from docx import Document

    doc = Document(io.BytesIO(raw))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def parse_cv(raw: bytes, content_type: str, filename: str) -> CVUploadResponse:
    if "pdf" in content_type:
        text = _extract_pdf(raw)
        file_type = "pdf"
    else:
        text = _extract_docx(raw)
        file_type = "docx"

    if not text.strip():
        raise ValueError("Could not extract any text from the uploaded file.")

    skills = _detect_skills(text)

    return CVUploadResponse(
        extracted_text=text,
        detected_skills=skills,
        file_type=file_type,
        char_count=len(text),
    )
