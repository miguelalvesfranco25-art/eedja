import { LuCompass } from "react-icons/lu";
import { Link } from "../lib/router";
import { Button } from "../components/ui/Button";

export function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-code">404</div>
      <div className="empty-state-icon">
        <LuCompass size={26} aria-hidden="true" />
      </div>
      <h1 className="text-xl font-bold">Página não encontrada</h1>
      <p className="text-secondary" style={{ maxWidth: 380 }}>
        O endereço que você tentou acessar não existe no EEDJA.
      </p>
      <Link to="/">
        <Button>Voltar para o início</Button>
      </Link>
    </div>
  );
}
