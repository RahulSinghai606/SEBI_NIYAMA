import { NextResponse } from "next/server";
import { reason } from "@/lib/reasoning";
import { SECTION_TEXT, GOLD_SB, SB_SOURCE } from "@/lib/corpus-stockbrokers";
import { enforceAnchoring, evaluate, anchorRate, type ObligationRecord } from "@/lib/obligation";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// LIVE extraction eval — answers "did the model actually extract this, or did you
// type it and grade yourself?". Runs the reasoning layer over the raw section
// text on demand, anchor-gates the output, and scores the FRESH extraction
// against the same independent gold set. No hand-authored register involved.
const SYSTEM = `You are NIYAMA's Parser + Interpretation layer. Work clause-by-clause through the SEBI Master Circular text provided and extract EVERY distinct obligation that falls on the STOCK BROKER / Trading Member. Emit ONE obligation per numbered sub-clause that imposes a broker duty — do not merge multiple sub-clauses, and do not skip governance, records or reporting duties (e.g. settlement, retention cap, inactive-balance sweep, retention-statement SLA, margin collection, margin reporting, cyber incident reporting, VAPT, CISO/KMP designation, UCC upload, investor-grievance resolution, risk-based disablement). Do NOT include duties that fall only on the Stock Exchange or Clearing Corporation (those are context, not broker obligations).
Return STRICT JSON only (no prose, no markdown fences): an array of objects
[{
 "clauseAnchor": string (e.g. "Clause 48.1.1"),
 "sourceSpan": string (copied VERBATIM from the text — the exact sentence, so it can be anchor-verified),
 "ownerRole": string (accountable role inside the broker),
 "action": string (what must be done),
 "frequency": string,
 "severity": "critical" | "high" | "medium"
}]
Rule: if you cannot copy a verbatim span for an item, do not emit it.`;

function parseArray(raw: string): unknown[] {
  const a = raw.indexOf("[");
  const b = raw.lastIndexOf("]");
  if (a === -1 || b === -1) return [];
  try { return JSON.parse(raw.slice(a, b + 1)); } catch { return []; }
}

export async function POST() {
  const t0 = Date.now();
  const raw = await reason({ system: SYSTEM, user: `Clause text:\n${SECTION_TEXT}\n\nReturn the JSON array of broker obligations.`, maxTokens: 2600 });
  if (!raw) return NextResponse.json({ live: false, reason: "Reasoning layer unavailable — showing the committed register instead." });

  const items = parseArray(raw) as Partial<ObligationRecord>[];
  // Build lightweight records for scoring (only the scored fields matter).
  const predicted: ObligationRecord[] = items
    .filter((o) => o && o.clauseAnchor && o.sourceSpan)
    .map((o, i) => ({
      id: `LIVE-${i}`,
      circularRef: SB_SOURCE.ref,
      clauseAnchor: String(o.clauseAnchor),
      sourceSpan: String(o.sourceSpan),
      intermediaryCategory: "Stock Broker",
      ownerRole: String(o.ownerRole ?? ""),
      action: String(o.action ?? ""),
      trigger: "", frequency: String(o.frequency ?? ""), deadline: "", conditions: [],
      evidenceContract: [],
      rule: { id: "", trigger: "", code: "", test: "" },
      category: "", severity: (["critical", "high", "medium"].includes(String(o.severity)) ? o.severity : "medium") as ObligationRecord["severity"],
      status: "extracted",
      confidence: 0.9,
      provenance: { model: "azure-ai-foundry", extractedAt: t0, source: SB_SOURCE },
    } as ObligationRecord));

  const anchored = enforceAnchoring(predicted, SECTION_TEXT);
  const metrics = evaluate(anchored, GOLD_SB);
  const abstained = anchored.filter((r) => r.status === "abstained");
  return NextResponse.json({
    live: true,
    extractedCount: predicted.length,
    anchoredCount: anchored.filter((r) => r.status !== "abstained").length,
    abstainedCount: abstained.length,
    anchorRate: anchorRate(anchored),
    metrics,
    latencyMs: Date.now() - t0,
    goldLabelled: GOLD_SB.length,
    note: "Freshly extracted by the model over the raw clause text at request time, anchor-gated, then scored against the independent gold set. Nothing hand-authored.",
  });
}
