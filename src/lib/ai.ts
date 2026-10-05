// Cliente de IA do lado do navegador — nunca fala diretamente com o
// provedor de IA (Gemini). Sempre passa pelo servidor (/api/analyze), que é
// o único lugar que guarda a chave de API.
import type { AnalyzeRequestPayload, AnalyzeResponsePayload } from "../types";

export class AiRequestError extends Error {}

export async function analyzeAndGenerate(
  payload: AnalyzeRequestPayload
): Promise<AnalyzeResponsePayload> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      (body && typeof body === "object" && "error" in body && String((body as { error: unknown }).error)) ||
      `Falha ao processar o material (HTTP ${res.status}).`;
    throw new AiRequestError(message);
  }

  return (await res.json()) as AnalyzeResponsePayload;
}

/** Converte um File (foto ou PDF) em base64 puro, sem o prefixo data:. */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Falha ao ler o arquivo."));
        return;
      }
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler o arquivo."));
    reader.readAsDataURL(file);
  });
}
