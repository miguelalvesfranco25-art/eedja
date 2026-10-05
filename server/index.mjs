// Servidor HTTP do EEDJA — sem Express, sem dotenv, só a biblioteca padrão do
// Node. Duas responsabilidades:
//   1. Servir os arquivos estáticos gerados pelo build (dist/), com fallback
//      de SPA (qualquer rota desconhecida recebe index.html e o roteador do
//      React assume a navegação no cliente).
//   2. Expor POST /api/analyze, que recebe a captura do aluno (foto, PDF ou
//      texto) e devolve o guia de estudos + quiz gerados pelo provedor de IA
//      configurado (mock ou Gemini) — a chave de API nunca é exposta ao
//      navegador, só este processo a conhece.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateStudyMaterial, getActiveProviderName } from "./ai/provider.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT, "dist");
const PORT = Number(process.env.PORT) || 8787;
const MAX_BODY_BYTES = 15 * 1024 * 1024; // 15 MB — cobre uma foto de celular em base64

loadEnvFile(path.join(ROOT, ".env"));

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
  ".map": "application/json; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("PAYLOAD_TOO_LARGE"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function validateAnalyzePayload(payload) {
  if (!payload || typeof payload !== "object") return "Corpo da requisição inválido.";
  if (typeof payload.subjectId !== "string" || !payload.subjectId) return "subjectId é obrigatório.";
  if (typeof payload.subjectName !== "string" || !payload.subjectName) return "subjectName é obrigatório.";
  if (!["photo", "pdf", "text"].includes(payload.sourceType)) {
    return "sourceType deve ser 'photo', 'pdf' ou 'text'.";
  }
  if (payload.sourceType === "text" && (typeof payload.text !== "string" || !payload.text.trim())) {
    return "text é obrigatório quando sourceType é 'text'.";
  }
  if (payload.sourceType !== "text" && (typeof payload.imageBase64 !== "string" || !payload.imageBase64)) {
    return "imageBase64 é obrigatório quando sourceType é 'photo' ou 'pdf'.";
  }
  return null;
}

async function handleAnalyze(req, res) {
  let raw;
  try {
    raw = await readBody(req);
  } catch (err) {
    if (err instanceof Error && err.message === "PAYLOAD_TOO_LARGE") {
      return sendJson(res, 413, { error: "O arquivo enviado é grande demais." });
    }
    return sendJson(res, 400, { error: "Não foi possível ler a requisição." });
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return sendJson(res, 400, { error: "JSON inválido." });
  }

  const validationError = validateAnalyzePayload(payload);
  if (validationError) {
    return sendJson(res, 400, { error: validationError });
  }

  try {
    const result = await generateStudyMaterial(payload);
    return sendJson(res, 200, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[EEDJA] Erro ao gerar material de estudo:", message);
    const provider = getActiveProviderName();
    return sendJson(res, 502, {
      error:
        provider === "gemini"
          ? `Não foi possível gerar o conteúdo com o Gemini agora (${message}). Tente novamente em instantes.`
          : `Não foi possível gerar o conteúdo agora (${message}).`,
    });
  }
}

function streamFile(res, filePath, statusCode = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  res.writeHead(statusCode, { "Content-Type": contentType });
  const stream = fs.createReadStream(filePath);
  stream.on("error", () => {
    if (!res.headersSent) res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Não encontrado.");
  });
  stream.pipe(res);
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  let filePath = path.normalize(path.join(DIST_DIR, urlPath));

  // Impede sair da pasta dist/ via "..".
  if (!filePath.startsWith(DIST_DIR)) {
    filePath = DIST_DIR;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      return streamFile(res, filePath);
    }
    // Fallback de SPA: qualquer rota de página (não encontrada como arquivo
    // estático) recebe o index.html, e o roteador do React cuida do resto.
    return streamFile(res, path.join(DIST_DIR, "index.html"), 200);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/analyze") {
    handleAnalyze(req, res);
    return;
  }
  if (req.method === "GET" && req.url === "/api/health") {
    return sendJson(res, 200, { ok: true, aiProvider: getActiveProviderName() });
  }
  if (req.method === "GET") {
    return serveStatic(req, res);
  }
  sendJson(res, 405, { error: "Método não suportado." });
});

server.listen(PORT, () => {
  const provider = getActiveProviderName();
  console.log(`EEDJA rodando em http://localhost:${PORT}`);
  console.log(
    `Provedor de IA ativo: ${provider === "gemini" ? "Gemini (real)" : "Simulado (mock, sem custo)"}`
  );
  if (provider !== "gemini" && (process.env.AI_PROVIDER || "").toLowerCase() === "gemini") {
    console.warn(
      "AI_PROVIDER=gemini foi definido, mas GEMINI_API_KEY está ausente ou vazia — usando modo simulado."
    );
  }
});
