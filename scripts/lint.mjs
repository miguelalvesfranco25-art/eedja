// Minimal, dependency-free lint pass (no network access to install ESLint
// in this environment): runs the TypeScript compiler in --noEmit mode as a
// correctness/lint gate, then scans source files for the placeholder
// markers the spec explicitly forbids (TODO, FIXME, "coming soon",
// "em breve") in shipped feature code.
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const srcDir = path.join(root, "src");

let hasError = false;

console.log("[lint] executando tsc --noEmit...");
try {
  execFileSync(path.join(root, "node_modules", ".bin", "tsc"), ["--noEmit"], {
    cwd: root,
    stdio: "inherit",
  });
  console.log("[lint] tsc OK — nenhum erro de tipo.");
} catch {
  hasError = true;
}

const FORBIDDEN = [/\bTODO\b/, /\bFIXME\b/, /coming soon/i, /em breve/i];
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(entry)) {
      const content = readFileSync(full, "utf8");
      for (const re of FORBIDDEN) {
        if (re.test(content)) {
          console.error(`[lint] marcador proibido (${re}) encontrado em ${path.relative(root, full)}`);
          hasError = true;
        }
      }
    }
  }
}
walk(srcDir);

if (hasError) {
  console.error("[lint] falhou.");
  process.exit(1);
} else {
  console.log("[lint] tudo certo.");
}
