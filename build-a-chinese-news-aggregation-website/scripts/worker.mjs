import { spawn } from "node:child_process";
import { loadEnv } from "./env.mjs";

loadEnv();

const minutes = Number.parseInt(process.env.FETCH_INTERVAL_MINUTES || "30", 10);
const intervalMs = Math.max(1, minutes) * 60 * 1000;

function runFetch() {
  const child = spawn(process.execPath, ["scripts/fetch-news.mjs"], {
    stdio: "inherit",
    shell: false
  });

  child.on("exit", (code) => {
    if (code !== 0) {
      console.error(`Fetch exited with code ${code}.`);
    }
  });
}

runFetch();
setInterval(runFetch, intervalMs);
console.log(`News worker running every ${minutes} minutes.`);
