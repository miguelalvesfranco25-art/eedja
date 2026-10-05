import { LuChartBar, LuTarget, LuClock } from "react-icons/lu";
import { Link } from "../lib/router";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { Card, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";
import { useAttempts } from "../hooks/useAppData";
import { getSubject } from "../data/subjects";
import { averageScore, performanceBySubject, badgeToneForScore } from "../lib/stats";

export function Performance() {
  const attempts = useAttempts();
  const bySubject = performanceBySubject(attempts);

  return (
    <div className="page">
      <PageHeader title="Minhas notas" subtitle="Seu desempenho nos quizzes, matéria por matéria." />

      {attempts.length === 0 ? (
        <EmptyState
          icon={<LuChartBar size={24} aria-hidden="true" />}
          title="Nenhum quiz respondido ainda"
          description="Faça uma captura e responda o quiz para começar a acompanhar suas notas."
          action={
            <Link to="/capture">
              <Button>Fazer minha primeira captura</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-2 mb-6">
            <StatCard icon={<LuTarget size={18} aria-hidden="true" />} value={String(attempts.length)} label="Quizzes respondidos" />
            <StatCard
              icon={<LuChartBar size={18} aria-hidden="true" />}
              value={`${averageScore(attempts)}%`}
              label="Média geral"
              tone="secondary"
            />
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Desempenho por matéria</CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-3">
              {bySubject.map((perf) => {
                const subject = getSubject(perf.subjectId);
                return (
                  <div className="subject-performance-row" key={perf.subjectId}>
                    <div className="flex-1" style={{ minWidth: 0 }}>
                      <div className="font-semibold truncate">{subject?.name ?? "Matéria"}</div>
                      <div className="text-sm text-secondary flex items-center gap-1 mt-1">
                        <LuClock size={13} aria-hidden="true" />
                        {perf.attemptCount} {perf.attemptCount === 1 ? "tentativa" : "tentativas"}
                        {perf.lastAttemptAt && ` · ${new Date(perf.lastAttemptAt).toLocaleDateString("pt-BR")}`}
                      </div>
                    </div>
                    <Badge tone={badgeToneForScore(perf.average)}>{perf.average}%</Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}

      <Card className="boletim-placeholder">
        <div className="font-semibold mb-1">Boletim oficial da escola</div>
        <p className="text-sm text-secondary">
          Esta área vai mostrar as notas oficiais do boletim assim que a escola integrar os dados com o EEDJA. Por
          enquanto, o acompanhamento acima é baseado só nos quizzes feitos aqui no app.
        </p>
      </Card>
    </div>
  );
}
