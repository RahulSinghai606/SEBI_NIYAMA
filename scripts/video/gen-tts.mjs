// Generate Indian-accent narration (Azure en-IN-NeerjaNeural) per scene,
// measure each clip's duration, and emit durations.json for the recorder.
// Usage: node scripts/video/gen-tts.mjs
import fs from "fs";
import { execSync } from "child_process";

const OUT = "/tmp/niyama-video";
fs.mkdirSync(OUT, { recursive: true });

// read Azure creds from .env.local
const env = fs.readFileSync(".env.local", "utf8");
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, "m")) || [])[1]?.trim() ?? "";
const REGION = get("AZURE_SPEECH_REGION") || "eastus";
const KEY = get("AZURE_AI_KEY");
if (!KEY) throw new Error("AZURE_AI_KEY missing");

// scene id → narration. Numbers spelled for clean TTS. Live-circular story.
const SCRIPT = [
  ["s01_title", ""], // title card holds silently
  ["s02_problem", "SEBI issues hundreds of circulars every year. Each one is prose. But compliance runs as software. Today, bridging that gap takes weeks of manual effort. NIYAMA compiles the circular — automatically."],
  ["s03_feed", "Here is a live example. A new circular has just landed on the SEBI feed — reference H-O 38, from July 2026, on handling clients' unpaid securities. It amends Paragraph 46 of the Master Circular for Stock Brokers."],
  ["s04_compile", "One click, and four A-I agents work the actual text. The Watcher detects and diffs it. The Parser segments every clause. Interpretation resolves the deadlines. Mapping wires each rule to the broker's systems. Keys never leave the server."],
  ["s05_graph", "The output is not an answer — it is an object. Each obligation carries its exact clause anchor, the responsible role, the trigger, the deadline, and an evidence contract that proves compliance. Nothing enters the register without a citation."],
  ["s06_engine", "Every obligation compiles into deterministic Rules-as-Code, then runs over the firm's data. Here the engine finds eighteen client pledges with no communication on record — a real breach of Paragraph 46 point 2, flagged automatically."],
  ["s07_signoff", "A human stays in control. The compliance officer reviews and signs off. Evidence is bound, the gap becomes a remediation task, and every step is written to a hash-chained audit trail."],
  ["s08_metrics", "And the proof. Measured against an independently labelled gold set, precision is one point zero, F-1 is zero point nine seven, and clause-anchor accuracy is one hundred percent."],
  ["s09_end", "NIYAMA. From regulatory text, to regulatory certainty."],
];

const durations = {};
for (const [id, text] of SCRIPT) {
  if (!text) {
    durations[id] = 3.0; // silent title hold
    continue;
  }
  const ssml = `<speak version="1.0" xml:lang="en-IN"><voice name="en-IN-NeerjaNeural"><prosody rate="+2%">${text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</prosody></voice></speak>`;
  const res = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": KEY,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-96kbitrate-mono-mp3",
      "User-Agent": "niyama-video",
    },
    body: ssml,
  });
  if (!res.ok) throw new Error(`TTS ${id} → ${res.status} ${await res.text()}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(`${OUT}/${id}.mp3`, buf);
  const dur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 ${OUT}/${id}.mp3`).toString().trim());
  // scene duration = narration + a small tail so captions/actions settle
  durations[id] = Math.round((dur + 1.1) * 100) / 100;
  console.log(`${id.padEnd(14)} ${dur.toFixed(2)}s → scene ${durations[id]}s`);
}

fs.writeFileSync(`${OUT}/durations.json`, JSON.stringify(durations, null, 2));
const total = Object.values(durations).reduce((a, b) => a + b, 0);
console.log(`\nTOTAL ~${total.toFixed(1)}s (${Math.floor(total / 60)}:${String(Math.round(total % 60)).padStart(2, "0")})`);
console.log("wrote", `${OUT}/durations.json`);
