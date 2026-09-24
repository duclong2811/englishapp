import { spawnSync } from "node:child_process";

const executable = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(executable, ["opennextjs-cloudflare", "build"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, CF_PREVIEW: "1" },
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
