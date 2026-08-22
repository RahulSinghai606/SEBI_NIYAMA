import { NextResponse } from "next/server";
import { REGISTER_SB, GOLD_SB, SECTION_TEXT, SB_SOURCE, ABSTAIN_FIXTURES } from "@/lib/corpus-stockbrokers";
import { enforceAnchoring, evaluate, anchorRate } from "@/lib/obligation";

export const dynamic = "force-dynamic";

// Live evaluation endpoint — the credibility number.
// Runs the shipped Obligation Register through the clause-anchor gate, then
// scores it against the independently hand-labelled gold set. Deterministic:
// no LLM in the scorer, so the number is stable and reproducible on stage.
export function GET() {
  const anchored = enforceAnchoring(REGISTER_SB, SECTION_TEXT);
  const result = evaluate(anchored, GOLD_SB);
  const abstained = anchored.filter((r) => r.status === "abstained");
  return NextResponse.json({
    corpus: {
      document: SB_SOURCE.document,
      ref: SB_SOURCE.ref,
      publishedDate: SB_SOURCE.publishedDate,
      intermediary: "Stock Broker",
      section: "Clause 48 (running-account settlement) + margin, cyber, QSB, UCC, grievance, RBS clauses",
    },
    metrics: result,
    anchorRate: anchorRate(anchored),
    goldLabelled: GOLD_SB.length,
    registerSize: anchored.filter((r) => r.status !== "abstained").length,
    abstained: abstained.map((r) => ({ clauseAnchor: r.clauseAnchor, reason: r.abstainReason })),
    abstainFixtures: ABSTAIN_FIXTURES,
    computedAt: Date.now(),
  });
}
