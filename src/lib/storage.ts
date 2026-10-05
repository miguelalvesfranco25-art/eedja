// Camada central de persistência — única parte do app que toca o
// LocalStorage. Mantém fallback em memória caso o storage esteja
// indisponível, e protege contra dados corrompidos.
import type { StudentProfile, StudyMaterial, QuizAttempt } from "../types";
import { notifyDataChanged } from "./dataBus";

const KEYS = {
  student: "eedja:student",
  materials: "eedja:materials",
  attempts: "eedja:attempts",
} as const;

function isStorageAvailable(): boolean {
  try {
    const testKey = "__eedja_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export const storageAvailable = isStorageAvailable();
const memoryFallback = new Map<string, string>();

function readRaw(key: string): string | null {
  try {
    if (storageAvailable) return window.localStorage.getItem(key);
    return memoryFallback.get(key) ?? null;
  } catch {
    return memoryFallback.get(key) ?? null;
  }
}

function writeRaw(key: string, value: string): void {
  try {
    if (storageAvailable) {
      window.localStorage.setItem(key, value);
      notifyDataChanged();
      return;
    }
  } catch {
    // cai para o fallback em memória
  }
  memoryFallback.set(key, value);
  notifyDataChanged();
}

function removeRaw(key: string): void {
  try {
    if (storageAvailable) window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
  memoryFallback.delete(key);
  notifyDataChanged();
}

function readJSON<T>(key: string, fallback: T): T {
  const raw = readRaw(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`[storage] dados corrompidos em "${key}" — ignorando.`);
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  writeRaw(key, JSON.stringify(value));
}

// --- Estudante -----------------------------------------------------------
export function getStudent(): StudentProfile | null {
  return readJSON<StudentProfile | null>(KEYS.student, null);
}
export function saveStudent(student: StudentProfile): void {
  writeJSON(KEYS.student, student);
}
export function updateStudent(patch: Partial<StudentProfile>): StudentProfile | null {
  const current = getStudent();
  if (!current) return null;
  const updated: StudentProfile = { ...current, ...patch, updatedAt: new Date().toISOString() };
  saveStudent(updated);
  return updated;
}

// --- Materiais de estudo (resumos gerados pela IA) ------------------------
export function getMaterials(): StudyMaterial[] {
  return readJSON<StudyMaterial[]>(KEYS.materials, []);
}
export function getMaterial(id: string): StudyMaterial | undefined {
  return getMaterials().find((m) => m.id === id);
}
export function saveMaterial(material: StudyMaterial): void {
  const materials = getMaterials();
  materials.unshift(material);
  writeJSON(KEYS.materials, materials);
}

// --- Tentativas de quiz ----------------------------------------------------
export function getAttempts(): QuizAttempt[] {
  return readJSON<QuizAttempt[]>(KEYS.attempts, []);
}
export function saveAttempt(attempt: QuizAttempt): void {
  const attempts = getAttempts();
  attempts.unshift(attempt);
  writeJSON(KEYS.attempts, attempts);
}

// --- Apagar tudo -----------------------------------------------------------
export function deleteAllData(): void {
  Object.values(KEYS).forEach(removeRaw);
}
