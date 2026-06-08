"""
LinkedIn public profile scraper using requests + BeautifulSoup.

⚠️  LinkedIn actively blocks bots. This works on truly public profiles
    without login. For a production system, use the official LinkedIn API
    or a commercial data provider (Proxycurl, etc.).
"""

import re
import asyncio
import functools
from typing import Optional

import requests
from bs4 import BeautifulSoup

from models import LinkedInResponse

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

TIMEOUT = 10  # seconds


# ---------------------------------------------------------------------------
# Parsing helpers
# ---------------------------------------------------------------------------

def _parse_page(html: str) -> LinkedInResponse:
    soup = BeautifulSoup(html, "html.parser")
    raw_text = soup.get_text(separator="\n", strip=True)

    # Name – usually in <h1>
    name: Optional[str] = None
    h1 = soup.find("h1")
    if h1:
        name = h1.get_text(strip=True) or None

    # Headline – <h2> or elements with class patterns containing "headline"
    headline: Optional[str] = None
    for tag in soup.find_all(["h2", "span", "div"]):
        cls = " ".join(tag.get("class", []))
        if "headline" in cls.lower():
            headline = tag.get_text(strip=True)
            break

    # Summary – look for "About" section text
    summary: Optional[str] = None
    about_header = soup.find(string=re.compile(r"^\s*About\s*$", re.I))
    if about_header:
        parent = about_header.find_parent()
        if parent:
            sibling = parent.find_next_sibling()
            if sibling:
                summary = sibling.get_text(strip=True)[:500]

    # Skills – naive: any <span> or <li> containing skill-like text
    # LinkedIn's public pages rarely expose the full skills list without login.
    skill_candidates: list[str] = []
    for el in soup.find_all(["span", "li"]):
        txt = el.get_text(strip=True)
        # Short, non-sentence snippets are likely skill labels
        if 2 < len(txt) < 40 and "\n" not in txt:
            skill_candidates.append(txt)

    # De-duplicate while preserving order; limit to 30
    seen: set[str] = set()
    skills: list[str] = []
    for s in skill_candidates:
        if s not in seen:
            seen.add(s)
            skills.append(s)
        if len(skills) >= 30:
            break

    return LinkedInResponse(
        name=name,
        headline=headline,
        skills=skills,
        summary=summary,
        raw_text=raw_text[:3000],  # truncate to keep payload sane
    )


# ---------------------------------------------------------------------------
# Synchronous fetch (run in thread pool to avoid blocking the event loop)
# ---------------------------------------------------------------------------

def _fetch_sync(url: str) -> str:
    resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
    if resp.status_code == 999:
        raise RuntimeError(
            "LinkedIn returned 999 (bot detection). "
            "Try again later or use the official LinkedIn API."
        )
    if resp.status_code != 200:
        raise RuntimeError(f"LinkedIn returned HTTP {resp.status_code}.")
    return resp.text


# ---------------------------------------------------------------------------
# Public async API
# ---------------------------------------------------------------------------

async def scrape_linkedin(url: str) -> LinkedInResponse:
    loop = asyncio.get_event_loop()
    try:
        html = await loop.run_in_executor(None, functools.partial(_fetch_sync, url))
    except requests.RequestException as e:
        raise RuntimeError(f"Network error while fetching LinkedIn profile: {e}")

    return _parse_page(html)
