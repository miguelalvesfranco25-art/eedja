// Provedor de IA REAL via Gemini (Google AI Studio).
//
// IMPORTANTE — leia antes de depurar um problema aqui: este código NÃO foi
// testado com uma chamada real, porque o ambiente de nuvem onde o EEDJA foi
// construído bloqueia o acesso a generativelanguage.googleapis.com (só
// api.anthropic.com é liberado nessa rede). A implementação segue a
// documentação pública da API do Gemini (endpoint generateContent, formato
// de "parts" com inline_data para imagens, generationConfig.responseMimeType
// para forçar JSON), mas o primeiro teste de ponta a ponta precisa acontecer
// com o app rodando fora desta sandbox, com uma chave válida.

const DEFAULT_MODEL = "gemini-3.8-flash";

function buildPrompt({ subjectName, topic, sourceType, text }) {
  const topicLine = topic && topic.trim() ? `Tópico específico: "${topic.trim()}".` : "Nenhum tópico específico foi informado — identifique o assunto a partir do material.";

  const sourceLine =
    sourceType === "text"
      ? `O aluno colou o seguinte texto de estudo:\n\n"""\n${text ?? ""}\n"""`
      : "O aluno enviou uma imagem (foto de caderno, livro, quadro ou página de PDF) com o material de estudo, anexada a esta mensagem.";

  return `Você é um assistente educacional para alunos da educação básica brasileira (Ensino Fundamental e Médio), ajudando na matéria "${subjectName}". ${topicLine}

${sourceLine}

Gere, a partir do conteúdo acima:
1. Um guia de estudos elaborado e didático, em português do Brasil, organizado em seções.
2. Um quiz de exatamente 5 questões de múltipla escolha (4 alternativas cada, só uma correta) para o aluno testar se já entendeu o assunto.

Responda ESTRITAMENTE em JSON válido, sem markdown, sem texto fora do JSON, seguindo exatamente este formato:
{
  "studyGuide": {
    "title": "string curta com o nome do assunto",
    "overview": "string, 2-3 frases resumindo o assunto",
    "keyPoints": ["string", "string", "string", "string"],
    "sections": [
      { "heading": "string", "content": "string (pode ter vários parágrafos separados por \\n\\n)" }
    ]
  },
  "quiz": {
    "questions": [
      {
        "question": "string",
        "options": ["string", "string", "string", "string"],
        "correctIndex": 0,
        "explanation": "string explicando por que a resposta correta está certa"
      }
    ]
  }
}

Use linguagem simples e adequada à idade do aluno. Nunca invente fatos que não estejam no material e que não sejam de conhecimento básico da matéria — se o conteúdo da imagem não estiver legível, diga isso no campo "overview" em vez de inventar.`;
}

function extractJsonText(data) {
  const candidate = data?.candidates?.[0];
  const parts = candidate?.content?.parts;
  if (!Array.isArray(parts)) return null;
  const textPart = parts.find((p) => typeof p.text === "string");
  return textPart ? textPart.text : null;
}

function validateShape(parsed) {
  if (!parsed || typeof parsed !== "object") return false;
  const { studyGuide, quiz } = parsed;
  if (!studyGuide || typeof studyGuide.title !== "string" || typeof studyGuide.overview !== "string") return false;
  if (!Array.isArray(studyGuide.keyPoints) || !Array.isArray(studyGuide.sections)) return false;
  if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) return false;
  for (const q of quiz.questions) {
    if (typeof q.question !== "string" || !Array.isArray(q.options) || q.options.length < 2) return false;
    if (typeof q.correctIndex !== "number" || typeof q.explanation !== "string") return false;
  }
  return true;
}

export async function generateGemini({ subjectName, topic, sourceType, imageBase64, mimeType, text }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada no servidor.");
  }
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const promptText = buildPrompt({ subjectName, topic, sourceType, text });
  const parts = [{ text: promptText }];
  if (sourceType !== "text" && imageBase64) {
    parts.push({ inline_data: { mime_type: mimeType || "image/jpeg", data: imageBase64 } });
  }

  const body = {
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.4,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Gemini API retornou erro HTTP ${res.status}: ${errBody.slice(0, 300)}`);
  }

  const data = await res.json();
  const jsonText = extractJsonText(data);
  if (!jsonText) {
    throw new Error("Resposta do Gemini não trouxe conteúdo de texto esperado.");
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("Não foi possível interpretar o JSON retornado pelo Gemini.");
  }

  if (!validateShape(parsed)) {
    throw new Error("O JSON retornado pelo Gemini não está no formato esperado.");
  }

  return { studyGuide: parsed.studyGuide, quiz: parsed.quiz };
}
