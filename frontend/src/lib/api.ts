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

export interface CVUploadResponse {
  extracted_text: string;
  detected_skills: string[];
  file_type: string;
  char_count: number;
}

export interface LinkedInResponse {
  name: string | null;
  headline: string | null;
  skills: string[];
  summary: string | null;
  raw_text: string;
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

export async function uploadCV(file: File): Promise<CVUploadResponse> {
  const form = new FormData();
  form.append("file", file);
  return request<CVUploadResponse>("/upload-cv/", {
    method: "POST",
    body: form,
  });
}

export async function fetchLinkedIn(
  profile_url: string
): Promise<LinkedInResponse> {
  return request<LinkedInResponse>("/fetch-linkedin/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile_url }),
  });
}

export async function healthCheck(): Promise<{ status: string }> {
  return request<{ status: string }>("/health", { method: "GET" });
}
