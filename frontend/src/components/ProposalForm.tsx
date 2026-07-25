"use client";

/**
 * ProposalForm – the main proposal generation form.
 * Reads detected CV skills from the Zustand store and
 * injects them automatically into the request.
 */

import { useState, FormEvent, ChangeEvent } from "react";
import { generateProposal, ProposalRequest, ProposalResponse, Platform, Language, Tone } from "@/lib/api";
import { useProfileStore } from "@/store/profileUploadStore";
import ProposalOutput from "./ProposalOutput";

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "upwork",     label: "Upwork" },
  { value: "khamsat",    label: "Khamsat (خمسات)" },
  { value: "mostaql",    label: "Mostaql (مستقل)" },
  { value: "freelancer", label: "Freelancer.com" },
  { value: "other",      label: "Other" },
];

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "english", label: "English" },
  { value: "arabic",  label: "Arabic (عربي)" },
];

const TONES: { value: Tone; label: string; desc: string }[] = [
  { value: "professional", label: "Professional", desc: "Polished & confident" },
  { value: "confident",    label: "Confident",    desc: "Results-focused" },
  { value: "friendly",     label: "Friendly",     desc: "Warm & collaborative" },
  { value: "direct",       label: "Direct",       desc: "Ultra-concise" },
];

interface FormState {
  jobDescription: string;
  platform: Platform;
  language: Language;
  tone: Tone;
  hourlyRate: string;
  deliveryDays: string;
  extraSkills: string;
}

const DEFAULT_FORM: FormState = {
  jobDescription: "",
  platform: "upwork",
  language: "english",
  tone: "professional",
  hourlyRate: "",
  deliveryDays: "",
  extraSkills: "",
};

export default function ProposalForm() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProposalResponse | null>(null);

  const { cvSkills } = useProfileStore();

  const set = (field: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.jobDescription.trim()) {
      setError("Please paste the job description.");
      return;
    }

    setError(null);
    setLoading(true);

    // Build merged skills string: CV skills + any extra typed by user
    const profileSkillsStr = cvSkills.join(", ");
    const allSkills = [profileSkillsStr, form.extraSkills]
      .filter(Boolean)
      .join(", ");

    const payload: ProposalRequest = {
      job_description: form.jobDescription,
      platform: form.platform,
      language: form.language,
      tone: form.tone,
      freelancer_skills: allSkills || undefined,
      hourly_rate: form.hourlyRate || undefined,
      delivery_days: form.deliveryDays ? parseInt(form.deliveryDays) : undefined,
      // cv_context and portfolio_url are auto-filled server-side from the
      // stored Experience record — no need to send them from here.
    };

    try {
      const response = await generateProposal(payload);
      setResult(response);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Job Description */}
        <div className="card">
          <div className="card-title">
            <span>📋</span> Job Description
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="job-desc">Paste the full job posting</label>
            <textarea
              id="job-desc"
              rows={8}
              placeholder="Paste the client's job description here…"
              value={form.jobDescription}
              onChange={set("jobDescription")}
              style={{ minHeight: 160 }}
            />
          </div>
        </div>

        {/* Platform & Language */}
        <div className="card">
          <div className="card-title">
            <span>⚙️</span> Generation Settings
          </div>

          <div className="row">
            <div className="form-group">
              <label htmlFor="platform">Platform</label>
              <select id="platform" value={form.platform} onChange={set("platform")}>
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="language">Language</label>
              <select id="language" value={form.language} onChange={set("language")}>
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tone picker */}
          <label style={{ marginBottom: 8, display: "block" }}>Tone</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {TONES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, tone: t.value }))}
                className={`btn ${form.tone === t.value ? "btn-primary" : "btn-ghost"}`}
                style={{ flexDirection: "column", gap: 2, padding: "8px 16px" }}
              >
                <span style={{ fontWeight: 700 }}>{t.label}</span>
                <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>{t.desc}</span>
              </button>
            ))}
          </div>

          <div className="row">
            <div className="form-group">
              <label htmlFor="rate">Your Rate (optional)</label>
              <input
                id="rate"
                type="text"
                placeholder="e.g. $25/hr or Open"
                value={form.hourlyRate}
                onChange={set("hourlyRate")}
              />
            </div>
            <div className="form-group">
              <label htmlFor="delivery">Delivery (days, optional)</label>
              <input
                id="delivery"
                type="number"
                placeholder="e.g. 7"
                min={1}
                value={form.deliveryDays}
                onChange={set("deliveryDays")}
              />
            </div>
          </div>

          {/* Skills override */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="extra-skills">
              Skills{" "}
              {cvSkills.length > 0 ? (
                <span className="tag tag-green" style={{ marginLeft: 6, verticalAlign: "middle" }}>
                  {cvSkills.length} from profile
                </span>
              ) : null}
            </label>
            <input
              id="extra-skills"
              type="text"
              placeholder={
                cvSkills.length > 0
                  ? "Add more skills (optional, comma-separated)"
                  : "Python, SQL, FastAPI… (comma-separated)"
              }
              value={form.extraSkills}
              onChange={set("extraSkills")}
            />
            {cvSkills.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                {cvSkills.slice(0, 12).map((s) => (
                  <span key={s} className="tag tag-amber">{s}</span>
                ))}
                {cvSkills.length > 12 && (
                  <span className="tag tag-blue">+{cvSkills.length - 12}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginTop: 16 }}>
            ⚠ {error}
          </div>
        )}

        <button
          className="btn btn-primary btn-full"
          type="submit"
          disabled={loading}
          style={{ marginTop: 20, padding: "14px 20px", fontSize: "1rem" }}
        >
          {loading ? (
            <>
              <span className="spinner" /> Generating proposal…
            </>
          ) : (
            "✨ Generate Proposal"
          )}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: 24 }}>
          <ProposalOutput result={result} />
        </div>
      )}
    </div>
  );
}
