// Seletor de provedor de IA. Controlado pela variável de ambiente AI_PROVIDER:
//   "gemini" + GEMINI_API_KEY configurada -> usa a IA real do Google Gemini.
//   qualquer outro caso                   -> usa o provedor simulado (mock),
//                                            sem custo e sem acesso à rede.
//
// Esta é a única parte do servidor que decide "mock ou real" — tanto a rota
// /api/analyze quanto a mensagem de status do servidor consultam
// getActiveProviderName() para que a decisão nunca fique duplicada/inconsistente.

import { generateMock } from "./mock.mjs";
import { generateGemini } from "./gemini.mjs";

export function getActiveProviderName() {
  const wanted = (process.env.AI_PROVIDER || "mock").toLowerCase();
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  if (wanted === "gemini" && hasKey) return "gemini";
  return "mock";
}

/**
 * Gera o guia de estudos + quiz a partir de uma captura (foto, PDF ou texto).
 * Nunca mistura conteúdo real com conteúdo simulado: se o provedor ativo for
 * "gemini" e a chamada falhar (chave inválida, rede, resposta malformada),
 * o erro sobe para quem chamou em vez de disfarçar a falha com conteúdo mock
 * — o app nunca deve apresentar um resumo de demonstração como se fosse uma
 * análise real do material do aluno.
 */
export async function generateStudyMaterial(request) {
  const provider = getActiveProviderName();
  if (provider === "gemini") {
    const result = await generateGemini(request);
    return { ...result, aiProvider: "gemini" };
  }
  const result = await generateMock(request);
  return { ...result, aiProvider: "mock" };
}
