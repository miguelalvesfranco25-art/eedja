import { Component, type ReactNode } from "react";
import { LuTriangleAlert } from "react-icons/lu";
import { Button } from "./ui/Button";

interface Props {
  children?: ReactNode;
}
interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    // eslint-disable-next-line no-console
    console.error("[EEDJA] erro inesperado capturado pelo ErrorBoundary:", error);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="not-found">
          <div className="empty-state-icon" style={{ color: "var(--danger)" }}>
            <LuTriangleAlert size={26} aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold">Algo deu errado</h1>
          <p className="text-secondary" style={{ maxWidth: 420 }}>
            Encontramos um problema inesperado ao carregar esta página. Você pode tentar recarregar
            — seus dados salvos neste dispositivo não são afetados.
          </p>
          <Button onClick={() => window.location.reload()}>Recarregar página</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
