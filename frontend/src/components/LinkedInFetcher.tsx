"use client";

/**
 * LinkedInFetcher – fetches a public LinkedIn profile by URL,
 * stores name, headline and skills in Zustand.
 */

import { useState, ChangeEvent, FormEvent } from "react";
import { fetchLinkedIn } from "@/lib/api";
import { useProfileStore } from "@/store/profileUploadStore";

export default function LinkedInFetcher() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { linkedInFetched, linkedInName, linkedInHeadline, linkedInSkills, setLinkedInData, clearLinkedIn } =
    useProfileStore();

  const handleFetch = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (!trimmed.includes("linkedin.com/in/")) {
      setError("Please enter a valid LinkedIn /in/ profile URL.");
      return;
    }

    setLoading(true);
    try {
      const result = await fetchLinkedIn(trimmed);
      setLinkedInData(result.name ?? "", result.headline ?? "", result.skills);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  if (linkedInFetched) {
    return (
      <div className="card">
        <div className="card-title">
          <span>🔗</span> LinkedIn Profile
        </div>
        <div className="alert alert-success" style={{ marginBottom: 12 }}>
          ✓ Profile fetched — {linkedInSkills.length} skills found.
        </div>
        {linkedInName && (
          <p style={{ fontWeight: 700, marginBottom: 4 }}>{linkedInName}</p>
        )}
        {linkedInHeadline && (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: 12 }}>
            {linkedInHeadline}
          </p>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {linkedInSkills.slice(0, 15).map((skill) => (
            <span key={skill} className="tag tag-blue">
              {skill}
            </span>
          ))}
          {linkedInSkills.length > 15 && (
            <span className="tag tag-amber">+{linkedInSkills.length - 15} more</span>
          )}
        </div>
        <button className="btn btn-ghost" onClick={clearLinkedIn}>
          ✕ Clear Profile
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">
        <span>🔗</span> Import from LinkedIn
      </div>
      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 16 }}>
        Enter a public LinkedIn profile URL to auto-import your skills and headline.
        <br />
        <em style={{ color: "var(--text-muted)" }}>
          Note: Only works on truly public profiles (no login required).
        </em>
      </p>

      <form onSubmit={handleFetch}>
        <div className="form-group">
          <label htmlFor="linkedin-url">Profile URL</label>
          <input
            id="linkedin-url"
            type="url"
            placeholder="https://linkedin.com/in/your-profile"
            value={url}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 12 }}>
            ⚠ {error}
          </div>
        )}

        <button className="btn btn-ghost btn-full" type="submit" disabled={loading || !url}>
          {loading ? (
            <>
              <span className="spinner" /> Fetching…
            </>
          ) : (
            "Fetch Profile"
          )}
        </button>
      </form>
    </div>
  );
}
