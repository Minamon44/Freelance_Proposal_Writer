"""
Core proposal generation logic.
Calls the Groq API (llama-3.3-70b-versatile) with platform/tone-aware prompts.
"""

import os
import re
from groq import Groq
from models import ProposalRequest, ProposalResponse, Platform, Language, Tone

_client: Groq | None = None


def _get_client() -> Groq:
    """Lazy-init Groq client; raise clearly if API key is missing."""
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY is not set. Add it to your .env file.")
        _client = Groq(api_key=api_key)
    return _client


# ---------------------------------------------------------------------------
# Prompt builders
# ---------------------------------------------------------------------------

def _system_prompt(req: ProposalRequest) -> str:
    platform_notes = {
        Platform.khamsat: (
            "This is a Khamsat (Arabic micro-freelance) platform. "
            "Write a SHORT Arabic reply of 5–8 natural lines, no bullet points, "
            "starting with 'السلام عليكم،'. Never mention pricing."
        ),
        Platform.mostaql: (
            "This is Mostaql (Arabic freelance platform). "
            "Write a professional Arabic proposal with an opening hook, "
            "project understanding, technical approach, and a closing."
        ),
        Platform.upwork: (
            "This is Upwork. Write a full structured English proposal with: "
            "🪝 Opening Hook, 🔍 Project Understanding, ⚙️ Technical Approach, "
            "💼 Relevant Experience, 💰 Financial Proposal, 🤝 Closing. "
            "Do NOT start with 'I am' or 'My name is'."
        ),
        Platform.freelancer: (
            "This is Freelancer.com. Write a concise but complete proposal in "
            "the requested language covering approach, relevant experience, and timeline."
        ),
        Platform.other: (
            "Write a professional freelance proposal in the requested language."
        ),
    }

    tone_notes = {
        Tone.professional: "Tone: polished, confident, no filler words.",
        Tone.confident:    "Tone: assertive, results-focused, strong voice.",
        Tone.friendly:     "Tone: warm, collaborative, approachable.",
        Tone.direct:       "Tone: ultra-concise, maximum impact, minimum words.",
    }

    lang_instruction = (
        "Respond in Arabic." if req.language == Language.arabic
        else "Respond in English."
    )

    return (
        "You are an expert freelance proposal writer with 10+ years of experience. "
        f"{platform_notes[req.platform]} "
        f"{tone_notes[req.tone]} "
        f"{lang_instruction} "
        "Focus only on skills DIRECTLY relevant to the job. "
        "Never fabricate credentials. "
        "If a budget or delivery time is provided, include it naturally. "
        "End your response with a JSON block on a new line like:\n"
        '```json\n{"skill_gaps": ["skill1"], "suggested_budget": "$X/hr"}\n```'
    )


def _user_prompt(req: ProposalRequest) -> str:
    parts = [f"**Job Description:**\n{req.job_description}"]

    if req.freelancer_skills:
        parts.append(f"**My Skills:** {req.freelancer_skills}")

    if req.cv_context:
        # Truncate to avoid context overflow
        parts.append(f"**CV Summary (first 1500 chars):**\n{req.cv_context[:1500]}")

    if req.hourly_rate:
        parts.append(f"**My Rate:** {req.hourly_rate}")

    if req.delivery_days:
        parts.append(f"**Delivery:** {req.delivery_days} days")

    parts.append(
        "Write the proposal now. After the proposal body, append the JSON metadata block."
    )
    return "\n\n".join(parts)


# ---------------------------------------------------------------------------
# JSON metadata extraction from LLM tail
# ---------------------------------------------------------------------------

def _extract_metadata(raw: str) -> tuple[str, list[str], str | None]:
    """
    Split the LLM response into (proposal_body, skill_gaps, suggested_budget).
    The model appends a ```json ... ``` block at the end.
    """
    import json

    pattern = r"```json\s*(\{.*?\})\s*```"
    match = re.search(pattern, raw, re.DOTALL)

    skill_gaps: list[str] = []
    suggested_budget: str | None = None

    if match:
        try:
            meta = json.loads(match.group(1))
            skill_gaps = meta.get("skill_gaps", [])
            suggested_budget = meta.get("suggested_budget")
        except json.JSONDecodeError:
            pass
        # Remove the JSON block from the proposal body
        proposal_body = raw[: match.start()].strip()
    else:
        proposal_body = raw.strip()

    return proposal_body, skill_gaps, suggested_budget


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def generate_proposal(req: ProposalRequest) -> ProposalResponse:
    client = _get_client()

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": _system_prompt(req)},
            {"role": "user",   "content": _user_prompt(req)},
        ],
        temperature=0.7,
        max_tokens=1500,
    )

    raw = completion.choices[0].message.content or ""
    proposal_body, skill_gaps, suggested_budget = _extract_metadata(raw)

    return ProposalResponse(
        proposal=proposal_body,
        platform=req.platform,
        language=req.language,
        tone=req.tone,
        skill_gaps=skill_gaps,
        suggested_budget=suggested_budget,
        word_count=len(proposal_body.split()),
    )
