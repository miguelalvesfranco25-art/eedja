import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNavigation } from "./BottomNavigation";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>
      <Sidebar />
      <main className="app-main" id="main-content">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
