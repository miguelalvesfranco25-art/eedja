import type { ReactNode } from "react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
        {title}
      </div>
      {description && <p className="text-sm mt-2">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
