"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ProposalForm from "@/components/ProposalForm";
import CVUploader from "@/components/CVUploader";
import LinkedInFetcher from "@/components/LinkedInFetcher";

type Tab = "generate" | "cv" | "linkedin";

const TAB_TITLES: Record<Tab, string> = {
  generate: "Generate Proposal",
  cv:       "Upload Your CV",
  linkedin: "LinkedIn Import",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("generate");

  return (
    <div className="app-shell">
      {/* ── Header ──────────────────────────────────────── */}
      <header className="app-header">
        <div className="app-logo">
          Proposal<span>Writer</span>
        </div>
        <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--text-muted)" }}>
          AI-Powered · Platform-Aware
        </span>
      </header>

      {/* ── Sidebar ─────────────────────────────────────── */}
      <Sidebar activeTab={activeTab} onTabChange={(t) => setActiveTab(t as Tab)} />

      {/* ── Main Content ────────────────────────────────── */}
      <main className="app-main">
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 6 }}>
          {TAB_TITLES[activeTab]}
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: 24 }}>
          {activeTab === "generate" && "Fill in the job details below and let the AI craft the perfect proposal."}
          {activeTab === "cv"       && "Upload your CV to auto-detect skills and enrich your proposals."}
          {activeTab === "linkedin" && "Import your public LinkedIn profile to pull in your headline and skills."}
        </p>

        {activeTab === "generate" && <ProposalForm />}
        {activeTab === "cv"       && <CVUploader />}
        {activeTab === "linkedin" && <LinkedInFetcher />}
      </main>
    </div>
  );
}
