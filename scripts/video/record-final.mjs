// NIYAMA finals cut (~2:17) — live circular end-to-end, 1080p crisp.
// Selects the Unpaid-Securities circular (HO/38/11/(9)2026), compiles, shows
// agents → obligation graph → rules → engine gap → officer sign-off → metrics.
// Deterministic: /api/pipeline/run is aborted so the instant fallback renders.
// Usage: node scripts/video/record-final.mjs
import { chromium } from "/opt/homebrew/lib/node_modules/@playwright/mcp/node_modules/playwright/index.mjs";
import fs from "fs";

const BASE = process.env.NIYAMA_BASE || "http://localhost:3009";
const OUT = "/tmp/niyama-video/rec";
fs.mkdirSync(OUT, { recursive: true });
const DUR = JSON.parse(fs.readFileSync("/tmp/niyama-video/durations.json", "utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function caption(page, text, sub = "") {
  await page.evaluate(({ text, sub }) => {
    let el = document.getElementById("nyx-cap");
    if (!el) {
      el = document.createElement("div");
      el.id = "nyx-cap";
      el.style.cssText = "position:fixed;left:50%;bottom:46px;transform:translateX(-50%);z-index:99999;max-width:1120px;padding:18px 34px;border-radius:20px;background:rgba(18,48,94,.94);backdrop-filter:blur(12px);color:#fff;font-family:system-ui,-apple-system,sans-serif;text-align:center;box-shadow:0 16px 50px rgba(12,26,46,.4);transition:opacity .4s ease;pointer-events:none;";
      document.body.appendChild(el);
    }
    if (!text) { el.style.opacity = "0"; return; }
    el.style.opacity = "1";
    el.innerHTML = `<div style="font-size:21px;font-weight:700;line-height:1.35">${text}</div>` + (sub ? `<div style="font-size:15px;color:#9fd9f5;margin-top:5px;font-weight:500">${sub}</div>` : "");
  }, { text, sub });
}
async function smoothScroll(page, to, duration) {
  await page.evaluate(({ to, duration }) => new Promise((res) => {
    const from = window.scrollY, start = performance.now();
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const step = (now) => { const p = Math.min((now - start) / duration, 1); window.scrollTo(0, from + (to - from) * ease(p)); if (p < 1) requestAnimationFrame(step); else res(); };
    requestAnimationFrame(step);
  }), { to, duration });
}

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } },
    deviceScaleFactor: 2, // crisp text, downsampled to 1080p
  });
  const page = await ctx.newPage();
  // determinism: force the instant fallback compile (no variable live-LLM wait)
  await page.route("**/api/pipeline/run", (r) => r.abort());

  const marks = [];
  const t0 = Date.now();
  async function scene(id, fn) {
    const start = Date.now();
    marks.push({ id, at: (start - t0) / 1000 });
    await fn().catch((e) => console.log("scene", id, "warn", e.message));
    const need = (DUR[id] ?? 5) * 1000;
    const rem = need - (Date.now() - start);
    if (rem > 0) await sleep(rem);
  }

  // s01 title
  await scene("s01_title", async () => {
    await page.setContent(`<body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(1200px 640px at 78% -12%,rgba(42,169,232,.16),transparent 60%),radial-gradient(900px 520px at -8% 24%,rgba(10,88,196,.1),transparent 55%),#f7fafd;font-family:system-ui,-apple-system,sans-serif;">
      <div style="text-align:center"><div style="font-size:15px;letter-spacing:.35em;color:#2aa9e8;font-weight:700;margin-bottom:22px">SEBI TECHSPRINT 2026 · FINALE · TEAM KELLTON</div>
      <div style="font-size:108px;font-weight:800;color:#12305e;letter-spacing:-.03em;line-height:1">NIYAMA<span style="color:#2aa9e8">.</span></div>
      <div style="font-size:27px;color:#45536e;margin-top:26px;font-weight:600">The Agentic Compliance Operating System</div>
      <div style="font-size:17px;color:#8794ad;margin-top:14px">Regulatory text → Obligation Graph → Rules-as-Code → operational action</div></div></body>`);
  });

  // s02 problem — landing
  await scene("s02_problem", async () => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await caption(page, "Regulation lives as prose. Compliance runs as software.", "Hundreds of circulars a year · weeks from circular to control — until now");
    await sleep(3500);
    await smoothScroll(page, 780, 2200);
  });

  // s03 live feed — select the HO/38 unpaid-securities circular
  await scene("s03_feed", async () => {
    await page.goto(`${BASE}/demo`, { waitUntil: "networkidle" });
    await caption(page, "A live example — a new circular just landed on the SEBI feed", "HO/38/11/(9)2026-MIRSD-POD · Handling of Client's Unpaid Securities · amends Para 46");
    await sleep(1600);
    await page.click('button:has-text("Handling of Client")', { timeout: 8000 }).catch(() => {});
    await sleep(1200);
  });

  // s04 compile + agents
  await scene("s04_compile", async () => {
    await caption(page, "One click — four agents compile the actual text", "Watcher → Parser → Interpretation → Mapping · keys never touch the browser");
    await page.click('button:has-text("Compile this circular")', { timeout: 8000 }).catch(() => {});
    await sleep(1500);
  });

  // s05 obligation graph
  await scene("s05_graph", async () => {
    await page.click('button:has-text("Obligation Graph")', { timeout: 6000 }).catch(() => {});
    await caption(page, "The output is an object, not an answer — the Obligation Graph", "Clause anchor · role · trigger · deadline · evidence contract — every node cited");
    await sleep(1500);
    await smoothScroll(page, 240, 1400);
  });

  // s06 rules + engine gap
  await scene("s06_engine", async () => {
    await page.click('button:has-text("Rules-as-Code")', { timeout: 6000 }).catch(() => {});
    await caption(page, "Deterministic Rules-as-Code, run over the firm's data", "18 client pledges with no communication on record → breach of Para 46.2, flagged");
    await sleep(2500);
    await page.click('button:has-text("Obligation Graph")', { timeout: 6000 }).catch(() => {});
    await smoothScroll(page, 620, 1600);
  });

  // s07 sign-off + ledger
  await scene("s07_signoff", async () => {
    await caption(page, "A human stays in control — the officer signs off", "Evidence bound · gap → remediation task · hash-chained audit trail");
    await page.click('button:has-text("Approve & activate")', { timeout: 6000 }).catch(() => {});
    await sleep(2500);
    await page.evaluate(() => { const el = [...document.querySelectorAll("p")].find((p) => (p.textContent || "").includes("audit")); el?.scrollIntoView({ behavior: "smooth", block: "center" }); }).catch(() => {});
  });

  // s08 metrics
  await scene("s08_metrics", async () => {
    await caption(page, "");
    await page.goto(`${BASE}/metrics`, { waitUntil: "networkidle" });
    await caption(page, "The number that beats a demo — measured, not claimed", "Precision 1.00 · F1 0.97 · clause-anchor accuracy 100% · deterministic scorer, no LLM");
    await sleep(2000);
    await smoothScroll(page, 260, 1600);
  });

  // s09 end
  await scene("s09_end", async () => {
    await caption(page, "");
    await page.setContent(`<body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0e2246,#12305e 55%,#174a8c);font-family:system-ui,-apple-system,sans-serif;">
      <div style="text-align:center;color:#fff"><div style="font-size:58px;font-weight:800;letter-spacing:-.02em;line-height:1.25">From regulatory text<br/>to <span style="color:#2aa9e8">regulatory certainty.</span></div>
      <div style="font-size:22px;color:rgba(255,255,255,.78);margin-top:30px;font-weight:500">NIYAMA · SEBI TechSprint 2026 · Team Kellton</div>
      <div style="font-size:14px;color:rgba(255,255,255,.5);margin-top:14px">sebi-niyama.vercel.app · all demo data synthetic</div></div></body>`);
  });

  fs.writeFileSync(`${OUT}/marks.json`, JSON.stringify(marks, null, 1));
  await ctx.close();
  await browser.close();
  console.log("DONE", JSON.stringify(marks.map((m) => `${m.id}@${m.at.toFixed(1)}`)));
};
run().catch((e) => { console.error(e); process.exit(1); });
