import type { Subject } from "../types";

// Lista de matérias por etapa de ensino, seguindo a BNCC (Base Nacional
// Comum Curricular) — cobre o Ensino Fundamental II e o Ensino Médio.
export const SUBJECTS: Subject[] = [
  // Ensino Fundamental II (6º ao 9º ano)
  { id: "f2-portugues", name: "Língua Portuguesa", level: "fundamental2" },
  { id: "f2-matematica", name: "Matemática", level: "fundamental2" },
  { id: "f2-ciencias", name: "Ciências", level: "fundamental2" },
  { id: "f2-historia", name: "História", level: "fundamental2" },
  { id: "f2-geografia", name: "Geografia", level: "fundamental2" },
  { id: "f2-arte", name: "Arte", level: "fundamental2" },
  { id: "f2-ed-fisica", name: "Educação Física", level: "fundamental2" },
  { id: "f2-ingles", name: "Inglês", level: "fundamental2" },
  { id: "f2-ens-religioso", name: "Ensino Religioso", level: "fundamental2" },

  // Ensino Médio
  { id: "m-portugues", name: "Língua Portuguesa", level: "medio" },
  { id: "m-literatura", name: "Literatura", level: "medio" },
  { id: "m-matematica", name: "Matemática", level: "medio" },
  { id: "m-fisica", name: "Física", level: "medio" },
  { id: "m-quimica", name: "Química", level: "medio" },
  { id: "m-biologia", name: "Biologia", level: "medio" },
  { id: "m-historia", name: "História", level: "medio" },
  { id: "m-geografia", name: "Geografia", level: "medio" },
  { id: "m-filosofia", name: "Filosofia", level: "medio" },
  { id: "m-sociologia", name: "Sociologia", level: "medio" },
  { id: "m-arte", name: "Arte", level: "medio" },
  { id: "m-ed-fisica", name: "Educação Física", level: "medio" },
  { id: "m-ingles", name: "Inglês", level: "medio" },
  { id: "m-espanhol", name: "Espanhol", level: "medio" },
];

export const LEVEL_LABELS: Record<Subject["level"], string> = {
  fundamental2: "Fundamental II",
  medio: "Ensino Médio",
};

export const GRADES_BY_LEVEL: Record<Subject["level"], string[]> = {
  fundamental2: ["6º ano", "7º ano", "8º ano", "9º ano"],
  medio: ["1ª série", "2ª série", "3ª série"],
};

export function subjectsByLevel(level: Subject["level"]): Subject[] {
  return SUBJECTS.filter((s) => s.level === level);
}

export function getSubject(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}
