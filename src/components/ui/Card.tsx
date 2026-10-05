import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  children?: ReactNode;
}

export function Card({ interactive, className = "", children, ...rest }: CardProps) {
  const classes = ["card", interactive ? "card-interactive" : "", className].filter(Boolean).join(" ");
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={["card-header", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={["card-title", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}
