// Tipos centrais do domínio do EEDJA. Nenhum "any": tudo que trafega entre
// telas, storage e a API passa por um destes formatos.

export type SchoolLevel = "fundamental2" | "medio";

export interface Subject {
  id: string;
  name: string;
  level: SchoolLevel;
}

export interface StudentProfile {
  id: string;
  name: string;
  level: SchoolLevel;
  grade: string; // ex: "7º ano", "2ª série"
  school: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyGuideSection {
  heading: string;
  content: string;
}

export interface StudyGuide {
  title: string;
  overview: string;
  keyPoints: string[];
  sections: StudyGuideSection[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export type CaptureSource = "photo" | "pdf" | "text";

export interface StudyMaterial {
  id: string;
  subjectId: string;
  topic: string;
  sourceType: CaptureSource;
  studyGuide: StudyGuide;
  quiz: Quiz;
  aiProvider: "mock" | "gemini";
  createdAt: string;
}

export interface QuizAnswer {
  questionIndex: number;
  selectedIndex: number;
  correct: boolean;
}

export interface QuizAttempt {
  id: string;
  materialId: string;
  subjectId: string;
  score: number; // 0-100
  totalQuestions: number;
  correctCount: number;
  answers: QuizAnswer[];
  completedAt: string;
}

export interface AnalyzeRequestPayload {
  subjectId: string;
  subjectName: string;
  topic: string;
  sourceType: CaptureSource;
  imageBase64?: string;
  mimeType?: string;
  text?: string;
}

export interface AnalyzeResponsePayload {
  studyGuide: StudyGuide;
  quiz: Quiz;
  aiProvider: "mock" | "gemini";
}
