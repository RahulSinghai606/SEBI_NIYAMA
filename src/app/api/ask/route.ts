import { NextRequest, NextResponse } from "next/server";
import { getCircular } from "@/lib/data";
import { reason } from "@/lib/reasoning";

export const maxDuration = 60;

// "Ask NIYAMA" — clause-grounded Q&A for the compliance officer during review.
export async function POST(req: NextRequest) {
  const { circularId, question, obligations } = (await req.json()) as {
    circularId: string;
    question: string;
    obligations?: { id: string; clause: string; action: string }[];
  };
  const circular = getCircular(circularId);
  if (!circular) return NextResponse.json({ error: "unknown circular" }, { status: 404 });

  const system = `You are NIYAMA's Interpretation Agent answering a compliance officer's question during rulebook review.
Ground every answer in the circular text provided. Always cite the exact clause (e.g. "Para 6.3").
If the text is ambiguous, say so explicitly and recommend what the officer should confirm with the regulator or document as an interpretation memo.
Max 90 words. Professional, precise, no filler. Never invent clauses.`;

  const user = `Circular ${circular.ref} — "${circular.title}"

Text:
${circular.excerpt}

Extracted obligations under review:
${(obligations ?? circular.fallback.obligations).map((o) => `- ${o.id} (${o.clause}): ${o.action}`).join("\n")}

Officer's question: ${question}`;

  const raw = await reason({ system, user, maxTokens: 500 });
  const reply =
    raw?.trim() ||
    "The Interpretation Agent is momentarily unavailable — the question has been logged to the review queue and will be answered before sign-off.";
  return NextResponse.json({ reply, live: Boolean(raw) });
}
