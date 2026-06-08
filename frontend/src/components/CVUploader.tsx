"use client";

/**
 * CVUploader – drag-and-drop or click-to-upload CV (PDF/DOCX).
 * On success, stores extracted text and detected skills in Zustand.
 */

import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { uploadCV } from "@/lib/api";
import { useProfileStore } from "@/store/profileUploadStore";

export default function CVUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { cvUploaded, cvSkills, clearCv, setCvData } = useProfileStore();

  const handleFile = async (file: File) => {
    setError(null);
    setLoading(true);
    try {
      const result = await uploadCV(file);
      setCvData(result.extracted_text, result.detected_skills);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ""; // reset so re-uploading same file works
  };

  if (cvUploaded) {
    return (
      <div className="card">
        <div className="card-title">
          <span>📄</span> CV Uploaded
        </div>
        <div className="alert alert-success" style={{ marginBottom: 12 }}>
          ✓ CV processed successfully — {cvSkills.length} skills detected.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {cvSkills.slice(0, 20).map((skill) => (
            <span key={skill} className="tag tag-amber">
              {skill}
            </span>
          ))}
          {cvSkills.length > 20 && (
            <span className="tag tag-blue">+{cvSkills.length - 20} more</span>
          )}
        </div>
        <button className="btn btn-ghost" onClick={clearCv}>
          ✕ Remove CV
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">
        <span>📄</span> Upload Your CV
      </div>

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
        <div className="upload-zone-icon">{loading ? "⏳" : "📁"}</div>
        <div className="upload-zone-label">
          {loading ? (
            <span>Parsing your CV…</span>
          ) : (
            <>
              <strong>Click to browse</strong> or drag & drop
              <br />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                PDF or DOCX · max 5 MB
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

      {error && (
        <div className="alert alert-error" style={{ marginTop: 12 }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
}
