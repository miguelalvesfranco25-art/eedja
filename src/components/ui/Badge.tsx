import type { ReactNode } from "react";

export interface BadgeProps {
  tone?: "primary" | "accent" | "secondary" | "warning" | "danger" | "success" | "neutral";
  children?: ReactNode;
}

export function Badge({ tone = "neutral", children }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
