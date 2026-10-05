import {
  LuSparkles,
  LuCamera,
  LuBrainCircuit,
  LuChartBar,
  LuGraduationCap,
  LuArrowRight,
  LuCheck,
} from "react-icons/lu";
import { Link } from "../lib/router";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useStudent } from "../hooks/useAppData";
import { LEVEL_LABELS } from "../data/subjects";

const FEATURES = [
  {
    icon: LuCamera,
    title: "Capture de qualquer jeito",
    desc: "Tire uma foto do caderno, do livro ou do quadro, envie um PDF ou simplesmente cole um texto.",
  },
  {
    icon: LuBrainCircuit,
    title: "Resumo gerado por IA",
    desc: "A IA organiza o conteúdo em um guia de estudos claro, com os pontos mais importantes em destaque.",
  },
  {
    icon: LuSparkles,
    title: "Quiz na hora",
    desc: "Depois de estudar, um quiz de 5 perguntas mostra se o conteúdo já foi entendido de verdade.",
  },
  {
    icon: LuChartBar,
    title: "Acompanhamento de notas",
    desc: "Veja sua evolução por matéria e identifique onde vale a pena reforçar os estudos.",
  },
];

const STEPS = [
  { title: "Capture o conteúdo", desc: "Foto, PDF ou texto — você escolhe a matéria e envia o material." },
  { title: "Estude com o resumo", desc: "A IA organiza um guia de estudos didático, com os pontos-chave do assunto." },
  { title: "Faça o quiz", desc: "Responda 5 perguntas para testar o que você aprendeu." },
  { title: "Acompanhe sua evolução", desc: "Veja suas notas por matéria e volte a estudar onde for preciso." },
];

export function Landing() {
  const student = useStudent();
  const ctaTo = student ? "/dashboard" : "/onboarding";
  const ctaLabel = student ? "Continuar estudando" : "Começar agora";

  return (
    <div>
      <header className="landing-header">
        <div className="flex items-center gap-2 font-bold text-lg">
          <span
            className="sidebar-brand-mark"
            aria-hidden="true"
            style={{ width: 34, height: 34, fontSize: "0.95rem" }}
          >
            E
          </span>
          EEDJA
        </div>
        <Link to={ctaTo}>
          <Button variant="secondary" size="sm">
            {student ? "Minha área" : "Entrar"}
          </Button>
        </Link>
      </header>

      <section className="landing-hero">
        <span className="landing-hero-badge">
          <LuGraduationCap size={16} aria-hidden="true" />
          E.E. Dr. José Augusto — Entre Folhas, MG
        </span>
        <h1>
          Estude mais rápido com a <span className="accent-word">EEDJA</span>
        </h1>
        <p className="landing-hero-slogan">
          A plataforma de estudos com inteligência artificial da sua escola.
        </p>
        <p className="landing-hero-text">
          Fotografe o material, receba um resumo organizado, teste o que aprendeu em um quiz e acompanhe
          sua evolução em todas as matérias — do Fundamental II ao Ensino Médio.
        </p>
        <div className="landing-cta-row">
          <Link to={ctaTo}>
            <Button size="lg">
              {ctaLabel}
              <LuArrowRight size={18} aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="landing-section">
        <h2 className="landing-section-title">Tudo que você precisa para estudar</h2>
        <p className="landing-section-subtitle">Pensado para todas as etapas da escola, em um só lugar.</p>
        <div className="feature-grid">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="feature-card">
                <div className="feature-card-icon" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>
                  <Icon size={22} aria-hidden="true" />
                </div>
                <div className="font-semibold mb-1">{f.title}</div>
                <p className="text-sm text-secondary">{f.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="landing-section">
        <h2 className="landing-section-title">Como funciona</h2>
        <p className="landing-section-subtitle">Do material bruto até o acompanhamento das notas, em quatro passos.</p>
        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <div key={s.title} className="step-card">
              <div className="step-number">{i + 1}</div>
              <div className="font-semibold mb-1">{s.title}</div>
              <p className="text-sm text-secondary">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <Card style={{ maxWidth: 720, margin: "0 auto" }}>
          <div className="card-title mb-3">Todas as etapas, todas as matérias</div>
          <div className="flex flex-col gap-2">
            {Object.values(LEVEL_LABELS).map((label) => (
              <div key={label} className="flex items-center gap-2 text-sm text-secondary">
                <LuCheck size={16} style={{ color: "var(--primary)" }} aria-hidden="true" />
                {label}
              </div>
            ))}
          </div>
        </Card>
      </section>

      <footer className="landing-footer">
        EEDJA — E.E. Dr. José Augusto, Entre Folhas, MG. Feito para ajudar nossos alunos a estudar melhor.
      </footer>
    </div>
  );
}
