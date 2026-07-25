"use client";

/**
 * ExperiencePanel – the "Experience" page.
 * Lets the user upload a CV (parsed + stored in the database) and set a
 * portfolio link. Both are saved server-side, so neither needs to be
 * re-entered on future visits.
 */

import { useRef, useState, useEffect, DragEvent, ChangeEvent } from "react";
import { saveExperience } from "@/lib/api";
import { useProfileStore } from "@/store/profileUploadStore";

export default function ExperiencePanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [portfolioInput, setPortfolioInput] = useState("");

  const { cvUploaded, cvFilename, cvSkills, portfolioUrl, loaded, setExperience } =
    useProfileStore();

  // Data is fetched once at the app root (page.tsx); sync the local input
  // once the store has loaded it, without clobbering in-progress typing.
  useEffect(() => {
    if (loaded) setPortfolioInput(portfolioUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const pickFile = (file: File) => {
    setError(null);
    setPendingFile(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) pickFile(file);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) pickFile(file);
    e.target.value = "";
  };

  const handleSave = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await saveExperience(portfolioInput, pendingFile);
      setExperience(result);
      setPendingFile(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* CV upload */}
      <div className="card">
        <div className="card-title">
          <span>📄</span> Your CV
        </div>

        {cvUploaded && !pendingFile && (
          <div className="alert alert-success" style={{ marginBottom: 12 }}>
            ✓ Currently stored: {cvFilename} — {cvSkills.length} skills detected.
          </div>
        )}

        <div
          className={`upload-zone${dragging ? " drag-over" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          aria-label="Upload CV"
        >
          <div className="upload-zone-icon">📁</div>
          <div className="upload-zone-label">
            {pendingFile ? (
              <span>Selected: <strong>{pendingFile.name}</strong> (not saved yet)</span>
            ) : (
              <>
                <strong>Click to browse</strong> or drag & drop
                <br />
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  PDF or DOCX · max 5 MB {cvUploaded ? "· uploading replaces the stored CV" : ""}
                </span>
              </>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display: "none" }}
          onChange={onChange}
        />

        {cvSkills.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16 }}>
            {cvSkills.slice(0, 20).map((skill) => (
              <span key={skill} className="tag tag-amber">{skill}</span>
            ))}
            {cvSkills.length > 20 && (
              <span className="tag tag-blue">+{cvSkills.length - 20} more</span>
            )}
          </div>
        )}
      </div>

      {/* Portfolio link */}
      <div className="card">
        <div className="card-title">
          <span>🔗</span> Portfolio Link
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="portfolio-url">Link to your portfolio, personal site, or GitHub</label>
          <input
            id="portfolio-url"
            type="url"
            placeholder="https://yourportfolio.com"
            value={portfolioInput}
            onChange={(e) => setPortfolioInput(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginTop: 16 }}>
          ⚠ {error}
        </div>
      )}

      <button
        className="btn btn-primary btn-full"
        onClick={handleSave}
        disabled={loading}
        style={{ marginTop: 20, padding: "14px 20px", fontSize: "1rem" }}
      >
        {loading ? (
          <>
            <span className="spinner" /> Saving…
          </>
        ) : (
          "💾 Save Experience"
        )}
      </button>

      {loaded && !cvUploaded && !portfolioUrl && (
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: 12 }}>
          Nothing saved yet — upload a CV and/or add a portfolio link, then hit Save.
        </p>
      )}
    </div>
  );
}
