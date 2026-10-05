import * as esbuild from "esbuild";
import { rmSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outdir = path.join(root, "dist");

rmSync(outdir, { recursive: true, force: true });
mkdirSync(outdir, { recursive: true });

const isWatch = process.argv.includes("--watch");

/** @type {import('esbuild').BuildOptions} */
const options = {
  entryPoints: [path.join(root, "src", "main.tsx")],
  bundle: true,
  outdir,
  entryNames: "main",
  format: "esm",
  target: ["es2020"],
  jsx: "automatic",
  jsxImportSource: "react",
  sourcemap: true,
  minify: !isWatch,
  logLevel: "info",
  define: {
    "process.env.NODE_ENV": isWatch ? '"development"' : '"production"',
  },
  loader: {
    ".svg": "text",
  },
  metafile: true,
};

function copyPublic() {
  const publicDir = path.join(root, "public");
  for (const file of ["index.html"]) {
    const src = path.join(publicDir, file);
    if (existsSync(src)) copyFileSync(src, path.join(outdir, file));
  }
}

if (isWatch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  copyPublic();
  console.log("[eedja] watching for changes...");
  // keep process alive; caller (dev.mjs) manages lifecycle
  globalThis.__eedjaEsbuildCtx = ctx;
} else {
  const result = await esbuild.build(options);
  copyPublic();
  const jsSize = readFileSync(path.join(outdir, "main.js")).length;
  const cssPath = path.join(outdir, "main.css");
  const cssSize = existsSync(cssPath) ? readFileSync(cssPath).length : 0;
  console.log(`[eedja] build concluído: main.js ${(jsSize / 1024).toFixed(1)}kb, main.css ${(cssSize / 1024).toFixed(1)}kb`);
  writeFileSync(path.join(outdir, "metafile.json"), JSON.stringify(result.metafile));
}
