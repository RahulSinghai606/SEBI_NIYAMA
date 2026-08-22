// ─────────────────────────────────────────────────────────────
// NIYAMA — Machine-readable Obligation Register
//
// This is the core artefact that separates NIYAMA from a RAG chatbot: not
// retrieved text, but a STRUCTURED, testable obligation record. Every record
// carries a clause anchor, a verbatim source span (proof), an owner, a
// frequency, an evidence contract, and a machine-checkable rule (the "test").
//
// Two hard invariants enforced here:
//   1. Clause-anchoring — an obligation with no verbatim span in the source
//      circular is ABSTAINED, never emitted (see enforceAnchoring).
//   2. Supersession — amendments produce an auditable diff; superseded
//      obligations are retained, struck through, and linked to their successor.
// ─────────────────────────────────────────────────────────────

// Where an obligation was pulled from — the click-through citation.
export type SourceCitation = {
  document: string; // "SEBI Master Circular for Stock Brokers"
  ref: string; // exact circular reference number
  url: string; // canonical sebi.gov.in URL
  page?: string; // PDF page(s), e.g. "p. 34"
  publishedDate?: string; // circular issue date
  retrievedAt?: string; // when NIYAMA fetched it
};

export type EvidenceContract = {
  artifact: string; // e.g. "Settlement register"
  sourceSystem: string; // e.g. "Back-office settlement module"
  format: string; // e.g. "Signed PDF + CSV export"
  retention: string; // e.g. "5 years"
};

// The machine-checkable test — deterministic Rules-as-Code compiled from the
// obligation. `code` is the DSL; `test` is the plain-language pass condition.
export type RuleAsCode = {
  id: string;
  trigger: string; // "cron: first Friday per client cycle" | "event: incident_detected"
  code: string; // WHEN / ASSERT / EVIDENCE bind / ON FAIL raise
  test: string; // human-readable assertion an auditor can verify
};

export type Attestation = {
  officer: string;
  role: string;
  decision: "attested" | "rejected" | "modified";
  at: number;
  note?: string;
  ledgerHash?: string; // hash-chained audit entry this attestation wrote
};

export type ObligationStatus = "extracted" | "attested" | "abstained" | "superseded";

// The canonical obligation record — the unit of the register.
export type ObligationRecord = {
  id: string; // OB-<circular>-<n>
  circularRef: string; // exact SEBI circular reference
  clauseAnchor: string; // "Para 6.1" — the anchor
  sourceSpan: string; // verbatim quote from the circular (anchor proof)
  intermediaryCategory: "Stock Broker" | "Investment Adviser";
  ownerRole: string; // accountable role, e.g. "Trading Member — Operations"
  action: string; // what must be done
  trigger: string; // what starts the clock
  frequency: string; // "Quarterly / Monthly" | "Event-driven"
  deadline: string; // "Within 24 hours of settlement"
  conditions: string[]; // guards / exceptions
  evidenceContract: EvidenceContract[]; // what proves compliance
  rule: RuleAsCode; // the test
  category: string;
  severity: "critical" | "high" | "medium";
  status: ObligationStatus;
  confidence: number; // 0..1 extraction confidence
  // Full provenance — where this obligation was pulled from. Shown in the UI so
  // a juror can click straight through to the actual SEBI document, page and
  // paragraph, and see the verbatim span highlighted. Authenticity, not claims.
  provenance: {
    model: string; // extracting model
    extractedAt: number;
    source: SourceCitation;
  };
  supersedes?: string[]; // clause refs / obligation ids this replaces
  supersededBy?: string | null; // successor obligation id
  abstainReason?: string; // populated when status === "abstained"
  attestation?: Attestation; // populated on officer sign-off
};

// ── Invariant 1: clause anchoring ────────────────────────────────────────────
// An obligation is only valid if its source span appears verbatim in the
// circular text. Whitespace/case-insensitive, punctuation-tolerant match.
function normalize(s: string): string {
  return s.toLowerCase().replace(/[\s ]+/g, " ").replace(/[""'']/g, '"').trim();
}

