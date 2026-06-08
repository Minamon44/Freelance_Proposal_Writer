# Freelance Proposal Writer

AI-powered freelance proposal generator. Paste a job description, pick your platform and tone, and get a tailored proposal in seconds. Supports Upwork, Khamsat, Mostaql, and more. Reads your CV and LinkedIn profile to auto-detect skills.

---

## Architecture

```
┌─────────────────────────┐      HTTP/REST      ┌──────────────────────────┐
│  Next.js 15 Frontend    │ ◄──────────────────► │  FastAPI 0.111 Backend   │
│  (App Router, plain CSS)│                      │  Groq LLM (llama-3.3-70b)│
│  Zustand state          │                      │  pypdf + python-docx     │
│  CVUploader             │                      │  BeautifulSoup scraper   │
│  LinkedInFetcher        │                      │                          │
└─────────────────────────┘                      └──────────────────────────┘
```

### API Endpoints

| Method | Path              | Description                                  |
|--------|-------------------|----------------------------------------------|
| GET    | `/health`         | Liveness probe                               |
| POST   | `/generate`       | Generate a proposal (JSON body)              |
| POST   | `/upload-cv/`     | Upload PDF or DOCX CV (multipart/form-data)  |
| POST   | `/fetch-linkedin/`| Scrape a public LinkedIn profile (JSON body) |

---

## Running Locally

### Prerequisites

- Python 3.12+
- Node.js 20+
- A [Groq API key](https://console.groq.com/)

### 1 – Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set GROQ_API_KEY=<your-key>

# Start the API
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

API docs available at: http://localhost:8000/docs

### 2 – Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local if your backend runs on a different port

# Development server
npm run dev
```

Open http://localhost:3000

---

## Running with Docker Compose

```bash
# Copy and fill in your secrets
cp .env.example .env
# Edit .env → set GROQ_API_KEY=<your-key>

# Build and start both services
docker compose up --build

# Stop
docker compose down
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:8000/docs

---

## Deployment

### Vercel (Frontend) + Render (Backend)

#### Backend on Render

1. Create a new **Web Service** from the `backend/` directory.
2. Set **Build Command**: `pip install -r requirements.txt`
3. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variable: `GROQ_API_KEY=<your-key>`
5. Note the Render service URL (e.g. `https://fpw-backend.onrender.com`).

#### Frontend on Vercel

1. Import the `frontend/` directory as a Vercel project.
2. Add environment variable: `NEXT_PUBLIC_API_URL=https://fpw-backend.onrender.com`
3. Deploy.

### Docker on VPS / Railway / Fly.io

```bash
docker compose -f docker-compose.yml up -d --build
```

Make sure to set `GROQ_API_KEY` in your environment or secrets manager.

---

## Project Structure

```
freelance-proposal-writer/
├── backend/
│   ├── main.py                # FastAPI app + CORS setup
│   ├── models.py              # Pydantic schemas
│   ├── routers/
│   │   ├── proposal.py        # /generate
│   │   ├── cv.py              # /upload-cv
│   │   └── linkedin.py        # /fetch-linkedin
│   ├── services/
│   │   ├── proposal.py        # Groq LLM call + prompt builders
│   │   ├── cv_parser.py       # PDF/DOCX text extraction + skill detection
│   │   └── linkedin_scraper.py# requests + BeautifulSoup scraper
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx     # Root layout (Sora + JetBrains Mono fonts)
│   │   │   ├── globals.css    # Dark amber theme, plain CSS
│   │   │   └── page.tsx       # Shell with tab navigation
│   │   ├── components/
│   │   │   ├── CVUploader.tsx
│   │   │   ├── LinkedInFetcher.tsx
│   │   │   ├── ProposalForm.tsx
│   │   │   ├── ProposalOutput.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── store/
│   │   │   └── profileUploadStore.ts  # Zustand slice
│   │   └── lib/
│   │       └── api.ts         # Typed API client
│   ├── package.json
│   ├── next.config.mjs
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env.local.example
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Key Takeaways

- **Skill gap analysis**: The LLM is prompted to return a `{"skill_gaps": [...], "suggested_budget": "..."}` JSON block after the proposal; the frontend parses and displays it separately.
- **CV context injection**: Extracted CV text is passed as `cv_context` in the proposal request; the backend truncates it to 1500 chars to stay within token limits.
- **Platform-aware prompts**: Each platform (Khamsat, Upwork, Mostaql…) gets a distinct system prompt with format rules (Arabic/English, length, sections).
- **LinkedIn scraping**: Works only on public profiles; LinkedIn often returns 999 for automated requests—the backend surfaces a clear error.
- **No Tailwind**: The frontend uses plain CSS with CSS variables for complete theming control and zero build-time complexity.
