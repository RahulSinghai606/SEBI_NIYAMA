# NIYAMA — Live Demo Script (8 minutes)

**Live:** https://sebi-niyama.vercel.app
**Intermediary:** Stock Brokers · **Corpus:** SEBI Master Circular for Stock Brokers (…/2025/90, 17 Jun 2025)
**One-line frame:** *NIYAMA compiles a SEBI circular into structured, testable, auditable obligations — with the human in control and the numbers to prove it.*

---

## PRE-DEMO CHECKLIST (do this 2 min before you present)

1. Open the deployed site; log in / clear any gate.
2. **Run one compile in the Command Center once, then reload /ops** — this lights up the Observability numbers (serverless memory is per-instance; the browser holds your session telemetry). Do NOT skip this or /ops shows zeros.
3. Tabs to have ready: `/demo`, `/ops`, `/metrics`, `/register`.
4. On `/metrics`, pre-press **Re-run live extraction** once so the 0.81 result is cached and appears instantly (it persists across tabs).
5. Kill switch OFF. Internet check (Azure reasoning + live extraction need it).

**Time budget**

| # | Section | Screen | Time |
|---|---|---|---|
| 1 | The problem | Landing | 0:40 |
| 2 | Feed → compile → agents | /demo | 1:00 |
| 3 | The artifact (obligations) | /demo | 1:00 |
| 4 | Guardrail (abstain) | /demo | 0:30 |
| 5 | Officer sign-off + Ask | /demo | 0:50 |
| 6 | Rules-as-Code + engine gap | /demo | 1:00 |
| 7 | Amendment diff | /demo | 0:50 |
| 8 | Ops console | /ops | 0:50 |
| 9 | Metrics + live + register | /metrics, /register | 1:00 |
| 10 | Close | /metrics | 0:20 |
| | **Total** | | **~7:50** |

---

## 1 · THE PROBLEM — 0:40 · Landing

**Why:** frame it from SEBI's chair, not the broker's. This is the hook.

**DO:** land on the homepage. Scroll to the two-panel "regulator's problem / with NIYAMA" band.

**SAY:**
> "SEBI issues one circular. Three hundred brokers read the same words and arrive at slightly different answers, on slightly different timelines. The regulation was uniform; the implementation isn't. For SEBI that's a supervision blind spot; for the investor, a real risk. Why has it stayed unsolved? Regulation lives as prose, compliance runs as systems, and every firm bridges that gap by hand. NIYAMA closes that gap — it *compiles* the circular."

---

## 2 · REGULATOR FEED → COMPILE → AGENTS — 1:00 · /demo

**Why:** show ingestion of the real feed and the multi-agent extraction — this is "how we get it and read it."

**DO:**
- Point at the **left panel** — the regulatory feed. "In production our Watcher Agent polls SEBI's circular feed and detects a new circular the moment it publishes. Here it's the live feed; these are real circulars from the Master Circular for Stock Brokers."
- The **Settlement of Running Account (Clause 48)** circular is selected. Point at the excerpt — "This is the actual SEBI clause text, verbatim."
- Click **Compile this circular.**

**SAY (as the agents animate):**
> "Four agents work the text. Watcher detects and diffs against the existing rulebook. Parser segments it clause-by-clause and extracts every obligation. Interpretation resolves ambiguity and deadlines. Mapping wires each obligation to the broker's systems and owners. This runs on Azure AI Foundry, server-side — keys never touch the browser."

**JURY-PROOF:** "This is the real SEBI circular, not a toy. Every line you'll see traces back to it."

---

## 3 · THE ARTIFACT — OBLIGATIONS — 1:00 · /demo (Obligation Graph)

**Why:** THIS is the differentiator. We don't answer questions — we produce objects.

**DO:** the Obligation Graph tab is showing. Read the banner, then expand/point at obligation **48.1.1** (or 48.8).

**SAY:**
> "Here's what makes us different. We don't answer questions about the circular — we turn it into objects. Look at one obligation: it carries a clause anchor, the responsible role, the trigger, the periodicity, the deadline, an evidence contract — what proves compliance — and a verification test. And its source anchor: the verbatim clause, one click to sebi.gov.in."

**DO:** click **"view on sebi.gov.in ↗"** on one obligation (opens the real SEBI page).

**SAY:**
> "That object is the bridge. Everything downstream — dashboards, alerts, audits — is just software reading a structured record. This is a *machine-readable obligation register*, not retrieved text."

**JURY-PROOF:** "Ask me any obligation on screen and I'll show you the exact SEBI paragraph it came from."

---

## 4 · THE GUARDRAIL — ABSTAIN — 0:30 · /demo

**Why:** pre-empts "what if the AI hallucinates / mis-assigns?"

**SAY:**
> "The guardrail is simple: no clause anchor, no obligation. Clause 48.10 in this circular binds the stock *exchange*, not the broker — so NIYAMA classifies it as context and abstains; it's routed to a human, never emitted. Nothing enters the register without a citation. We favour precision over volume — we would rather miss and flag than invent."

---

## 5 · OFFICER SIGN-OFF — 0:50 · /demo (review)

**Why:** accountability. A regulator rewards AI that makes the human faster, not AI that decides.

**DO:**
- In **Ask NIYAMA**, type: *"Does clause 48.2 cap retention at 225% of margin liability?"* → send. Read the grounded, clause-cited answer.
- Type an **attestation note**: *"Reviewed against clause 48; controls approved."*
- Click **Attest with note & activate.**

