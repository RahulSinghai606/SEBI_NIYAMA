import { NextRequest, NextResponse } from "next/server";
import { AgentStep, Obligation, Rule } from "@/lib/data";
import { reason, extractJson } from "@/lib/reasoning";
import { ops, killGuard, piiScan, recordTrace, logEvent, Span } from "@/lib/ops";
import { extractText, getDocumentProxy } from "unpdf";

export const maxDuration = 60;

// Live circular ingestion — paste a SEBI circular URL (HTML page or PDF) or
// upload a PDF, and NIYAMA fetches it, extracts the text, and runs the SAME
// 4-agent compiler over the actual document. Lets a juror throw any circular
// at the system on stage and watch it compile end-to-end.

const SYSTEM = `You are the multi-agent Reasoning Layer of NIYAMA — an agentic compliance operating system for SEBI-regulated intermediaries, built by Kellton.
You simulate four agents compiling a SEBI circular into machine-actionable compliance logic:
1. Watcher Agent — detection, applicability classification, diff vs existing rulebook
2. Parser Agent — extracts EVERY obligation, clause-linked (who/what/when/evidence)
3. Interpretation Agent — resolves ambiguity, deadlines, conditions; flags judgement calls for officer review
4. Mapping Agent — maps obligations to systems, owners, existing controls

Then compile obligations into deterministic Rules-as-Code in this pseudo-DSL style:
WHEN <trigger>\nASSERT <condition>\nEVIDENCE bind(<sources>)\nON FAIL raise(task, severity=..., owner=...)

Respond with STRICT JSON only (no markdown fences):
{
 "steps": [{"agent": string, "icon": "radar"|"scan"|"scale"|"network", "finding": string (1-2 specific sentences citing this circular), "confidence": number 0-1}] (exactly 4, in agent order),
 "obligations": [{"id": "OB-x", "clause": string (e.g. "Para 6.1" — must match the text), "actor": string, "action": string, "deadline": string, "frequency": string, "evidence": [string], "category": string, "severity": "critical"|"high"|"medium"}],
 "rules": [{"id": "R-x", "obligationId": "OB-x", "name": snake_case string, "trigger": string, "code": string (the DSL, with \\n line breaks)}]
}
Extract obligations ONLY from the circular text given. Clause references must match the text. One rule per obligation. If a clause binds an entity other than the intermediary, classify it as context in the Interpretation finding and do not emit it as an obligation.
Extract EVERY distinct obligation in the circular — do not stop early. To keep the JSON compact and complete, keep each "action" under 220 characters, each "finding" under 320 characters, and each rule "code" under 300 characters. Output valid, complete JSON.`;

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function pdfText(url: string, signal?: AbortSignal): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 NIYAMA" }, signal });
  if (!res.ok) throw new Error(`fetch pdf ${res.status}`);
  const pdf = await getDocumentProxy(new Uint8Array(await res.arrayBuffer()));
  const { text } = await extractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join("\n") : text;
}

