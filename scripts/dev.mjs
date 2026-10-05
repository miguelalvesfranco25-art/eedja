// Builds once (unminified, watch mode kept alive) then serves dist/ with
// SPA fallback. Re-run `npm run dev` after pulling changes if you are not
// using an editor with a persistent terminal; this keeps the toolchain
// dependency-free (no extra dev-server package needed).
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function run(cmd, args) {
  const p = spawn(cmd, args, { stdio: "inherit", cwd: root });
  return p;
}

console.log("[eedja] iniciando build em modo watch...");
const build = run(process.execPath, [path.join(root, "scripts", "build.mjs"), "--watch"]);

// Give the first build a moment to finish before starting the server.
setTimeout(() => {
  run(process.execPath, [path.join(root, "server", "index.mjs")]);
}, 800);

process.on("SIGINT", () => {
  build.kill();
  process.exit(0);
});