**SAY:**
> "The agent prepares; the Compliance Officer attests. Ask NIYAMA answers grounded in the clause — and if it ever cited a clause not in the text, we flag it. The officer signs off with a reason, written verbatim to the audit trail. Nothing is auto-filed to an exchange or to SEBI. The human decides; the machine just makes it faster and consistent."

---

## 6 · RULES-AS-CODE + THE GAP IT CATCHES — 1:00 · /demo (active engine)

**Why:** this is where "is it real software?" is answered. Rules-as-Code is WHY the obligation becomes enforceable; WHERE it runs = over the broker's account data; HOW = deterministic execution.

**DO:** point at the **Rules-as-Code executed over 12,408 client accounts** panel.

**SAY:**
> "Each obligation compiles into deterministic Rules-as-Code — WHEN a trigger, ASSERT a condition, bind EVIDENCE, ON FAIL raise a task. Why does this matter? Because a rule is a *test*, not a paragraph. Watch — it executes. Over twelve thousand four hundred and eight client accounts, rule 48.4 runs and finds three hundred and twelve inactive credit balances that were never returned to clients. That gap is computed by running the rule — not a number we typed."

**DO:** scroll to the engine rows + the **immutable audit trail**.

**SAY:**
> "The engine binds the evidence, flags the gap, raises a remediation task with an owner and a deadline, and writes every step — evidence bound, gap detected, officer sign-off — to a hash-chained audit trail. This is the full loop: obligation → control → evidence → gap → remediation → audit."

**Where it's used (say if asked):** "In production these rules run continuously against the broker's back-office, risk and banking systems — the evidence contract names exactly which system each proof comes from."

---

## 7 · A NEW CIRCULAR LANDS — AMENDMENT — 0:50 · /demo

**Why:** the half most teams skip — dynamic translation, not just first extraction.

**DO:** click **▶ Drop the amendment.**

**SAY:**
> "Regulation changes. In December 2023 SEBI amended the running-account settlement date — from a fixed first-Friday to the exchange calendar. Drop that amendment and NIYAMA computes the diff: which obligation changed, which control breaks, which SOP must be edited, who owns it, by when. The 'was' is struck through, the 'now' is in force, both linked to the real SEBI circulars. This is the gap between issuance and action — measured in hours, not weeks."

**JURY-PROOF:** "The diff is computed by our diff engine, not typed — and it carries supersession: the old clause is retained, struck through, and linked to its successor."

---

## 8 · OPS CONSOLE — OBSERVABILITY & CONTROL — 0:50 · /ops

**Why:** "run it like a bank system." Observability, security, containment.

**DO:** open **/ops** (you compiled earlier, so numbers are live).

**SAY:**
> "You can't govern what you can't see. Live control plane: request and LLM counts, PII scans, p50/p95 latency, and distributed traces of every pipeline run — span by span, from extraction to the DPDP privacy guard. Security headers are checked in-browser. PII is detected and redacted before any text reaches the model. And the kill switch — one press halts every agent platform-wide with an HTTP 423, on the audit trail, instantly reversible. Humans stay in control, always."

**DO (optional, 5s):** run the **PII redaction** box or toggle the **kill switch** once and back.

---

## 9 · THE NUMBER + LIVE PROOF + REGISTER — 1:00 · /metrics, /register

**Why:** *a number beats a demo.* This is the credibility close.

**DO:** open **/metrics.**

**SAY:**
> "And the number that beats a demo. Against an independently hand-labelled gold set, with a deterministic scorer — no AI grading itself — precision one-point-zero-zero, recall zero-point-nine-five, F1 zero-point-nine-seven, clause-anchor accuracy one hundred percent. Precision is a clean 1.0: we never emit a wrong obligation. The one recall miss we disclose honestly — it's a clause outside the section we loaded."

**DO:** point at the **live extraction** result (0.81).

**SAY:**
> "Did the model really extract this, or did we type it and grade ourselves? This ran the model live over the raw clause text — it scores about 0.81. The gap from 0.81 to 0.97 is exactly the value of our anchor gate plus the officer's signature. We do not ship raw model output."

**DO:** open **/register**, expand a record, show the source card; point at **↓ JSON / ↓ CSV.**

**SAY:**
> "Everything is exportable — a machine-readable register, JSON or CSV, every record traced to the exact SEBI clause with its verbatim source span."

---

## 10 · CLOSE — 0:20

**SAY:**
> "One circular becomes structured, testable, owned obligations. The two-person adviser gets the same rigour as the top-ten broker — that's market development. And when every firm compiles the same circular the same way, SEBI can see implementation consistency across the whole population — that's supervision. NIYAMA. From regulatory text to regulatory certainty. Thank you."

---

## Q&A — fast pivots (keep in your back pocket)

- **"Did you hand-type the register?"** → /metrics → *Re-run live extraction* → 0.81, measured on stage.
- **"Is Rules-as-Code executable?"** → the 312 breaches computed over 12,408 accounts.
- **"Hallucination?"** → grounding guard flags any cited clause not in source; abstain on no anchor.
- **"Coverage / small N?"** → 20-item labelled subset stated openly; same pipeline scales to all 98 clauses and every intermediary category; the live button proves it isn't hardcoded.
- **"Is the audit real?"** → hash-chained ledger; production = append-only / Merkle store (we're honest it's demo-grade today).
- **"What's synthetic?"** → account data + engine state are synthetic; the *evidence contract* and the extracted obligations are real; connectors are the productionisation step.

**Golden rule:** lead with proof, own the limitations, never claim 100%.
