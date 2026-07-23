#!/usr/bin/env node
/** One-command local stack: Vite + TS tutor server (unless TUTOR_DISABLED=1). */
import { spawn } from "node:child_process";

const disabled = ["1", "true", "yes"].includes(String(process.env.TUTOR_DISABLED ?? "").toLowerCase());

const children = [];

function run(name, args, color) {
  const child = spawn(name, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });
  children.push(child);
  child.on("exit", (code, signal) => {
    if (signal) return;
    // If Vite exits, tear down tutor (and vice versa).
    for (const c of children) {
      if (c !== child && !c.killed) c.kill("SIGTERM");
    }
    process.exit(code ?? 1);
  });
  return child;
}

if (!disabled) {
  run("pnpm", ["exec", "tsx", "server/tutor/index.ts"], "tutor");
}
run("pnpm", ["exec", "vite"], "vite");

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    for (const c of children) {
      if (!c.killed) c.kill(sig);
    }
  });
}
