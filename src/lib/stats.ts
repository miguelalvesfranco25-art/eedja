import type { QuizAttempt } from "../types";

export function averageScore(attempts: QuizAttempt[]): number {
  if (attempts.length === 0) return 0;
  const sum = attempts.reduce((acc, a) => acc + a.score, 0);
  return Math.round(sum / attempts.length);
}

export function averageScoreForSubject(attempts: QuizAttempt[], subjectId: string): number {
  const filtered = attempts.filter((a) => a.subjectId === subjectId);
  return averageScore(filtered);
}

export interface SubjectPerformance {
  subjectId: string;
  attemptCount: number;
  average: number;
  lastAttemptAt: string | null;
}

export function performanceBySubject(attempts: QuizAttempt[]): SubjectPerformance[] {
  const bySubject = new Map<string, QuizAttempt[]>();
  for (const attempt of attempts) {
    const list = bySubject.get(attempt.subjectId) ?? [];
    list.push(attempt);
    bySubject.set(attempt.subjectId, list);
  }
  return Array.from(bySubject.entries())
    .map(([subjectId, list]) => ({
      subjectId,
      attemptCount: list.length,
      average: averageScore(list),
      lastAttemptAt: list.reduce<string | null>((latest, a) => {
        if (!latest) return a.completedAt;
        return a.completedAt > latest ? a.completedAt : latest;
      }, null),
    }))
    .sort((a, b) => (b.lastAttemptAt ?? "").localeCompare(a.lastAttemptAt ?? ""));
}

export function scoreTone(score: number): "success" | "warning" | "error" {
  if (score >= 70) return "success";
  if (score >= 50) return "warning";
  return "error";
}

/** Mesma faixa de scoreTone, mas no vocabulário de tons do componente Badge. */
export function badgeToneForScore(score: number): "success" | "warning" | "danger" {
  const tone = scoreTone(score);
  return tone === "error" ? "danger" : tone;
}
