import { useState } from "react";
import type { ChangeEvent } from "react";
import { LuTrash2, LuSave } from "react-icons/lu";
import { useNavigate } from "../lib/router";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { useToast } from "../hooks/useToast";
import { useStudent } from "../hooks/useAppData";
import * as storage from "../lib/storage";
import { LEVEL_LABELS, GRADES_BY_LEVEL } from "../data/subjects";
import type { SchoolLevel } from "../types";

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function Profile() {
  const student = useStudent();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [name, setName] = useState(student?.name ?? "");
  const [level, setLevel] = useState<SchoolLevel>(student?.level ?? "fundamental2");
  const [grade, setGrade] = useState(student?.grade ?? "");
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!student) return null;

  function handleSave() {
    if (!name.trim()) {
      showToast("O nome não pode ficar em branco.");
      return;
    }
    const validGrade = GRADES_BY_LEVEL[level].includes(grade) ? grade : GRADES_BY_LEVEL[level][0];
    storage.updateStudent({ name: name.trim(), level, grade: validGrade });
    setGrade(validGrade);
    showToast("Dados atualizados.");
  }

  function handleDeleteAll() {
    storage.deleteAllData();
    setConfirmOpen(false);
    navigate("/", { replace: true });
  }

  return (
    <div className="page">
      <PageHeader title="Meu perfil" subtitle="Seus dados nesta plataforma, salvos neste dispositivo." />

      <Card className="mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="profile-avatar">{initials(student.name)}</div>
          <div>
            <div className="font-bold text-lg">{student.name}</div>
            <div className="text-sm text-secondary">{student.school}</div>
          </div>
        </div>

        <Field label="Nome completo" htmlFor="profile-name">
          <input
            id="profile-name"
            className="input"
            type="text"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          />
        </Field>

        <Field label="Etapa de ensino" htmlFor="profile-level">
          <select
            id="profile-level"
            className="select"
            value={level}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              const nextLevel = e.target.value as SchoolLevel;
              setLevel(nextLevel);
              setGrade(GRADES_BY_LEVEL[nextLevel][0]);
            }}
          >
            {(Object.keys(LEVEL_LABELS) as SchoolLevel[]).map((l) => (
              <option key={l} value={l}>
                {LEVEL_LABELS[l]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Ano/série" htmlFor="profile-grade">
          <select
            id="profile-grade"
            className="select"
            value={grade}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setGrade(e.target.value)}
          >
            {GRADES_BY_LEVEL[level].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </Field>

        <Button onClick={handleSave}>
          <LuSave size={18} aria-hidden="true" />
          Salvar alterações
        </Button>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados e privacidade</CardTitle>
        </CardHeader>
        <p className="text-sm text-secondary mb-4">
          Todos os seus resumos, quizzes e notas ficam salvos apenas neste dispositivo. Apagar os dados remove tudo
          permanentemente e não pode ser desfeito.
        </p>
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>
          <LuTrash2 size={18} aria-hidden="true" />
          Apagar todos os meus dados
        </Button>
      </Card>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Apagar todos os dados?">
        <p className="text-sm text-secondary mb-5">
          Isso vai apagar seu perfil, todos os resumos gerados e o histórico de quizzes deste dispositivo. Essa ação
          não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" block onClick={() => setConfirmOpen(false)}>
            Cancelar
          </Button>
          <Button variant="danger" block onClick={handleDeleteAll}>
            Apagar tudo
          </Button>
        </div>
      </Modal>
    </div>
  );
}
