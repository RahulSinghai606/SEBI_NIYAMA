// NIYAMA v2 — scripted round-2 demo recording (~3:55) with narration sync marks.
// Usage: node scripts/record-demo-v2.mjs <durations.json> <outDir>
import { chromium } from "/opt/homebrew/lib/node_modules/@playwright/mcp/node_modules/playwright/index.mjs";
import fs from "fs";

const BASE = "http://localhost:3004";
const DUR = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const OUT = process.argv[3];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// per-scene sync marker: tiny solid-hue square, bottom-right corner.
// scene starts are recovered from the video by color-matching this square.
let SCENE_I = -1;
async function mark(page) {
  const hue = SCENE_I * 22.5;
  await page.evaluate((hue) => {
    let el = document.getElementById("nyx-mark");
    if (!el) {
      el = document.createElement("div");
      el.id = "nyx-mark";
      el.style.cssText = "position:fixed;right:0;bottom:0;width:16px;height:16px;z-index:2147483647;pointer-events:none;";
      document.body.appendChild(el);
    }
    el.style.background = `hsl(${hue},100%,50%)`;
  }, hue);
}

async function caption(page, text, sub = "") {
  await page.evaluate(
    ({ text, sub }) => {
      let el = document.getElementById("nyx-cap");
      if (!el) {
        el = document.createElement("div");
        el.id = "nyx-cap";
        el.style.cssText =
          "position:fixed;left:50%;bottom:42px;transform:translateX(-50%);z-index:99999;max-width:1040px;padding:16px 30px;border-radius:18px;background:rgba(18,48,94,.93);backdrop-filter:blur(10px);color:#fff;font-family:system-ui,-apple-system,sans-serif;text-align:center;box-shadow:0 12px 40px rgba(12,26,46,.35);transition:opacity .45s ease;pointer-events:none;";
        document.body.appendChild(el);
      }
      if (!text) { el.style.opacity = "0"; return; }
      el.style.opacity = "1";
      el.innerHTML =
        `<div style="font-size:19px;font-weight:700;letter-spacing:.01em;line-height:1.35">${text}</div>` +
        (sub ? `<div style="font-size:14px;color:#9fd9f5;margin-top:4px;font-weight:500">${sub}</div>` : "");
    },
    { text, sub }
  );
}

