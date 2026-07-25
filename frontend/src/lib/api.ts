/**
 * Typed API client for the FastAPI backend.
 * Base URL is resolved from NEXT_PUBLIC_API_URL or defaults to localhost:8000.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Shared ────────────────────────────────────────────────────────────────

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body?.detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────

export type Platform = "upwork" | "khamsat" | "mostaql" | "freelancer" | "other";
export type Language = "english" | "arabic";
export type Tone = "professional" | "confident" | "friendly" | "direct";

export interface ProposalRequest {
  job_description: string;
  platform: Platform;
  language: Language;
  tone: Tone;
  freelancer_skills?: string;
  hourly_rate?: string;
  delivery_days?: number;
  cv_context?: string;
  portfolio_url?: string;
}

export interface ProposalResponse {
  proposal: string;
  platform: Platform;
  language: Language;
  tone: Tone;
  skill_gaps: string[];
  suggested_budget: string | null;
  word_count: number;
}

export interface ExperienceResponse {
  cv_filename: string | null;
  cv_skills: string[];
  has_cv: boolean;
  portfolio_url: string | null;
}

// ── API functions ─────────────────────────────────────────────────────────

export async function generateProposal(
  body: ProposalRequest
): Promise<ProposalResponse> {
  return request<ProposalResponse>("/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function getExperience(): Promise<ExperienceResponse> {
  return request<ExperienceResponse>("/api/experience/", { method: "GET" });
}

export async function saveExperience(
  portfolioUrl: string,
  cvFile?: File | null
): Promise<ExperienceResponse> {
  const form = new FormData();
  form.append("portfolio_url", portfolioUrl);
  if (cvFile) form.append("cv", cvFile);
  return request<ExperienceResponse>("/api/experience/", {
    method: "POST",
    body: form,
  });
}

export async function healthCheck(): Promise<{ status: string }> {
  return request<{ status: string }>("/health", { method: "GET" });
}
