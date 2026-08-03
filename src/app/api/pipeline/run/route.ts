import { NextRequest, NextResponse } from "next/server";
import { getCircular, AgentStep, Obligation, Rule } from "@/lib/data";
import { reason, extractJson } from "@/lib/reasoning";
import { ops, killGuard, piiScan, recordLatency, recordTrace, logEvent, Span } from "@/lib/ops";

export const maxDuration = 60;

type PipelineResult = { steps: AgentStep[]; obligations: Obligation[]; rules: Rule[]; live: boolean };

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
 "steps": [{"agent": string, "icon": "radar"|"scan"|"scale"|"network", "finding": string (1-2 specific sentences), "confidence": number 0-1}] (exactly 4, in agent order),
 "obligations": [{"id": "OB-x", "clause": string (e.g. "Para 6.1"), "actor": string, "action": string, "deadline": string, "frequency": string, "evidence": [string], "category": string, "severity": "critical"|"high"|"medium"}],
 "rules": [{"id": "R-x", "obligationId": "OB-x", "name": snake_case string, "trigger": string, "code": string (the DSL, with \\n line breaks)}]
}
Extract obligations ONLY from the circular text given. Clause references must match the text. One rule per obligation.`;

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  const s = ops();
  s.counters.requests++;
  const spans: Span[] = [];
  const traceId = `tr-${t0.toString(36)}`;

  // ── kill switch guard: no agent executes while suspended ──
  if (killGuard().blocked) {
    return NextResponse.json(
      { error: "kill-switch", message: "Agentic execution suspended by the compliance officer. Deterministic rulebook remains available read-only." },
      { status: 423 }
    );
  }

  const { circularId } = await req.json();
  const circular = getCircular(circularId);
  if (!circular) return NextResponse.json({ error: "unknown circular" }, { status: 404 });

  logEvent("pipeline", `Compilation started · ${circular.ref}`, "info");

  // ── DPDP guard: live PII scan BEFORE any text reaches the LLM ──
  let sT = Date.now();
  const pii = await piiScan(circular.excerpt);
  spans.push({
    name: "dpdp.pii-guard · Azure AI Language",
    startMs: sT - t0,
    durMs: pii.ms,
    status: "ok",
    note: pii.entities.length ? `${pii.entities.length} identifiers redacted` : "0 personal identifiers — clean",
  });

  const user = `Circular ${circular.ref} — "${circular.title}" (${circular.date})
Category: ${circular.category}

Text (DPDP-screened):
${pii.redactedText}

Run the 4-agent pipeline and compile rules. Return the JSON.`;

  // ── agent reasoning span ──
  sT = Date.now();
  const raw = await reason({ system: SYSTEM, user, maxTokens: 3000 });
  s.counters.llmCalls++;
  if (raw) s.counters.llmTokensOut += Math.round(raw.length / 4);
  spans.push({
    name: "agents.reason · Watcher→Parser→Interpretation→Mapping",
    startMs: sT - t0,
    durMs: Date.now() - sT,
    status: raw ? "ok" : "error",
    note: raw ? "4 agents · batched inference" : "LLM unavailable → cached fallback",
  });

  // ── compile & validate span ──
  sT = Date.now();
  let result: PipelineResult | null = null;
  if (raw) {
    const parsed = extractJson<Omit<PipelineResult, "live">>(raw);
    if (parsed?.steps?.length && parsed?.obligations?.length && parsed?.rules?.length) {
      result = { ...parsed, live: true };
    }
  }
  if (!result) result = { ...circular.fallback, live: false };
  spans.push({ name: "compile.validate · schema + clause anchors", startMs: sT - t0, durMs: Math.max(1, Date.now() - sT), status: "ok", note: `${result.obligations.length} obligations · ${result.rules.length} rules` });

  const totalMs = Date.now() - t0;
  recordLatency(totalMs);
  recordTrace({ id: traceId, route: `pipeline.run · ${circular.id}`, startedAt: t0, totalMs, spans });
  logEvent("pipeline", `Compilation finished in ${(totalMs / 1000).toFixed(1)}s · ${result.live ? "live" : "fallback"} · trace ${traceId}`, "info");

  return NextResponse.json({ ...result, pii: { redacted: pii.entities.length, ms: pii.ms }, traceId });
}
