import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export function loadEnv() {
  for (const filename of [".env.local", ".env"]) {
    const path = resolve(filename);
    if (!existsSync(path)) {
      continue;
    }

    const lines = readFileSync(path, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }

      const [key, ...rest] = trimmed.split("=");
      if (!process.env[key]) {
        process.env[key] = rest.join("=").replace(/^["']|["']$/g, "");
      }
    }
  }
}