export function isAnchored(rec: Pick<ObligationRecord, "sourceSpan">, circularText: string): boolean {
  const span = normalize(rec.sourceSpan);
  if (span.length < 12) return false; // too short to be a real anchor
  return normalize(circularText).includes(span);
}

// Enforce anchoring across a set: anything unanchored is ABSTAINED, never
// silently dropped — it stays in the register flagged for a human.
export function enforceAnchoring(records: ObligationRecord[], circularText: string): ObligationRecord[] {
  return records.map((r) => {
    if (r.status === "superseded") return r;
    if (isAnchored(r, circularText)) return r;
    return {
      ...r,
      status: "abstained" as const,
      abstainReason: "No verbatim clause anchor found in the source circular — routed to human review (NIYAMA does not emit unanchored obligations).",
    };
  });
}

export function anchorRate(records: ObligationRecord[]): number {
  const emitted = records.filter((r) => r.status !== "abstained");
  if (!emitted.length) return 0;
  const anchored = emitted.length; // emitted ⇒ anchored by construction
  return Math.round((anchored / records.length) * 100);
}

// ── Invariant 2: supersession diff ───────────────────────────────────────────
export type FieldChange = { field: string; before: string; after: string };
export type ObligationDiff = {
  added: ObligationRecord[];
  withdrawn: ObligationRecord[];
  modified: { before: ObligationRecord; after: ObligationRecord; changes: FieldChange[] }[];
  unchanged: number;
};

const DIFF_FIELDS: (keyof ObligationRecord)[] = ["action", "deadline", "frequency", "ownerRole", "severity", "conditions"];

// Diff two obligation sets keyed by clause anchor — the output of "an amendment
// arrived". Added / withdrawn / field-level modified, plus unchanged count.
export function diffObligations(prev: ObligationRecord[], next: ObligationRecord[]): ObligationDiff {
  const byAnchor = (arr: ObligationRecord[]) => new Map(arr.map((r) => [r.clauseAnchor, r]));
  const p = byAnchor(prev);
  const n = byAnchor(next);
  const added: ObligationRecord[] = [];
  const withdrawn: ObligationRecord[] = [];
  const modified: ObligationDiff["modified"] = [];
  let unchanged = 0;

  for (const [anchor, rec] of n) if (!p.has(anchor)) added.push(rec);
  for (const [anchor, rec] of p) if (!n.has(anchor)) withdrawn.push(rec);
  for (const [anchor, after] of n) {
    const before = p.get(anchor);
    if (!before) continue;
    const changes: FieldChange[] = [];
    for (const f of DIFF_FIELDS) {
      const a = Array.isArray(before[f]) ? (before[f] as string[]).join("; ") : String(before[f] ?? "");
      const b = Array.isArray(after[f]) ? (after[f] as string[]).join("; ") : String(after[f] ?? "");
      if (a !== b) changes.push({ field: String(f), before: a, after: b });
    }
    if (changes.length) modified.push({ before, after, changes });
    else unchanged++;
  }
  return { added, withdrawn, modified, unchanged };
}

// ── Register export ──────────────────────────────────────────────────────────
export function toRegisterJSON(records: ObligationRecord[]): string {
  return JSON.stringify(records, null, 2);
}

export function toRegisterCSV(records: ObligationRecord[]): string {
  const cols = ["id", "circularRef", "clauseAnchor", "ownerRole", "action", "trigger", "frequency", "deadline", "severity", "status", "confidence", "evidence", "test"];
  const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = records.map((r) =>
    [
      r.id, r.circularRef, r.clauseAnchor, r.ownerRole, r.action, r.trigger, r.frequency, r.deadline,
      r.severity, r.status, r.confidence.toFixed(2),
      r.evidenceContract.map((e) => e.artifact).join(" | "),
      r.rule.test,
    ].map(esc).join(","),
  );
  return [cols.map(esc).join(","), ...rows].join("\n");
}

