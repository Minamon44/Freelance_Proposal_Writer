"use client";

/**
 * ProposalOutput – renders the generated proposal with copy, metadata,
 * skill gap list, and budget suggestion.
 */

import { useState } from "react";
import type { ProposalResponse } from "@/lib/api";

interface Props {
  result: ProposalResponse;
}

export default function ProposalOutput({ result }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.proposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div className="card-title" style={{ marginBottom: 0 }}>
          <span>✨</span> Generated Proposal
        </div>
        <button
          className={`btn btn-ghost copy-btn${copied ? " copied" : ""}`}
          onClick={handleCopy}
          style={{ flexShrink: 0 }}
        >
          {copied ? "✓ Copied!" : "📋 Copy"}
        </button>
      </div>

      {/* Proposal body */}
      <div className="proposal-output">{result.proposal}</div>

      {/* Metadata row */}
      <div className="proposal-meta">
        <span className="tag tag-amber">{result.platform}</span>
        <span className="tag tag-blue">{result.language}</span>
        <span className="tag tag-blue">{result.tone}</span>
        <span className="tag tag-green">~{result.word_count} words</span>
        {result.suggested_budget && (
          <span className="tag tag-amber">💰 {result.suggested_budget}</span>
        )}
      </div>

      {/* Skill gaps */}
      {result.skill_gaps.length > 0 && (
        <>
          <div className="divider" />
          <div style={{ marginBottom: 8 }}>
            <strong style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              ⚠ Skill Gaps Detected
            </strong>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
              These skills appear in the job posting but not your profile:
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {result.skill_gaps.map((gap) => (
              <div key={gap} className="skill-gap-item">
                <span style={{ color: "var(--error)" }}>✕</span>
                <span className="mono">{gap}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
