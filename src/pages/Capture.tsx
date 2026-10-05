import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { LuCamera, LuFileText, LuType, LuUpload, LuX, LuSparkles } from "react-icons/lu";
import { useNavigate, useParams, Link } from "../lib/router";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { LoadingState } from "../components/ui/LoadingState";
import { useToast } from "../hooks/useToast";
import * as storage from "../lib/storage";
import { genId } from "../lib/id";
import { analyzeAndGenerate, fileToBase64, AiRequestError } from "../lib/ai";
import { subjectsByLevel, getSubject, LEVEL_LABELS } from "../data/subjects";
import { iconForSubject } from "../lib/subjectIcons";
import type { CaptureSource, SchoolLevel, StudentProfile, StudyMaterial } from "../types";

const SOURCE_TABS: { id: CaptureSource; label: string; icon: typeof LuCamera }[] = [
  { id: "photo", label: "Foto", icon: LuCamera },
  { id: "pdf", label: "PDF", icon: LuFileText },
  { id: "text", label: "Texto", icon: LuType },
];

function defaultLevel(student: StudentProfile | null): SchoolLevel {
  return student?.level ?? "fundamental2";
}

export function Capture() {
  const { subjectId: subjectIdFromRoute } = useParams<{ subjectId?: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const student = storage.getStudent();

  const [level, setLevel] = useState<SchoolLevel>(defaultLevel(student));
  const [subjectId, setSubjectId] = useState<string>(subjectIdFromRoute ?? "");
  const [topic, setTopic] = useState("");
  const [sourceType, setSourceType] = useState<CaptureSource>("photo");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMode, setAiMode] = useState<"mock" | "gemini" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lockedSubject = subjectIdFromRoute ? getSubject(subjectIdFromRoute) : undefined;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { aiProvider?: "mock" | "gemini" } | null) => {
        if (!cancelled && data?.aiProvider) setAiMode(data.aiProvider);
      })
      .catch(() => {
        // Sem conexão com o servidor ainda — o banner simplesmente não aparece.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!file || sourceType === "pdf") {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, sourceType]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFile(selected);
  }

  function resetSource() {
    setFile(null);
    setPreviewUrl(null);
    setText("");
  }

  const canSubmit =
    subjectId.length > 0 &&
    !isGenerating &&
    ((sourceType !== "text" && file !== null) || (sourceType === "text" && text.trim().length > 0));

  async function handleSubmit() {
    const subject = getSubject(subjectId);
    if (!subject) {
      showToast("Escolha uma matéria antes de continuar.");
      return;
    }

    setIsGenerating(true);
    try {
      let imageBase64: string | undefined;
      let mimeType: string | undefined;
      if (sourceType !== "text" && file) {
        imageBase64 = await fileToBase64(file);
        mimeType = file.type || (sourceType === "pdf" ? "application/pdf" : "image/jpeg");
      }

      const response = await analyzeAndGenerate({
        subjectId: subject.id,
        subjectName: subject.name,
        topic: topic.trim(),
        sourceType,
        imageBase64,
        mimeType,
        text: sourceType === "text" ? text.trim() : undefined,
      });

      const material: StudyMaterial = {
        id: genId("material"),
        subjectId: subject.id,
        topic: topic.trim(),
        sourceType,
        studyGuide: response.studyGuide,
        quiz: response.quiz,
        aiProvider: response.aiProvider,
        createdAt: new Date().toISOString(),
      };
      storage.saveMaterial(material);
      navigate(`/materials/${material.id}`);
    } catch (err) {
      const message = err instanceof AiRequestError ? err.message : "Não foi possível gerar o conteúdo agora. Tente novamente.";
      showToast(message);
    } finally {
      setIsGenerating(false);
    }
  }

  if (isGenerating) {
    return (
      <div className="page">
        <LoadingState label="Gerando seu guia de estudos e quiz..." />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader title="Nova captura" subtitle="Envie o material e a IA cuida do resto." />

      {aiMode && (
        <div className={`ai-mode-banner ${aiMode}`}>
          <LuSparkles size={16} aria-hidden="true" />
          {aiMode === "gemini"
            ? "Modo real: o conteúdo será gerado pela IA do Gemini a partir do que você enviar."
            : "Modo de demonstração: sem uma chave de IA real conectada, o conteúdo gerado é só um exemplo."}
        </div>
      )}

      <Card className="mb-4">
        <div className="card-title mb-3">Matéria</div>
        {lockedSubject ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="subject-card-icon" style={{ marginBottom: 0 }}>
                {(() => {
                  const Icon = iconForSubject(lockedSubject.name);
                  return <Icon size={18} aria-hidden="true" />;
                })()}
              </div>
              <div>
                <div className="font-semibold">{lockedSubject.name}</div>
                <div className="text-sm text-secondary">{LEVEL_LABELS[lockedSubject.level]}</div>
              </div>
            </div>
            <Link to="/capture" className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
              Trocar
            </Link>
          </div>
        ) : (
          <>
            <div className="level-tabs">
              {(["fundamental2", "medio"] as SchoolLevel[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`level-tab${level === l ? " active" : ""}`}
                  onClick={() => {
                    setLevel(l);
                    setSubjectId("");
                  }}
                >
                  {LEVEL_LABELS[l]}
                </button>
              ))}
            </div>
            <select
              className="select"
              value={subjectId}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSubjectId(e.target.value)}
            >
              <option value="">Selecione uma matéria</option>
              {subjectsByLevel(level).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </>
        )}
      </Card>

      <Card className="mb-4">
        <Field label="Tópico (opcional)" htmlFor="topic" hint="Ajuda a IA a focar no assunto certo, ex: 'Frações' ou 'Revolução Francesa'.">
          <input
            id="topic"
            className="input"
            type="text"
            placeholder="Qual é o assunto?"
            value={topic}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
          />
        </Field>

        <div className="field-label mb-2">Como você quer enviar o conteúdo?</div>
        <div className="capture-source-tabs">
          {SOURCE_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                className={`capture-source-tab${sourceType === tab.id ? " active" : ""}`}
                onClick={() => {
                  setSourceType(tab.id);
                  resetSource();
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <Icon size={16} aria-hidden="true" />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {sourceType === "text" ? (
          <Field label="Cole o texto de estudo" htmlFor="text-content">
            <textarea
              id="text-content"
              className="textarea"
              rows={8}
              placeholder="Cole aqui o texto do material que você quer estudar..."
              value={text}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
            />
          </Field>
        ) : file ? (
          <div className="capture-preview">
            {previewUrl ? (
              <img src={previewUrl} alt="Pré-visualização do arquivo enviado" className="capture-preview-thumb" />
            ) : (
              <div className="capture-preview-thumb flex items-center justify-center">
                <LuFileText size={22} aria-hidden="true" style={{ color: "var(--text-tertiary)" }} />
              </div>
            )}
            <div className="flex-1" style={{ minWidth: 0 }}>
              <div className="font-semibold truncate">{file.name}</div>
              <div className="text-sm text-secondary">{(file.size / 1024).toFixed(0)} KB</div>
            </div>
            <button type="button" className="btn btn-icon btn-ghost" onClick={resetSource} aria-label="Remover arquivo">
              <LuX size={18} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div
            className="dropzone"
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <div className="dropzone-icon">
              <LuUpload size={22} aria-hidden="true" />
            </div>
            <div className="font-semibold">{sourceType === "photo" ? "Enviar uma foto" : "Enviar um PDF"}</div>
            <p className="text-sm text-secondary mt-1">
              {sourceType === "photo" ? "Foto do caderno, livro ou quadro" : "Arquivo PDF com o conteúdo de estudo"}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              accept={sourceType === "photo" ? "image/*" : "application/pdf"}
              onChange={handleFileChange}
            />
          </div>
        )}
      </Card>

      <Button block size="lg" disabled={!canSubmit} onClick={handleSubmit}>
        <LuSparkles size={18} aria-hidden="true" />
        Gerar guia de estudos
      </Button>
    </div>
  );
}
