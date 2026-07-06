// NIYAMA — scripted demo recording (~2:45)
import { chromium } from "playwright";

const BASE = "http://localhost:3050";
const OUT = "/private/tmp/claude-502/-Users-rahul-singh-Downloads-SBI-AURA/63f53a63-53ab-4217-835a-809cc46bc0cb/scratchpad/niyama-video";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function caption(page, text, sub = "") {
  await page.evaluate(
    ({ text, sub }) => {
      let el = document.getElementById("nyx-cap");
      if (!el) {
        el = document.createElement("div");
        el.id = "nyx-cap";
        el.style.cssText =
          "position:fixed;left:50%;bottom:42px;transform:translateX(-50%);z-index:99999;max-width:940px;padding:16px 30px;border-radius:18px;background:rgba(18,48,94,.93);backdrop-filter:blur(10px);color:#fff;font-family:system-ui,-apple-system,sans-serif;text-align:center;box-shadow:0 12px 40px rgba(12,26,46,.35);transition:opacity .45s ease;pointer-events:none;";
        document.body.appendChild(el);
      }
      if (!text) {
        el.style.opacity = "0";
        return;
      }
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

async function mouseSweep(page, points, stepDelay = 30) {
  for (const [x, y] of points) {
    await page.mouse.move(x, y, { steps: 16 });
    await sleep(stepDelay);
  }
}

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();

  // ── Title card ──
  await page.setContent(`
    <body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(1200px 640px at 78% -12%, rgba(42,169,232,.16), transparent 60%),radial-gradient(900px 520px at -8% 24%, rgba(10,88,196,.1), transparent 55%),#f7fafd;font-family:system-ui,-apple-system,sans-serif;">
      <div style="text-align:center">
        <div style="font-size:15px;letter-spacing:.35em;color:#2aa9e8;font-weight:700;margin-bottom:22px">SEBI TECHSPRINT 2026 · TEAM KELLTON</div>
        <div style="font-size:100px;font-weight:800;color:#12305e;letter-spacing:-.03em;line-height:1">NIYAMA<span style="color:#2aa9e8">.</span></div>
        <div style="font-size:26px;color:#45536e;margin-top:26px;font-weight:600">The Agentic Compliance Operating System</div>
        <div style="font-size:17px;color:#8794ad;margin-top:14px">SEBI circulars → Obligation Graph → Rules-as-Code → certainty</div>
      </div>
    </body>`);
  await sleep(4200);

  // ── Landing hero: typing headline + rays ──
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await caption(page, "Not a chatbot. Not a RAG assistant. A compiler for regulation.", "Watch the headline type itself — then watch a circular become code");
  await mouseSweep(page, [[600, 400], [1100, 300], [1400, 520], [900, 620], [1200, 380]]);
  await sleep(3200);

  // ── Problem / shift ──
  await caption(page, "Today: compliance is read, remembered and hoped", "Hundreds of circulars a year · weeks from circular to control");
  await smoothScroll(page, 1000, 2000);
  await sleep(2800);

  // ── Pipeline ──
  const pipelineTop = await page.evaluate(() => document.getElementById("pipeline").getBoundingClientRect().top + window.scrollY);
  await caption(page, "Six stages. One unbroken chain of custody.", "Watcher → Parser → Interpretation → Compiler → Officer sign-off → Evidence & Audit");
  await smoothScroll(page, pipelineTop - 40, 2200);
  await sleep(4200);

  // ── Cockpit expansion ──
  const cockpitTop = await page.evaluate(() => document.getElementById("cockpit").getBoundingClientRect().top + window.scrollY);
  await caption(page, "The compliance cockpit — keep scrolling, step inside", "A framed panel expands into the full command view");
  await smoothScroll(page, cockpitTop, 1500);
  await sleep(600);
  await smoothScroll(page, cockpitTop + 1450, 5200);
  await caption(page, "Every obligation live, clause-linked, evidence-bound", "247 obligations · 9 gaps → remediation tasks · ledger chain verified");
  await sleep(3600);

  // ── Impact ──
  const impactTop = await page.evaluate(() => document.getElementById("impact").getBoundingClientRect().top + window.scrollY);
  await caption(page, "Weeks → hours · 100% clause traceability · one rulebook, 1,300+ brokers", "Projected targets · SaaS by category & obligation volume");
  await smoothScroll(page, impactTop - 40, 2400);
  await sleep(3800);

  // ── Command Center ──
  await caption(page, "");
  await page.goto(`${BASE}/demo`, { waitUntil: "networkidle" });
  await caption(page, "The NIYAMA Command Center — live", "A synthetic SEBI feed · real agentic compilation");
  await sleep(3200);

  await caption(page, "A circular lands: running-account settlement of client funds", "The Watcher Agent has already classified its applicability");
  await sleep(2800);

  // compile
  await caption(page, "Compile the circular — four agents reason on the text, live", "Watcher → Parser → Interpretation → Mapping");
  await page.click("text=Compile this circular");
  await sleep(2500);
  await caption(page, "The Reasoning Layer is working…", "Extracting every obligation, clause by clause");
  await page.waitForSelector("text=AWAITING OFFICER SIGN-OFF", { timeout: 120000 });
  await caption(page, "The Obligation Graph — who, what, when, evidence", "Every node linked to its exact source clause");
  await sleep(5000);

  // rules tab
  await page.click("text=Rules-as-Code");
  await caption(page, "Compiled into deterministic Rules-as-Code", "Versioned · testable · no LLM in the execution path");
  await sleep(5200);
  await page.click("text=Obligation Graph");
  await sleep(800);

  // ask the interpretation agent
  const input = page.locator('input[placeholder^="Ask the Interpretation"]');
  await input.scrollIntoViewIfNeeded();
  await caption(page, "The officer interrogates the Interpretation Agent…", "Clause-grounded answers — ambiguity flagged, never hidden");
  await input.click();
  await input.pressSequentially("If the first Friday is a holiday and the previous day is also a holiday, when do we settle?", { delay: 22 });
  await page.click('button[aria-label="Ask"]');
  await page.waitForSelector("text=Interpretation Agent:", { timeout: 60000 });
  await sleep(6000);

  // sign off
  await caption(page, "Mandatory human gate: the officer signs off", "No rule executes without approval — recorded on the trail");
  await page.click("text=Approve & activate rulebook v1.0");
  await sleep(3000);

  await caption(page, "The Compliance Engine takes over", "Evidence auto-bound · a gap flagged · remediation task raised");
  await page.evaluate(() => {
    const el = [...document.querySelectorAll("p")].find((p) => p.textContent.includes("Compliance engine"));
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  await sleep(5000);

  await page.evaluate(() => {
    const el = [...document.querySelectorAll("p")].find((p) => p.textContent.includes("Immutable audit trail"));
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
  await caption(page, "…and every action lands on the immutable, hash-chained trail", "Regulator-ready by construction");
  await sleep(5000);

  // ── End card ──
  await page.setContent(`
    <body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0e2246,#12305e 55%,#174a8c);font-family:system-ui,-apple-system,sans-serif;">
      <div style="text-align:center;color:#fff">
        <div style="font-size:54px;font-weight:800;letter-spacing:-.02em;line-height:1.25">“From regulatory text<br/>to <span style="color:#2aa9e8">regulatory certainty.</span>”</div>
        <div style="font-size:22px;color:rgba(255,255,255,.75);margin-top:28px;font-weight:500">NIYAMA · SEBI TechSprint 2026 · Team Kellton, accelerated on KAI</div>
        <div style="font-size:15px;color:rgba(255,255,255,.5);margin-top:16px">github.com/RahulSinghai606/SEBI_NIYAMA · all demo data synthetic</div>
      </div>
    </body>`);
  await sleep(4500);

  await ctx.close();
  await browser.close();
  console.log("DONE");
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
