import type { ReactNode } from "react";
import { Card } from "./Card";

export interface StatCardProps {
  icon: ReactNode;
  value: string;
  label: string;
  tone?: "primary" | "accent" | "secondary";
}

export function StatCard({ icon, value, label, tone = "primary" }: StatCardProps) {
  const bg = tone === "accent" ? "var(--accent-soft)" : tone === "secondary" ? "var(--secondary-soft)" : "var(--primary-soft)";
  const color = tone === "accent" ? "var(--accent-ink)" : tone === "secondary" ? "var(--secondary-strong)" : "var(--primary)";
  return (
    <Card className="stat-card">
      <div className="stat-card-icon" style={{ background: bg, color }}>
        {icon}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </Card>
  );
}