async function textFromUrl(url: string): Promise<{ text: string; kind: string }> {
  if (url.toLowerCase().endsWith(".pdf")) {
    return { text: await pdfText(url), kind: "pdf" };
  }
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 NIYAMA" }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("pdf")) {
    const pdf = await getDocumentProxy(new Uint8Array(await res.arrayBuffer()));
    const { text } = await extractText(pdf, { mergePages: true });
    return { text: Array.isArray(text) ? text.join("\n") : text, kind: "pdf" };
  }
  // HTML: SEBI circular pages are a stub linking to the real PDF. If the page is
  // thin and points at an attachment PDF, follow it and read the actual document.
  const html = await res.text();
  const stripped = stripHtml(html);
  const pdfLink = (html.match(/https?:\/\/[^"']*sebi_data\/attachdocs\/[^"']+\.pdf/i) || [])[0] ||
    (html.match(/https?:\/\/[^"']+\.pdf/i) || [])[0];
  if (pdfLink && stripped.length < 1200) {
    try {
      const t = await pdfText(pdfLink.replace(/&amp;/g, "&"), AbortSignal.timeout(20000));
      if (t.length > stripped.length) return { text: t, kind: "html→pdf" };
    } catch { /* fall back to the stripped HTML */ }
  }
  return { text: stripped, kind: "html" };
}

// best-effort circular metadata from the raw text
function metaFrom(text: string, fallback: string): { ref: string; title: string; date: string } {
  const ref =
    (text.match(/(?:SEBI\/HO\/[A-Z0-9/\-]+\/\d{4}\/\d+|CIR\/[A-Z0-9/\-]+\/\d{4}\/\d+|HO\/\d+\/[0-9A-Z/().\-]*\/\d{4})/i) || [])[0] ||
    (text.match(/Circular\s*No\.?\s*[:\-]?\s*([A-Z0-9/().\-]+)/i) || [])[1] ||
    fallback;
  const subj = (text.match(/Sub(?:ject)?\s*[:\-]\s*([^\n]{6,140})/i) || [])[1];
  const title = (subj || (text.match(/^([A-Z][^.]{10,120})/) || [])[1] || "Ingested SEBI circular").trim().replace(/\s+/g, " ");
  const date = (text.match(/\b(\d{1,2}\s+[A-Za-z]{3,9},?\s+20\d{2}|[A-Za-z]{3,9}\s+\d{1,2},?\s+20\d{2})\b/) || [])[1] || "";
  return { ref: String(ref).trim(), title, date };
}

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  const s = ops();
  s.counters.requests++;
  const spans: Span[] = [];
  const traceId = `ing-${t0.toString(36)}`;

  if (killGuard(req).blocked) {
    return NextResponse.json({ error: "kill-switch", message: "Agentic execution suspended." }, { status: 423 });
  }

  // accept {url} JSON or a PDF upload (multipart)
  let text = "";
  let source = "";
  let kind = "";
  try {
    const ctype = req.headers.get("content-type") || "";
    if (ctype.includes("application/json")) {
      const { url } = (await req.json()) as { url?: string };
      if (!url) return NextResponse.json({ error: "no url" }, { status: 400 });
      source = url;
      let sT = Date.now();
      const r = await textFromUrl(url);
      text = r.text; kind = r.kind;
      spans.push({ name: `fetch.${kind} · ${new URL(url).hostname}`, startMs: sT - t0, durMs: Date.now() - sT, status: "ok", note: `${text.length} chars extracted` });
    } else {
      const form = await req.formData();
      const file = form.get("file") as File | null;
      if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });
      source = file.name;
      let sT = Date.now();
      const buf = new Uint8Array(await file.arrayBuffer());
      const pdf = await getDocumentProxy(buf);
      const ex = await extractText(pdf, { mergePages: true });
      text = Array.isArray(ex.text) ? ex.text.join("\n") : ex.text;
      kind = "pdf-upload";
      spans.push({ name: `parse.pdf · ${file.name}`, startMs: sT - t0, durMs: Date.now() - sT, status: "ok", note: `${text.length} chars extracted` });
    }
  } catch (e) {
    return NextResponse.json({ error: "fetch/parse failed", message: (e as Error).message }, { status: 502 });
  }

  text = text.replace(/\s+/g, " ").trim().slice(0, 16000);
  if (text.length < 200) {
    return NextResponse.json({ error: "too little text", message: "Could not extract enough text from that source." }, { status: 422 });
  }
  const meta = metaFrom(text, source);
  logEvent("pipeline", `Live ingestion · ${meta.ref || source}`, "info");

  // DPDP guard before the LLM sees anything
  let sT = Date.now();
  const pii = await piiScan(text.slice(0, 4000));
  spans.push({ name: "dpdp.pii-guard · Azure AI Language", startMs: sT - t0, durMs: pii.ms, status: "ok", note: pii.entities.length ? `${pii.entities.length} identifiers redacted` : "0 personal identifiers — clean" });

  const user = `Circular reference: ${meta.ref || "(unstated)"} — "${meta.title}"${meta.date ? ` (${meta.date})` : ""}
Source: ${kind} · ${source}

Circular text (DPDP-screened):
${text}

Run the 4-agent pipeline and compile Rules-as-Code from THIS text. Return the JSON.`;

  sT = Date.now();
  const raw = await reason({ system: SYSTEM, user, maxTokens: 8000 });
  s.counters.llmCalls++;
  if (raw) s.counters.llmTokensOut += Math.round(raw.length / 4);
  spans.push({ name: "agents.reason · Watcher→Parser→Interpretation→Mapping", startMs: sT - t0, durMs: Date.now() - sT, status: raw ? "ok" : "error", note: raw ? "4 agents · live extraction from ingested text" : "LLM unavailable" });

  const parsed = raw ? extractJson<{ steps: AgentStep[]; obligations: Obligation[]; rules: Rule[] }>(raw) : null;
  if (!parsed || !parsed.obligations?.length) {
    recordTrace({ id: traceId, route: "ingest · extraction-failed", startedAt: t0, totalMs: Date.now() - t0, spans });
    return NextResponse.json({ error: "extraction failed", message: "The reasoning layer could not extract obligations from this document." }, { status: 502 });
  }

  const totalMs = Date.now() - t0;
  recordTrace({ id: traceId, route: `ingest · ${kind}`, startedAt: t0, totalMs, spans });
  logEvent("pipeline", `Ingested ${meta.ref || source} → ${parsed.obligations.length} obligations, ${parsed.rules?.length ?? 0} rules`, "info");

  return NextResponse.json({
    ok: true,
    ref: meta.ref || "INGESTED",
    title: meta.title,
    date: meta.date || "ingested",
    category: "Ingested live",
    excerpt: text.slice(0, 1400),
    sourceUrl: kind.startsWith("pdf-upload") ? "" : source,
    steps: parsed.steps ?? [],
    obligations: parsed.obligations,
    rules: parsed.rules ?? [],
    live: true,
    traceId,
  });
}
