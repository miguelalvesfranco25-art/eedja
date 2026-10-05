import { useState } from "react";
import type { ChangeEvent } from "react";
import { LuArrowLeft, LuArrowRight, LuSchool, LuCheck } from "react-icons/lu";
import { useNavigate } from "../lib/router";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Card } from "../components/ui/Card";
import * as storage from "../lib/storage";
import { genId } from "../lib/id";
import { LEVEL_LABELS, GRADES_BY_LEVEL } from "../data/subjects";
import type { SchoolLevel, StudentProfile } from "../types";

const SCHOOL_NAME = "E.E. Dr. José Augusto";
const TOTAL_STEPS = 4;

const LEVEL_OPTIONS: { level: SchoolLevel; desc: string }[] = [
  { level: "fundamental2", desc: "6º ao 9º ano" },
  { level: "medio", desc: "1ª à 3ª série" },
];

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<SchoolLevel | null>(null);
  const [grade, setGrade] = useState<string | null>(null);

  const canAdvance =
    (step === 0 && name.trim().length >= 2) ||
    (step === 1 && level !== null) ||
    (step === 2 && grade !== null) ||
    step === 3;

  function goNext() {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
      return;
    }
    finishOnboarding();
  }

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  function finishOnboarding() {
    if (!level || !grade) return;
    const now = new Date().toISOString();
    const student: StudentProfile = {
      id: genId("student"),
      name: name.trim(),
      level,
      grade,
      school: SCHOOL_NAME,
      createdAt: now,
      updatedAt: now,
    };
    storage.saveStudent(student);
    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="onboarding-shell">
      <div className="flex items-center gap-2 font-bold text-lg mb-6">
        <span className="sidebar-brand-mark" aria-hidden="true" style={{ width: 34, height: 34, fontSize: "0.95rem" }}>
          E
        </span>
        EEDJA
      </div>

      <div className="onboarding-progress-label">
        Passo {step + 1} de {TOTAL_STEPS}
      </div>
      <ProgressBar value={((step + 1) / TOTAL_STEPS) * 100} label="Progresso do cadastro" />

      {step === 0 && (
        <>
          <h1 className="onboarding-step-title">Qual é o seu nome?</h1>
          <p className="onboarding-step-subtitle">
            Vamos usar isso para personalizar sua área de estudos na {SCHOOL_NAME}.
          </p>
          <Field label="Nome completo" htmlFor="student-name">
            <input
              id="student-name"
              className="input"
              type="text"
              placeholder="Digite seu nome"
              value={name}
              autoFocus
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            />
          </Field>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="onboarding-step-title">Em que etapa você estuda?</h1>
          <p className="onboarding-step-subtitle">Isso ajusta as matérias disponíveis para o seu perfil.</p>
          <div className="choice-group">
            {LEVEL_OPTIONS.map((opt) => (
              <button
                key={opt.level}
                type="button"
                className={`choice-card${level === opt.level ? " selected" : ""}`}
                onClick={() => {
                  setLevel(opt.level);
                  setGrade(null);
                }}
              >
                <div className="choice-card-title">{LEVEL_LABELS[opt.level]}</div>
                <div className="choice-card-desc">{opt.desc}</div>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 2 && level && (
        <>
          <h1 className="onboarding-step-title">Qual é o seu ano ou série?</h1>
          <p className="onboarding-step-subtitle">{LEVEL_LABELS[level]}</p>
          <div className="choice-group">
            {GRADES_BY_LEVEL[level].map((g) => (
              <button
                key={g}
                type="button"
                className={`choice-card${grade === g ? " selected" : ""}`}
                onClick={() => setGrade(g)}
              >
                <div className="choice-card-title">{g}</div>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 3 && level && grade && (
        <>
          <h1 className="onboarding-step-title">Tudo certo?</h1>
          <p className="onboarding-step-subtitle">Confira seus dados antes de começar a estudar.</p>
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="empty-state-icon" style={{ margin: 0 }}>
                <LuSchool size={22} aria-hidden="true" />
              </div>
              <div>
                <div className="font-semibold">{name.trim()}</div>
                <div className="text-sm text-secondary">{SCHOOL_NAME}</div>
              </div>
            </div>
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <div className="profile-info-label">Etapa</div>
                <div className="profile-info-value">{LEVEL_LABELS[level]}</div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-label">Ano/série</div>
                <div className="profile-info-value">{grade}</div>
              </div>
            </div>
          </Card>
        </>
      )}

      <div className="onboarding-actions">
        {step > 0 && (
          <Button variant="secondary" onClick={goBack}>
            <LuArrowLeft size={18} aria-hidden="true" />
            Voltar
          </Button>
        )}
        <Button block={step === 0} onClick={goNext} disabled={!canAdvance}>
          {step === TOTAL_STEPS - 1 ? (
            <>
              Começar a estudar
              <LuCheck size={18} aria-hidden="true" />
            </>
          ) : (
            <>
              Continuar
              <LuArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
