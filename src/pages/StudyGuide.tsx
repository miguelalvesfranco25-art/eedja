import { LuSparkles, LuArrowRight, LuClock, LuTarget } from "react-icons/lu";
import { useParams, Link } from "../lib/router";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { useMaterials, useAttempts } from "../hooks/useAppData";
import { getSubject } from "../data/subjects";
import { badgeToneForScore } from "../lib/stats";

export function StudyGuide() {
  const { materialId } = useParams<{ materialId: string }>();
  const materials = useMaterials();
  const attempts = useAttempts();
  const material = materials.find((m) => m.id === materialId);

  if (!material) {
    return (
      <div className="page">
        <EmptyState
          title="Resumo não encontrado"
          description="Esse guia de estudos pode ter sido removido."
          action={
            <Link to="/subjects">
              <Button>Ver matérias</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const subject = getSubject(material.subjectId);
  const materialAttempts = attempts.filter((a) => a.materialId === material.id);

  return (
    <div className="page">
      <PageHeader
        title={material.studyGuide.title}
        subtitle={`${subject?.name ?? "Matéria"} · ${new Date(material.createdAt).toLocaleDateString("pt-BR")}`}
      />

      <div className={`ai-mode-banner ${material.aiProvider}`}>
        <LuSparkles size={16} aria-hidden="true" />
        {material.aiProvider === "gemini"
          ? "Este resumo foi gerado pela IA real do Gemini a partir do seu material."
          : "Este resumo foi gerado em modo de demonstração — o conteúdo é um exemplo, não uma análise do seu material."}
      </div>

      <Card className="mb-4">
        <p className="study-guide-overview">{material.studyGuide.overview}</p>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Pontos-chave</CardTitle>
        </CardHeader>
        <ul className="key-points-list">
          {material.studyGuide.keyPoints.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      </Card>

      <Card className="mb-4">
        {material.studyGuide.sections.map((section, i) => (
          <div className="study-section" key={i}>
            <div className="study-section-heading">{section.heading}</div>
            <div className="study-section-content">{section.content}</div>
          </div>
        ))}
      </Card>

      {materialAttempts.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Tentativas anteriores</CardTitle>
          </CardHeader>
          <ul className="today-list">
            {materialAttempts.map((attempt) => (
              <li key={attempt.id}>
                <Link to={`/attempts/${attempt.id}`} className="today-item" style={{ textDecoration: "none" }}>
                  <div className="today-item-icon" style={{ background: "var(--secondary-soft)", color: "var(--secondary-strong)" }}>
                    <LuTarget size={18} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{attempt.correctCount} de {attempt.totalQuestions} corretas</div>
                    <div className="text-sm text-secondary flex items-center gap-1">
                      <LuClock size={13} aria-hidden="true" />
                      {new Date(attempt.completedAt).toLocaleString("pt-BR")}
                    </div>
                  </div>
                  <Badge tone={badgeToneForScore(attempt.score)}>{attempt.score}%</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Link to={`/materials/${material.id}/quiz`}>
        <Button block size="lg">
          Fazer o quiz
          <LuArrowRight size={18} aria-hidden="true" />
        </Button>
      </Link>
    </div>
  );
}