async function smoothScroll(page, to, duration) {
  await page.evaluate(
    ({ to, duration }) =>
      new Promise((res) => {
        const from = window.scrollY;
        const start = performance.now();
        const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
        const step = (now) => {
          const p = Math.min((now - start) / duration, 1);
          window.scrollTo(0, from + (to - from) * ease(p));
          if (p < 1) requestAnimationFrame(step);
          else res();
        };
        requestAnimationFrame(step);
      }),
    { to, duration }
  );
}

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const t0 = Date.now();
  const marks = [];

  // scene wrapper — runs actions, then pads until the narration segment has room
  async function scene(id, fn) {
    const startAbs = Date.now();
    SCENE_I++;
    marks.push({ id, at: (startAbs - t0) / 1000 });
    await mark(page).catch(() => {});
    await fn();
    await mark(page);
    const need = (DUR[id] ?? 0) * 1000 + 800;
    const rem = need - (Date.now() - startAbs);
    if (rem > 0) await sleep(rem);
  }

  // ── s01 title card ──
  await scene("s01_title", async () => {
    await page.setContent(`
      <body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(1200px 640px at 78% -12%, rgba(42,169,232,.16), transparent 60%),radial-gradient(900px 520px at -8% 24%, rgba(10,88,196,.1), transparent 55%),#f7fafd;font-family:system-ui,-apple-system,sans-serif;">
        <div style="text-align:center">
          <div style="font-size:15px;letter-spacing:.35em;color:#2aa9e8;font-weight:700;margin-bottom:22px">SEBI TECHSPRINT 2026 · ROUND 2 · TEAM KELLTON</div>
          <div style="font-size:100px;font-weight:800;color:#12305e;letter-spacing:-.03em;line-height:1">NIYAMA<span style="color:#2aa9e8">.</span></div>
          <div style="font-size:26px;color:#45536e;margin-top:26px;font-weight:600">The Agentic Compliance Operating System</div>
          <div style="font-size:17px;color:#8794ad;margin-top:14px">Regulatory text → Obligation Graph → Rules-as-Code → operational action</div>
        </div>
      </body>`);
    await mark(page);
  });

  // ── s02 landing hero ──
  await scene("s02_problem", async () => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await mark(page);
    await caption(page, "Not a chatbot. Not a RAG assistant. A compiler for regulation.", "Hundreds of circulars a year · weeks from circular to control — until now");
    await sleep(4000);
    await smoothScroll(page, 900, 2200);
  });

  // ── s03 pipeline ──
  await scene("s03_pipeline", async () => {
    const top = await page.evaluate(() => document.getElementById("pipeline").getBoundingClientRect().top + window.scrollY);
    await caption(page, "Six stages. One unbroken chain of custody.", "Watcher → Parser → Interpretation → Compiler → Officer sign-off → Evidence & Audit");
    await smoothScroll(page, top - 40, 2400);
  });

  // ── s04 command center ──
  await scene("s04_command", async () => {
    await caption(page, "");
    await page.goto(`${BASE}/demo`, { waitUntil: "networkidle" });
    await mark(page);
    await caption(page, "The NIYAMA Command Center — live", "A circular on running-account settlement just landed from the SEBI feed");
  });

  // ── s05 compile + DPDP ──
  await scene("s05_compile", async () => {
    await caption(page, "Compile — but first, the DPDP guard", "Azure AI Language redacts every personal identifier BEFORE the LLM sees the text");
    await page.click("text=Compile this circular");
    await sleep(3000);
    await caption(page, "Four agents reasoning on the text — live", "Watcher → Parser → Interpretation → Mapping · privacy enforced by design");
    await page.waitForSelector("text=AWAITING OFFICER SIGN-OFF", { timeout: 120000 });
  });

  // ── s06 obligation graph ──
  await scene("s06_graph", async () => {
    await caption(page, "The Obligation Graph — who, what, when, evidence", "Every node linked to its exact source clause");
  });

  // ── s07 rules-as-code ──
  await scene("s07_rules", async () => {
    await page.click("text=Rules-as-Code");
    await caption(page, "Deterministic Rules-as-Code", "Versioned · testable · no LLM in the execution path");
  });

  // ── s08 vernacular + TTS ──
  await scene("s08_vernacular", async () => {
    await page.click("text=Obligation Graph");
    await sleep(500);
    await page.click("text=हिं");
    await caption(page, "Vernacular by default — the officer asks, NIYAMA answers in Hindi", "Clause-grounded · then Azure neural speech reads it aloud · EN / HI / GU / MR");
    const input = page.locator('input[placeholder^="Ask the Interpretation"]');
    await input.scrollIntoViewIfNeeded();
    await input.click();
    await input.pressSequentially("Is per-client consent needed for the retention cap?", { delay: 24 });
    await page.click('button[aria-label="Ask"]');
    await page.waitForSelector('button[aria-label="Listen"]', { timeout: 60000 });
    await sleep(1500);
    await page.click('button[aria-label="Listen"]');
  });

  // ── s09 sign-off + engine + ledger ──
  await scene("s09_signoff", async () => {
    await caption(page, "Mandatory human gate — the officer signs off", "Evidence auto-bound · gaps → remediation tasks · hash-chained audit trail");
    await page.click("text=Approve & activate rulebook v1.0");
    await sleep(4000);
    await page.evaluate(() => {
      const el = [...document.querySelectorAll("p")].find((p) => p.textContent.includes("Immutable audit trail"));
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  // ── s10 ops console ──
  await scene("s10_ops", async () => {
    await caption(page, "");
    await page.goto(`${BASE}/ops`, { waitUntil: "networkidle" });
    await mark(page);
    await caption(page, "NIYAMA Platform Operations — everything here is real", "Kill switch · observability · security · scalability — measured live on this instance");
  });

  // ── s11 observability ──
  await scene("s11_observability", async () => {
    const top = await page.evaluate(() => {
      const el = [...document.querySelectorAll("p")].find((p) => p.textContent.includes("Observability"));
      return el ? el.getBoundingClientRect().top + window.scrollY : 800;
    });
    await smoothScroll(page, top - 60, 2000);
    await caption(page, "Observability — p50 / p95 / p99, trace waterfalls, audit stream", "Every compilation traced — including the DPDP guard span");
  });

  // ── s12 security + PII live ──
  await scene("s12_security", async () => {
    const top = await page.evaluate(() => {
      const el = [...document.querySelectorAll("p")].find((p) => p.textContent.includes("Security"));
      return el ? el.getBoundingClientRect().top + window.scrollY : 1600;
    });
    await smoothScroll(page, top - 60, 2000);
    await caption(page, "Secure by design — headers verified live in this browser", "HSTS · CSP · X-Frame-Options · and the DPDP redaction, on demand");
    await sleep(2500);
    await page.click("text=Scan & redact before LLM");
  });

  // ── s13 scalability + load test ──
  await scene("s13_scalability", async () => {
    const top = await page.evaluate(() => {
      const el = [...document.querySelectorAll("p")].find((p) => p.textContent.includes("Scalability"));
      return el ? el.getBoundingClientRect().top + window.scrollY : 2400;
    });
    await smoothScroll(page, top - 60, 2000);
    await caption(page, "Live load test — 60 concurrent requests from this browser", "Stateless compute tier · queue-buffered LLM · real measured numbers");
    await sleep(2000);
    await page.click("text=Run live load test");
  });

  // ── s14 kill switch ──
  await scene("s14_kill", async () => {
    await smoothScroll(page, 0, 1800);
    await caption(page, "The kill switch — one action suspends every agent", "APIs return HTTP 423 · rulebook stays read-only · event on the audit trail");
    await sleep(2500);
    await page.click('button[aria-label="Toggle kill switch"]');
  });

  // ── s15 kill felt on demo + release ──
  await scene("s15_killdemo", async () => {
    await page.goto(`${BASE}/demo`, { waitUntil: "networkidle" });
    await mark(page);
    await caption(page, "The Command Center feels it instantly — compilation blocked", "Containment mapped to SEBI CSCRF & the DPDP Act · release to resume");
    await sleep(7500);
    await page.goto(`${BASE}/ops`, { waitUntil: "networkidle" });
    await mark(page);
    await sleep(1200);
    await page.click('button[aria-label="Toggle kill switch"]');
  });

  // ── s16 end card ──
  await scene("s16_end", async () => {
    await page.setContent(`
      <body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0e2246,#12305e 55%,#174a8c);font-family:system-ui,-apple-system,sans-serif;">
        <div style="text-align:center;color:#fff">
          <div style="font-size:54px;font-weight:800;letter-spacing:-.02em;line-height:1.25">“From regulatory text<br/>to <span style="color:#2aa9e8">regulatory certainty.</span>”</div>
          <div style="font-size:22px;color:rgba(255,255,255,.75);margin-top:28px;font-weight:500">NIYAMA · SEBI TechSprint 2026 · Team Kellton, accelerated on KAI</div>
          <div style="font-size:15px;color:rgba(255,255,255,.5);margin-top:16px">github.com/RahulSinghai606/SEBI_NIYAMA · all demo data synthetic</div>
        </div>
      </body>`);
    await mark(page);
  });

  fs.writeFileSync(`${OUT}/marks.json`, JSON.stringify(marks, null, 1));
  await ctx.close();
  await browser.close();
  console.log("DONE", JSON.stringify(marks));
};

run().catch((e) => { console.error(e); process.exit(1); });
