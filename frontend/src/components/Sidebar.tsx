"use client";

import { useProfileStore } from "@/store/profileUploadStore";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { cvUploaded, linkedInFetched, mergedSkills } = useProfileStore();

  const navItems = [
    { id: "generate",  icon: "✨", label: "Generate Proposal" },
    { id: "cv",        icon: "📄", label: "Upload CV",       badge: cvUploaded ? "✓" : undefined },
    { id: "linkedin",  icon: "🔗", label: "LinkedIn Import", badge: linkedInFetched ? "✓" : undefined },
  ];

  return (
    <aside className="app-sidebar">
      <div className="nav-section-label">Navigation</div>

      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-item${activeTab === item.id ? " active" : ""}`}
          onClick={() => onTabChange(item.id)}
        >
          <span>{item.icon}</span>
          <span style={{ flex: 1 }}>{item.label}</span>
          {item.badge && (
            <span className="tag tag-green" style={{ padding: "1px 6px", fontSize: "0.65rem" }}>
              {item.badge}
            </span>
          )}
        </button>
      ))}

      {mergedSkills.length > 0 && (
        <>
          <div className="divider" />
          <div className="nav-section-label">Profile Skills</div>
          <div style={{ padding: "0 12px", display: "flex", flexWrap: "wrap", gap: 4 }}>
            {mergedSkills.slice(0, 10).map((s) => (
              <span key={s} className="tag tag-amber" style={{ marginBottom: 2 }}>
                {s}
              </span>
            ))}
            {mergedSkills.length > 10 && (
              <span className="tag tag-blue">+{mergedSkills.length - 10}</span>
            )}
          </div>
        </>
      )}

      <div style={{ marginTop: "auto" }}>
        <div className="divider" />
        <div style={{ padding: "8px 12px", fontSize: "0.7rem", color: "var(--text-muted)" }}>
          Powered by Groq · llama-3.3-70b
        </div>
      </div>
    </aside>
  );
}