// ── Gold set + evaluation (precision / recall / F1) ──────────────────────────
// The single biggest credibility item: a hand-labelled gold set and measured
// extraction performance against it. A number beats a demo.
export type GoldObligation = {
  clauseAnchor: string;
  ownerRole: string;
  frequency: string;
  severity: "critical" | "high" | "medium";
  actionKeywords: string[]; // salient terms the extracted action must contain
};

export type EvalResult = {
  goldCount: number;
  predictedCount: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1: number;
  anchorAccuracy: number; // % of matched obligations whose clause anchor is exact
  fieldAccuracy: { ownerRole: number; frequency: number; severity: number };
  perObligation: { clauseAnchor: string; matched: boolean; anchorExact: boolean }[];
};

// A predicted obligation matches a gold obligation when the clause anchor lines
// up AND the action carries the gold's salient keywords — i.e. same obligation,
// not just same paragraph. Deterministic; no LLM in the scorer.
// Normalise a clause anchor to just its numeric path (48.1.1) so "Clause 48.1.1",
// "clause 48.1.1", "Para 48.1.1" and "48.1.1" all compare equal — the live LLM
// won't always echo the "Clause" prefix.
function anchorKey(s: string): string {
  const m = normalize(s).match(/\d+(?:\.\d+)*/);
  return m ? m[0] : normalize(s).replace(/[^a-z0-9.]/g, "");
}
function matchesGold(pred: ObligationRecord, gold: GoldObligation): boolean {
  const anchorOk = anchorKey(pred.clauseAnchor) === anchorKey(gold.clauseAnchor);
  if (!anchorOk) return false;
  const action = normalize(pred.action);
  const hits = gold.actionKeywords.filter((k) => action.includes(normalize(k))).length;
  return hits >= Math.ceil(gold.actionKeywords.length / 2);
}

export function evaluate(predicted: ObligationRecord[], gold: GoldObligation[]): EvalResult {
  const emitted = predicted.filter((p) => p.status !== "abstained");
  const usedPred = new Set<number>();
  let tp = 0;
  let anchorExactCount = 0;
  const field = { ownerRole: 0, frequency: 0, severity: 0 };
  const perObligation: EvalResult["perObligation"] = [];

  for (const g of gold) {
    const idx = emitted.findIndex((p, i) => !usedPred.has(i) && matchesGold(p, g));
    const matched = idx >= 0;
    if (matched) {
      usedPred.add(idx);
      tp++;
      const p = emitted[idx];
      const anchorExact = normalize(p.clauseAnchor) === normalize(g.clauseAnchor);
      if (anchorExact) anchorExactCount++;
      if (normalize(p.ownerRole).includes(normalize(g.ownerRole)) || normalize(g.ownerRole).includes(normalize(p.ownerRole))) field.ownerRole++;
      if (normalize(p.frequency).includes(normalize(g.frequency)) || normalize(g.frequency).includes(normalize(p.frequency))) field.frequency++;
      if (p.severity === g.severity) field.severity++;
      perObligation.push({ clauseAnchor: g.clauseAnchor, matched: true, anchorExact });
    } else {
      perObligation.push({ clauseAnchor: g.clauseAnchor, matched: false, anchorExact: false });
    }
  }
  const fp = emitted.length - tp;
  const fn = gold.length - tp;
  const precision = emitted.length ? tp / emitted.length : 0;
  const recall = gold.length ? tp / gold.length : 0;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
  return {
    goldCount: gold.length,
    predictedCount: emitted.length,
    truePositives: tp,
    falsePositives: fp,
    falseNegatives: fn,
    precision: +precision.toFixed(3),
    recall: +recall.toFixed(3),
    f1: +f1.toFixed(3),
    anchorAccuracy: tp ? Math.round((anchorExactCount / tp) * 100) : 0,
    fieldAccuracy: {
      ownerRole: tp ? Math.round((field.ownerRole / tp) * 100) : 0,
      frequency: tp ? Math.round((field.frequency / tp) * 100) : 0,
      severity: tp ? Math.round((field.severity / tp) * 100) : 0,
    },
    perObligation,
  };
}
