import { useState } from "react";
import { LuArrowRight, LuCheck, LuX } from "react-icons/lu";
import { useParams, useNavigate, Link } from "../lib/router";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import { EmptyState } from "../components/ui/EmptyState";
import { useMaterials } from "../hooks/useAppData";
import * as storage from "../lib/storage";
import { genId } from "../lib/id";
import type { QuizAnswer, QuizAttempt } from "../types";

const LETTERS = ["A", "B", "C", "D", "E"];

export function Quiz() {
  const { materialId } = useParams<{ materialId: string }>();
  const navigate = useNavigate();
  const materials = useMaterials();
  const material = materials.find((m) => m.id === materialId);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);

  if (!material) {
    return (
      <div className="page">
        <EmptyState
          title="Quiz não encontrado"
          description="Esse quiz pode ter sido removido."
          action={
            <Link to="/subjects">
              <Button>Ver matérias</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const questions = material.quiz.questions;
  const question = questions[questionIndex];
  const isLastQuestion = questionIndex === questions.length - 1;
  const hasAnswered = selectedIndex !== null;

  function selectOption(index: number) {
    if (hasAnswered) return;
    setSelectedIndex(index);
  }

  function confirmAndAdvance() {
    if (selectedIndex === null || !material) return;
    const correct = selectedIndex === question.correctIndex;
    const nextAnswers = [...answers, { questionIndex, selectedIndex, correct }];

    if (isLastQuestion) {
      const correctCount = nextAnswers.filter((a) => a.correct).length;
      const score = Math.round((correctCount / questions.length) * 100);
      const attempt: QuizAttempt = {
        id: genId("attempt"),
        materialId: material.id,
        subjectId: material.subjectId,
        score,
        totalQuestions: questions.length,
        correctCount,
        answers: nextAnswers,
        completedAt: new Date().toISOString(),
      };
      storage.saveAttempt(attempt);
      navigate(`/attempts/${attempt.id}`, { replace: true });
      return;
    }

    setAnswers(nextAnswers);
    setQuestionIndex((i) => i + 1);
    setSelectedIndex(null);
  }

  return (
    <div className="page">
      <PageHeader title={material.studyGuide.title} subtitle="Responda as perguntas para testar o que você aprendeu." />

      <div className="quiz-progress-label">
        Pergunta {questionIndex + 1} de {questions.length}
      </div>
      <ProgressBar value={((questionIndex + (hasAnswered ? 1 : 0)) / questions.length) * 100} label="Progresso do quiz" />

      <Card className="mt-4">
        <div className="quiz-question">{question.question}</div>
        <div className="quiz-options">
          {question.options.map((option, i) => {
            let state = "";
            if (hasAnswered) {
              if (i === question.correctIndex) state = "correct";
              else if (i === selectedIndex) state = "incorrect";
            } else if (i === selectedIndex) {
              state = "selected";
            }
            return (
              <button
                key={i}
                type="button"
                className={`quiz-option${state ? ` ${state}` : ""}`}
                onClick={() => selectOption(i)}
                disabled={hasAnswered}
              >
                <span className="quiz-option-letter">{LETTERS[i] ?? i + 1}</span>
                <span>{option}</span>
                {hasAnswered && i === question.correctIndex && (
                  <LuCheck size={18} aria-hidden="true" style={{ marginLeft: "auto", color: "var(--success)" }} />
                )}
                {hasAnswered && state === "incorrect" && (
                  <LuX size={18} aria-hidden="true" style={{ marginLeft: "auto", color: "var(--danger)" }} />
                )}
              </button>
            );
          })}
        </div>

        {hasAnswered && <div className="quiz-explanation">{question.explanation}</div>}
      </Card>

      {hasAnswered && (
        <Button block size="lg" className="mt-4" onClick={confirmAndAdvance}>
          {isLastQuestion ? "Ver resultado" : "Próxima pergunta"}
          <LuArrowRight size={18} aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
