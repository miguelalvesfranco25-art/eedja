import { useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import { Link } from "../lib/router";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useStudent, useMaterials } from "../hooks/useAppData";
import { subjectsByLevel, LEVEL_LABELS } from "../data/subjects";
import { iconForSubject } from "../lib/subjectIcons";
import type { SchoolLevel } from "../types";

const LEVELS: SchoolLevel[] = ["fundamental2", "medio"];

export function Subjects() {
  const student = useStudent();
  const materials = useMaterials();
  const [level, setLevel] = useState<SchoolLevel>(student?.level ?? "fundamental2");

  const subjects = subjectsByLevel(level);

  return (
    <div className="page">
      <PageHeader title="Matérias" subtitle="Escolha uma matéria para capturar um novo conteúdo de estudo." />

      <div className="level-tabs" role="tablist" aria-label="Etapa de ensino">
        {LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={level === l}
            className={`level-tab${level === l ? " active" : ""}`}
            onClick={() => setLevel(l)}
          >
            {LEVEL_LABELS[l]}
          </button>
        ))}
      </div>

      <div className="subject-grid">
        {subjects.map((subject) => {
          const Icon = iconForSubject(subject.name);
          const count = materials.filter((m) => m.subjectId === subject.id).length;
          return (
            <Link key={subject.id} to={`/capture/${subject.id}`} style={{ textDecoration: "none" }}>
              <Card interactive>
                <div className="subject-card-icon">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <div className="font-semibold mb-1">{subject.name}</div>
                <div className="flex items-center justify-between">
                  {count > 0 ? (
                    <Badge tone="primary">
                      {count} {count === 1 ? "resumo" : "resumos"}
                    </Badge>
                  ) : (
                    <span className="text-sm text-tertiary">Nenhum resumo ainda</span>
                  )}
                  <LuArrowRight size={16} aria-hidden="true" style={{ color: "var(--text-tertiary)" }} />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
