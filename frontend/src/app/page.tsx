"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ProposalForm from "@/components/ProposalForm";
import ExperiencePanel from "@/components/ExperiencePanel";
import { getExperience } from "@/lib/api";
import { useProfileStore } from "@/store/profileUploadStore";

type Tab = "generate" | "experience";

const TAB_TITLES: Record<Tab, string> = {
  generate:   "Generate Proposal",
  experience: "Experience",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("generate");
  const setExperience = useProfileStore((s) => s.setExperience);

  useEffect(() => {
    getExperience()
      .then(setExperience)
      .catch(() => {
        // No stored experience yet — fine, the store keeps its empty defaults
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          {activeTab === "generate"   && "Fill in the job details below and let the AI craft the perfect proposal."}
          {activeTab === "experience" && "Upload your CV and add your portfolio link — saved once, used for every proposal."}
        </p>

        {activeTab === "generate"   && <ProposalForm />}
        {activeTab === "experience" && <ExperiencePanel />}
      </main>
    </div>
  );
}
