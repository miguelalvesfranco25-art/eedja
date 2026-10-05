// Gerador de identificadores locais (perfil do aluno, materiais de estudo,
// tentativas de quiz). Usa crypto.randomUUID quando disponível e cai para um
// gerador simples baseado em Math.random caso contrário (alguns webviews
// mais antigos não expõem crypto.randomUUID).
export function genId(prefix: string): string {
  const hasRandomUUID =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function";
  const unique = hasRandomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${unique}`;
}
