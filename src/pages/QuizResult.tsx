import { LuRotateCcw, LuBookOpen, LuChartBar } from "react-icons/lu";
import { useParams, Link } from "../lib/router";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { useAttempts, useMaterials } from "../hooks/useAppData";
import { scoreTone } from "../lib/stats";

export function QuizResult() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const attempts = useAttempts();
  const materials = useMaterials();
  const attempt = attempts.find((a) => a.id === attemptId);
  const material = attempt ? materials.find((m) => m.id === attempt.materialId) : undefined;

  if (!attempt || !material) {
    return (
      <div className="page">
        <EmptyState
          title="Resultado não encontrado"
          description="Essa tentativa de quiz pode ter sido removida."
          action={
            <Link to="/performance">
              <Button>Ver meu desempenho</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const tone = scoreTone(attempt.score);
  const toneMessage =
    tone === "success" ? "Muito bem!" : tone === "warning" ? "Quase lá, vale revisar." : "Bora revisar esse conteúdo.";

  return (
    <div className="page">
      <PageHeader title="Resultado do quiz" subtitle={material.studyGuide.title} />

      <Card className="text-center mb-4">
        <div className={`result-score-ring ${tone}`}>{attempt.score}%</div>
        <div className="font-semibold text-lg">{toneMessage}</div>
        <p className="text-secondary text-sm mt-1">
          Você acertou {attempt.correctCount} de {attempt.totalQuestions} perguntas.
        </p>
      </Card>

      <Card className="mb-4">
        <div className="card-title mb-3">Revisão das perguntas</div>
        {attempt.answers.map((answer) => {
          const question = material.quiz.questions[answer.questionIndex];
          if (!question) return null;
          return (
            <div className="review-item" key={answer.questionIndex}>
              <div className={`review-item-icon ${answer.correct ? "correct" : "incorrect"}`}>
                {answer.correct ? "✓" : "✕"}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{question.question}</div>
                <div className="text-sm text-secondary mt-1">
                  {answer.correct
                    ? `Sua resposta: ${question.options[answer.selectedIndex]}`
                    : `Você respondeu "${question.options[answer.selectedIndex]}" — correto: "${question.options[question.correctIndex]}"`}
                </div>
              </div>
            </div>
          );
        })}
      </Card>

      <div className="flex gap-3 flex-wrap">
        <Link to={`/materials/${material.id}/quiz`} style={{ flex: 1 }}>
          <Button block variant="secondary">
            <LuRotateCcw size={18} aria-hidden="true" />
            Tentar novamente
          </Button>
        </Link>
        <Link to={`/materials/${material.id}`} style={{ flex: 1 }}>
          <Button block variant="secondary">
            <LuBookOpen size={18} aria-hidden="true" />
            Ver resumo
          </Button>
        </Link>
        <Link to="/performance" style={{ flex: 1 }}>
          <Button block>
            <LuChartBar size={18} aria-hidden="true" />
            Minhas notas
          </Button>
        </Link>
      </div>
    </div>
  );
}
