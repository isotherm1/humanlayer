import "./prepare-assets.mjs";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
// Sites supplies Vite-style flags; keep the actual runtime on Next.js.
const args = process.argv.slice(2).filter((arg) => arg !== "--strictPort")
  .map((arg) => arg === "--host" ? "--hostname" : arg);
if (!args.includes("--hostname")) args.push("--hostname", "0.0.0.0");
if (!args.includes("--port")) args.push("--port", "4173");
const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "dev", ...args], { stdio: "inherit" });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("error", (error) => { console.error(error.message); process.exit(1); });
child.on("exit", (code) => process.exit(code ?? 1));
