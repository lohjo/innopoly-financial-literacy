#!/usr/bin/env node
/**
 * One-command local stack: Vite + Live tutor.
 *
 * TUTOR_RUNTIME=adk|ts|auto (default auto):
 *   - adk  → Python Google ADK + Gemini Live (tutor-service)
 *   - ts   → TypeScript @google/genai Live twin (server/tutor)
 *   - auto → adk if tutor-service/.venv exists, else ts
 *
 * TUTOR_DISABLED=1 → Vite only.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const disabled = ["1", "true", "yes"].includes(String(process.env.TUTOR_DISABLED ?? "").toLowerCase());
const requested = String(process.env.TUTOR_RUNTIME ?? "auto").toLowerCase();
const adkVenvPython = join(root, "tutor-service", ".venv", "bin", "python");
const adkReady = existsSync(adkVenvPython);

function resolveRuntime() {
  if (requested === "adk") return "adk";
  if (requested === "ts") return "ts";
  return adkReady ? "adk" : "ts";
}

const runtime = resolveRuntime();
const children = [];

function run(command, args, opts = {}) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
    cwd: opts.cwd ?? root,
  });
  children.push(child);
  child.on("exit", (code, signal) => {
    if (signal) return;
    for (const c of children) {
      if (c !== child && !c.killed) c.kill("SIGTERM");
    }
    process.exit(code ?? 1);
  });
  return child;
}

if (!disabled) {
  if (runtime === "adk") {
    if (!adkReady) {
      console.error(
        "[dev] TUTOR_RUNTIME=adk but tutor-service/.venv is missing. Falling back to ts twin.\n" +
          "      Create the venv or set TUTOR_RUNTIME=ts.",
      );
      run("pnpm", ["exec", "tsx", "server/tutor/index.ts"]);
    } else {
      console.log("[dev] Live tutor runtime: Google ADK + Gemini Live (tutor-service)");
      run(adkVenvPython, ["-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", process.env.TUTOR_PORT ?? "8080"], {
        cwd: join(root, "tutor-service"),
      });
    }
  } else {
    console.log("[dev] Live tutor runtime: TypeScript Gemini Live twin (server/tutor)");
    run("pnpm", ["exec", "tsx", "server/tutor/index.ts"]);
  }
}

run("pnpm", ["exec", "vite"]);

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    for (const c of children) {
      if (!c.killed) c.kill(sig);
    }
  });
}
