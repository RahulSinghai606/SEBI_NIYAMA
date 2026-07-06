<div align="center">

# NIYAMA — The Agentic Compliance Operating System

**From regulatory text to regulatory certainty.**

Not a chatbot. Not a RAG assistant. A compiler for regulation:
SEBI circulars → clause-linked **Obligation Graph** → deterministic **Rules-as-Code** —
with mandatory officer sign-off, evidence auto-binding and an immutable audit trail.

*SEBI TechSprint 2026 · Team Kellton · Accelerated on the KAI Agentic Platform*

</div>

---

## What this is

Compliance today is read, remembered and hoped: hundreds of circulars a year, PDFs into spreadsheets, screenshots for auditors, weeks from circular to control. NIYAMA collapses circular-to-action **from weeks to hours** by treating regulation as something you *compile*, not something you *read*.

This repository is a **fully working concept demo**, demonstrated on themes from SEBI's Master Circular for Stock Brokers:

- **Landing experience** (`/`) — WebGL light-ray hero with a typing headline, six-stage pipeline, a scroll-driven full-screen expansion into the compliance cockpit, projected-impact grid and roadmap.
- **NIYAMA Command Center** (`/demo`) — pick a circular from the regulatory feed, compile it live: four agents extract the clause-linked Obligation Graph, the Rule Compiler emits Rules-as-Code, the compliance officer interrogates the Interpretation Agent and signs off, then the Compliance Engine binds evidence, flags gaps, raises remediation tasks — every action written to a hash-chained audit trail.

All circular text, firm names and compliance data are **synthetic**. Live reasoning runs server-side through an Azure AI Foundry deployment; if unreachable, the demo falls back to cached compilations so it never stalls on stage.

## The pipeline

```
SEBI publishes ─▶ Watcher Agent (detect · classify · diff)
                    └─▶ Parser + Interpretation Agents ─▶ Obligation Graph
                          (who / what / when / evidence — every node clause-linked)
                            └─▶ Rule Compiler ─▶ deterministic Rules-as-Code (versioned)
                                  └─▶ Compliance-officer sign-off  ← MANDATORY human gate
                                        └─▶ Compliance Engine: evidence auto-binding ·
                                            gap detection · remediation tasks · dashboards
                                              └─▶ Immutable hash-chained audit trail
```

**In this codebase:**

| Layer | Where |
|---|---|
| Synthetic regulatory corpus + obligation graphs + engine state | `src/lib/data.ts` |
| Reasoning Layer client (server-side, key never exposed) | `src/lib/reasoning.ts` |
| 4-agent compilation pipeline API | `src/app/api/pipeline/run/route.ts` |
| Clause-grounded officer Q&A ("Ask NIYAMA") | `src/app/api/ask/route.ts` |
| Command Center UI (graph, rules, sign-off, engine, ledger) | `src/app/demo/page.tsx` |
| LightRays / LiquidEther / typing / expansion showcase | `src/components/` |

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS v4** — white/sky-blue premium system, Sora + Public Sans
- **OGL** (LightRays hero) + **Three.js** (LiquidEther fluid CTA) + **GSAP ScrollTrigger** (cockpit expansion)
- **Azure AI Foundry (Responses API)** — server-side LLM reasoning for the agent pipeline and clause Q&A
- **Production path:** knowledge graph for obligations, deterministic rules engine, vector search over the corpus, append-only hash-chained ledger, cloud-native microservices with back-office / KYC / exchange connectors

## Run it

```bash
npm install
cp .env.example .env.local   # Azure AI Foundry endpoint, key & deployment
npm run dev                  # http://localhost:3000
```

Without keys the app still runs — the Command Center serves cached compilations instead of live reasoning.

## Demo flow (3 minutes)

1. **Landing (45s)** — typing headline under the light rays, pipeline cards, scroll until the cockpit expands to full screen.
2. **Compile (60s)** — open the Command Center, pick *Settlement of Running Account*, hit **Compile this circular** — watch Watcher → Parser → Interpretation → Mapping reason live, then inspect the Obligation Graph and the Rules-as-Code tab.
3. **Sign-off (45s)** — ask the Interpretation Agent a hard question ("first Friday is a holiday and so is Thursday — when do we settle?"), read the clause-cited answer, then **Approve & activate**.
4. **Engine (30s)** — compliance dashboard lights up: evidence auto-bound, a gap flagged with a remediation task, and the hash-chained audit trail recording every step.

---

*Concept demo for SEBI TechSprint 2026. Impact figures are projected targets; all data synthetic.*
