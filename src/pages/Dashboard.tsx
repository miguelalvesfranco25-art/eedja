import { LuBookOpen, LuTarget, LuChartBar, LuCamera, LuArrowRight, LuClock } from "react-icons/lu";
import { Link } from "../lib/router";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { Card, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Badge } from "../components/ui/Badge";
import { useStudent, useMaterials, useAttempts } from "../hooks/useAppData";
import { getSubject, LEVEL_LABELS } from "../data/subjects";
import { averageScore, badgeToneForScore } from "../lib/stats";

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

export function Dashboard() {
  const student = useStudent();
  const materials = useMaterials();
  const attempts = useAttempts();

  if (!student) return null;

  const avg = averageScore(attempts);
  const recentMaterials = materials.slice(0, 5);

  return (
    <div className="page">
      <PageHeader
        title={`Olá, ${firstName(student.name)}`}
        subtitle={`${LEVEL_LABELS[student.level]} · ${student.grade} · ${student.school}`}
        action={
          <Link to="/capture">
            <Button>
              <LuCamera size={18} aria-hidden="true" />
              Nova captura
            </Button>
          </Link>
        }
      />

      <div className="grid grid-3 mb-6">
        <StatCard icon={<LuBookOpen size={18} aria-hidden="true" />} value={String(materials.length)} label="Resumos gerados" />
        <StatCard
          icon={<LuTarget size={18} aria-hidden="true" />}
          value={String(attempts.length)}
          label="Quizzes respondidos"
          tone="accent"
        />
        <StatCard
          icon={<LuChartBar size={18} aria-hidden="true" />}
          value={attempts.length > 0 ? `${avg}%` : "—"}
          label="Média geral"
          tone="secondary"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Continue estudando</CardTitle>
          <Link to="/subjects" className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
            Ver matérias
          </Link>
        </CardHeader>

        {recentMaterials.length === 0 ? (
          <EmptyState
            icon={<LuBookOpen size={24} aria-hidden="true" />}
            title="Você ainda não criou nenhum resumo"
            description="Capture uma foto, um PDF ou um texto para gerar seu primeiro guia de estudos."
            action={
              <Link to="/capture">
                <Button>
                  <LuCamera size={18} aria-hidden="true" />
                  Fazer minha primeira captura
                </Button>
              </Link>
            }
          />
        ) : (
          <ul className="today-list">
            {recentMaterials.map((material) => {
              const subject = getSubject(material.subjectId);
              return (
                <li key={material.id}>
                  <Link to={`/materials/${material.id}`} className="today-item" style={{ textDecoration: "none" }}>
                    <div className="today-item-icon" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>
                      <LuBookOpen size={18} aria-hidden="true" />
                    </div>
                    <div className="flex-1" style={{ minWidth: 0 }}>
                      <div className="font-semibold truncate">{material.studyGuide.title}</div>
                      <div className="text-sm text-secondary truncate">{subject?.name ?? "Matéria"}</div>
                    </div>
                    {material.aiProvider === "mock" && <Badge tone="warning">demonstração</Badge>}
                    <LuArrowRight size={18} aria-hidden="true" style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {attempts.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Última tentativa</CardTitle>
            <Link to="/performance" className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
              Ver desempenho
            </Link>
          </CardHeader>
          <div className="flex items-center gap-3">
            <Badge tone={badgeToneForScore(attempts[0].score)}>{attempts[0].score}%</Badge>
            <div className="flex items-center gap-2 text-sm text-secondary">
              <LuClock size={14} aria-hidden="true" />
              {new Date(attempts[0].completedAt).toLocaleString("pt-BR")}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
