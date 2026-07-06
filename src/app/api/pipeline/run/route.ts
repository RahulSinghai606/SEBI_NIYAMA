import { NextRequest, NextResponse } from "next/server";
import { getCircular, AgentStep, Obligation, Rule } from "@/lib/data";
import { reason, extractJson } from "@/lib/reasoning";

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
  const { circularId } = await req.json();
  const circular = getCircular(circularId);
  if (!circular) return NextResponse.json({ error: "unknown circular" }, { status: 404 });

  const user = `Circular ${circular.ref} — "${circular.title}" (${circular.date})
Category: ${circular.category}

Text:
${circular.excerpt}

Run the 4-agent pipeline and compile rules. Return the JSON.`;

  const raw = await reason({ system: SYSTEM, user, maxTokens: 3000 });
  if (raw) {
    const parsed = extractJson<Omit<PipelineResult, "live">>(raw);
    if (parsed?.steps?.length && parsed?.obligations?.length && parsed?.rules?.length) {
      return NextResponse.json({ ...parsed, live: true } satisfies PipelineResult);
    }
  }
  return NextResponse.json({ ...circular.fallback, live: false } satisfies PipelineResult);
}
