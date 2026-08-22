# NIYAMA — SEBI Finals Defend Pack

**Product:** NIYAMA — The Agentic Compliance Operating System
**Tagline:** From regulatory text to regulatory certainty.
**Intermediary (chosen, deep):** Stock Broker (Trading Member)
**Corpus:** SEBI **Master Circular for Stock Brokers**, ref **SEBI/HO/MIRSD/MIRSD-PoD/P/CIR/2025/90**, 17 Jun 2025 (399 pages, 98 clauses)
**Live:** https://sebi-niyama.vercel.app · **Team Kellton**

---

## The three numbers to say out loud

1. **Verified register: Precision 1.00 · Recall 0.95 · F1 0.974 · clause-anchor accuracy 100%** — measured live at `/metrics` (and `/api/eval`) against a 20-item independently hand-labelled gold set.
2. **Raw single-shot model: F1 ≈ 0.81** (press *Re-run live extraction*). The gap 0.81 → 0.974 **is our product** — the clause-anchor gate + officer sign-off.
3. **Executable rule: 312 breaches computed** by running R-48.4 over 12,408 accounts — the gap is computed, not typed.

---

## Jury question → answer → where it lives

| Jury question | Answer | Screen |
|---|---|---|
| Structured obligation register, or just retrieved text? | Machine-readable register: clause anchor · source span · owner · trigger · periodicity · deadline · **evidence contract** · **rule-as-code (test)** · provenance. JSON/CSV export. | `/register` |
| Hand-labelled gold set + precision/recall vs it? | Yes — 20-item gold, deterministic scorer (no LLM). **P 1.00 / R 0.95 / F1 0.974.** | `/metrics`, `/api/eval` |
| Did the model actually extract, or did you type it? | Press **Re-run live extraction** — model runs over raw clause text on stage, anchor-gated, scored fresh (**F1 ~0.81**). | `/metrics` |
| Is every claim clause-anchored? What if no anchor? | Hard gate: no verbatim span ⇒ **abstain** (logged "needs human"), never emitted. Two live abstain fixtures. | `/metrics`, demo |
| Can you show the diff when an amendment arrives? | Demo → **"▶ Drop the amendment"** → computed diff (`diffObligations()`): modified field redline, control that breaks, SOP edit, owner, by-when, issuance→action **6h**. | `/demo` |
| Do you handle supersession? | Register carries `supersedes`/`supersededBy`; the real Dec-2023 "first-Friday → exchange-calendar" amendment (clause 47→48) is shown end to end. | `/demo`, `/register` |
| Is the Rules-as-Code executable or pseudocode? | Executable — R-48.2/48.4/48.8 run over 12,408 accounts; **312** unswept inactive balances computed live with sample IDs. | `/demo` engine |
| Human attestation + logged audit trail? | Mandatory officer sign-off with an **attestation note / override reason** written verbatim to the **hash-chained** ledger. Nothing auto-filed to an exchange/SEBI. | `/demo` |
| What stops Ask-NIYAMA hallucinating a clause? | Grounding guard — any cited clause not present in the source is **flagged unverified + logged**. | `/demo` "Ask NIYAMA" |
| Actual master circular or a subset? Say which. | The real …/2025/90; we labelled clause 48 + a spread (margin, cyber, QSB, UCC, grievance, RBS, upstreaming). Stated on-screen. Full corpus = same code path. | header banners |
| Intermediary category? | Stock Broker — one corpus, deep. | global |

---

## SEBI evaluation criteria → proof

- **Market Impact:** issuance→action collapses weeks→hours; every obligation clause-anchored + evidence-bound; the running-account control catches **312** client balances not returned — direct investor-fund protection.
- **Technology Stack:** neuro-symbolic — agentic LLM extraction (Azure AI Foundry) + **deterministic Rules-as-Code** + Obligation Graph + hash-chained ledger. Measured (P/R/F1), not asserted.
- **Feasibility:** live on the web; obligations map to back-office/GRC/SIEM connectors; officer-in-loop fits the *accountable* compliance workflow, not replaces it.
- **Scalability:** each circular compiles independently (stateless fan-out); rules versioned; 20-of-98 labelled today, same pipeline scales to the full corpus and across intermediaries.
- **SEBI's mandate:** investor protection (client-asset rules enforced), market development (2-person IA gets top-10-broker rigour), supervision (structured obligations → population-wide implementation consistency, not self-reported filings).

---

## The 8-beat demo run (click path)

1. **Landing** — regulator pain: "one circular, 300 brokers, divergent implementation → supervision blind spot + investor risk."
2. Scroll — "regulation lives as prose, compliance runs as systems" (why unsolved).
3. **/demo** → circular **Settlement of Running Account (Clause 48)** → **Compile this circular** → Obligation Graph: *"we turn the circular into objects"* — show one object's 10 fields + **source anchor → view on sebi.gov.in**.
4. Point at the guardrail: **no clause anchor, no obligation**; the exchange-scope line (48.10) is abstained.
5. **Standing obligation end-to-end** — executable rules panel (312 computed) → engine gap → remediation task → audit pack.
6. **Officer review** — Ask NIYAMA a clause question (grounded), type an **attestation note**, **Attest & activate**.
7. **▶ Drop the amendment** — computed diff, control breaks, owner, **6h**.
8. **/metrics** — P/R/F1 0.974, then **Re-run live extraction** (0.81) → "the delta is our product." Close on **/register** (download JSON/CSV).

---

## Own these limitations first (honesty wins)

- Demo data (accounts, engine state) is synthetic; the **evidence contract** is the real artifact — production binds to broker back-office / bank / SIEM connectors.
- Hash-chain is a display-grade ledger; production = append-only / Merkle store.
- The Watcher (live SEBI-feed detection) is simulated; production wires to the SEBI circular feed + exchange connectors.
- 20 gold items is a labelled subset of 98 clauses — stated explicitly; the pipeline (not hand-authoring) scales to the rest, and the live-extraction button proves it.

---

## Two lines that win the room

- *"We don't ship raw model output. Raw single-shot is F1 0.81 — the anchor gate and the officer's signature take it to a verified 0.974. That delta is our product."*
- *"The gap isn't a number we wrote. Press this — the rule executes over 12,408 accounts and finds 312 breaches. The DSL is a test, not a slide."*
