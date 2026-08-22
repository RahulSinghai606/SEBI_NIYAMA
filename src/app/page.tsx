"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Radar,
  ScanText,
  Scale,
  Network,
  Paperclip,
  ShieldCheck,
  Timer,
  FileSearch,
  Landmark,
  Layers,
  BadgeIndianRupee,
  Fingerprint,
  PlayCircle,
  PenLine,
  GitBranch,
  Lock,
} from "lucide-react";
import Nav from "@/components/Nav";
import LightRays from "@/components/LightRays";
import LiquidEther from "@/components/LiquidEther";
import TypingHeadline from "@/components/TypingHeadline";
import ExpandShowcase from "@/components/ExpandShowcase";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

const PIPELINE = [
  { Icon: Radar, name: "Watcher Agent", desc: "Detects every SEBI circular the moment it publishes — classifies applicability, diffs against your rulebook." },
  { Icon: ScanText, name: "Parser Agent", desc: "Extracts every obligation into the clause-linked Obligation Graph: who, what, when, evidence." },
  { Icon: Scale, name: "Interpretation Agent", desc: "Resolves deadlines, conditions and ambiguity — judgement calls flagged for the officer, never silently assumed." },
  { Icon: Network, name: "Rule Compiler", desc: "Compiles obligations into deterministic, versioned Rules-as-Code — checks, deadlines, workflows." },
  { Icon: PenLine, name: "Officer Sign-off", desc: "Mandatory human gate. No rule activates without compliance-officer approval — recorded on the trail." },
  { Icon: Paperclip, name: "Evidence & Audit Agents", desc: "Auto-bind proof from connected systems, flag gaps, raise remediation tasks, write the immutable ledger." },
];

const IMPACT = [
  { Icon: Timer, big: "Weeks → Hours", label: "Circular-to-action time", sub: "obligation extraction & rule activation on publication day" },
  { Icon: FileSearch, big: "100%", label: "Clause traceability", sub: "every control links to the exact para that created it" },
  { Icon: ShieldCheck, big: "–80%", label: "Manual tracking effort", sub: "evidence auto-binding replaces screenshot folders" },
  { Icon: Layers, big: "1 → 1,300+", label: "Compile once, serve all", sub: "one rulebook serves an entire intermediary class" },
  { Icon: BadgeIndianRupee, big: "SaaS", label: "Tiered by category & volume", sub: "brokers, IAs, RTAs, AMCs, MIIs — plus auditor evidence packs" },
  { Icon: Fingerprint, big: "Zero", label: "Unaudited actions", sub: "hash-chained trail — regulator-ready by construction" },
];

const ROADMAP = [
  { phase: "Prototype", window: "Now", text: "Master Circular for Stock Brokers compiled end-to-end · live obligation graph + rules + cockpit" },
  { phase: "Pilot", window: "0–4 months", text: "3–5 brokers · back-office, KYC & exchange connectors · parallel-run vs manual compliance" },
  { phase: "Scale", window: "4–10 months", text: "Full broker rulebook · IA / RTA / AMC packs · auditor evidence-pack licensing" },
  { phase: "Standard", window: "10+ months", text: "Machine-readable circular standard co-developed with SEBI — NIYAMA as India's shared compliance rail" },
];

const TICKER = [
  "Obligation Graph · clause-linked",
  "Rules-as-Code · deterministic",
  "Officer sign-off · always human-gated",
  "Evidence auto-binding",
  "Hash-chained audit trail",
  "Demonstrated on the Master Circular for Stock Brokers",
  "Accelerated on Kellton KAI",
];

export default function Home() {
  return (
    <main className="relative">
      <Nav />

      {/* ───────────── HERO — LightRays + typing headline ───────────── */}
      <section className="relative min-h-screen sky-bg noise overflow-hidden flex items-center">
        <LightRays raysOrigin="top-center" raysColor="#2f9fdc" raysSpeed={1.2} lightSpread={0.9} rayLength={1.6} mouseInfluence={0.12} noiseAmount={0.02} distortion={0.04} />
        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-24 grid lg:grid-cols-[1.2fr_0.8fr] gap-14 items-center">
          <div>
            <motion.div {...fadeUp} className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold tracking-wide text-blue mb-8">
              <span className="w-2 h-2 rounded-full bg-sky animate-pulse" />
              SEBI TECHSPRINT 2026 · AGENTIC COMPLIANCE
            </motion.div>

            <TypingHeadline
              className="font-display text-5xl sm:text-6xl lg:text-[4.4rem] font-semibold leading-[1.06] tracking-tight text-navy"
              lines={[
                { text: "From regulatory text" },
                { text: "to regulatory certainty.", className: "text-gradient" },
              ]}
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.6, duration: 0.8 }}
              className="mt-7 max-w-xl text-lg text-ink-soft leading-relaxed"
            >
              <strong className="text-navy">NIYAMA</strong>
              {" is the agentic compliance operating system: it compiles SEBI circulars into a clause-linked "}
              <strong className="text-navy">Obligation Graph</strong>
              {", then into deterministic "}
              <strong className="text-navy">Rules-as-Code</strong>
              {" — with mandatory officer sign-off, evidence auto-binding and an immutable audit trail."}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.0, duration: 0.7 }} className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/demo"
                className="group inline-flex items-center gap-2 rounded-2xl bg-blue text-white font-semibold px-7 py-4 card-elevate hover:bg-navy transition-all hover:-translate-y-0.5"
              >
                <PlayCircle className="w-5 h-5" />
                Launch the live demo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/metrics" className="inline-flex items-center gap-2 rounded-2xl glass font-semibold text-navy px-7 py-4 hover:bg-white transition-colors">
                See the numbers
              </Link>
              <Link href="/register" className="inline-flex items-center gap-2 rounded-2xl glass font-semibold text-navy px-7 py-4 hover:bg-white transition-colors">
                Obligation Register
              </Link>
              <Link
                href="/ops"
                className="inline-flex items-center gap-2 rounded-2xl border border-line font-semibold text-navy px-7 py-4 hover:border-sky hover:text-blue transition-colors"
              >
                Platform Ops Console
              </Link>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.4 }} className="mt-6 text-xs text-ink-faint">
              Not a chatbot. Not a RAG assistant. A compiler for regulation.
            </motion.p>
          </div>

          {/* hero illustration — circular → graph → code */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-3xl bg-surface border border-line card-elevate p-5 rotate-[-2deg] animate-float">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-ink-faint mb-2 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-blue" /> SEBI Circular · detected 10:14 IST
              </p>
              <p className="text-[11px] leading-relaxed text-ink-soft font-serif italic">
                {"“6.1 The settlement of the running account of clients’ funds shall be done… on the first Friday of the quarter…”"}
              </p>
              <div className="relative h-8 my-1">
                <span className="scan-line" />
              </div>
              <div className="rounded-xl bg-bg-soft border border-line p-3">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-sky mb-1.5 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5" /> Obligation Graph
                </p>
                <p className="text-[11px] text-ink-soft">
                  <span className="font-mono-code text-blue">OB-101</span> · Ops · settle running account · <span className="text-warn font-medium">first Friday/qtr</span> · evidence: settlement register
                </p>
              </div>
              <div className="rule-code mt-3 !text-[10px] !leading-relaxed">
{`WHEN calendar.first_friday(cycle)
ASSERT settlement.executed == true
EVIDENCE bind(register, bank_utr)
ON FAIL raise(task, CRITICAL, OPS)`}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-ok">
                  <PenLine className="w-3.5 h-3.5" /> Officer signed · v1.3 active
                </span>
                <span className="hash-chip flex items-center gap-1"><Lock className="w-3 h-3" /> 0x8f2a…c41d</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ticker */}
        <div className="absolute bottom-0 inset-x-0 border-t border-line/70 bg-white/60 backdrop-blur-md py-3 overflow-hidden">
          <div className="flex gap-12 whitespace-nowrap animate-ticker w-max">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="text-xs font-semibold tracking-[0.16em] uppercase text-ink-soft flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-sky" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── PROBLEM → SHIFT ───────────── */}
      <section className="relative py-28 bg-surface">
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 gap-8">
          <motion.div {...fadeUp} className="rounded-3xl border border-line bg-bg p-10 card-elevate">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-warn mb-4">The regulator&apos;s problem</p>
            <h3 className="font-display text-3xl font-semibold text-navy leading-snug">One circular. Three hundred brokers. Divergent implementation.</h3>
            <p className="mt-4 text-ink-soft leading-relaxed">
              SEBI issues a circular; brokers arrive at slightly different answers on slightly different timelines.
              The regulation was uniform — the implementation isn&apos;t. That is a <strong className="text-navy">supervision blind spot</strong> and an <strong className="text-navy">investor risk</strong>.
              Why it stayed unsolved: <em>regulation lives as prose, compliance runs as systems</em>, and every intermediary bridges that gap by hand — slightly differently.
            </p>
          </motion.div>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="rounded-3xl bg-gradient-to-br from-blue to-navy p-10 text-white card-elevate">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-sky mb-4">With NIYAMA</p>
            <h3 className="font-display text-3xl font-semibold leading-snug">We don&apos;t answer questions — we turn the circular into objects.</h3>
            <p className="mt-4 text-white/80 leading-relaxed">
              Each obligation becomes a machine-readable object — clause anchor, owner, periodicity, deadline, evidence contract, verification test.
              That object is the bridge; dashboards, alerts and audits are just software reading a structured record. Human-approved, evidence-bound, hash-chained — circular-to-action in <strong className="text-white">hours</strong>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ───────────── PIPELINE ───────────── */}
      <section id="pipeline" className="relative py-32 sky-bg noise">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-sky mb-4">The pipeline</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-navy">
              Six stages. <span className="text-gradient">One unbroken chain of custody.</span>
            </h2>
            <p className="mt-4 text-ink-soft">From SEBI&apos;s PDF to a running control — every hop deterministic, every hop on the ledger.</p>
            <p className="mt-3 text-[13px] text-ink-faint">ingest → segment by clause → classify obligation vs. context → extract to schema → resolve conflicts &amp; supersessions → map to systems → generate control + evidence request</p>
            <p className="mt-4 inline-block rounded-full border border-blue/30 bg-blue/[0.06] px-4 py-1.5 text-xs font-bold text-navy">Guardrail — no clause anchor, no obligation. Nothing enters the register without a citation.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PIPELINE.map((p, i) => (
              <motion.div
                key={p.name}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                className="group relative rounded-3xl glass card-elevate p-8 hover:-translate-y-1 transition-transform overflow-hidden"
              >
                <span className="absolute top-5 right-6 font-display text-5xl font-semibold text-line group-hover:text-sky/30 transition-colors">{i + 1}</span>
                <p.Icon className="w-7 h-7 text-blue mb-5" strokeWidth={1.7} />
                <h3 className="font-display text-xl font-semibold text-navy">{p.name}</h3>
                <p className="text-sm text-ink-soft mt-2 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── FULL-SCREEN EXPANSION SHOWCASE ───────────── */}
      <div id="cockpit">
        <ExpandShowcase />
      </div>

      {/* ───────────── IMPACT (projected) ───────────── */}
      <section id="impact" className="relative py-32 bg-surface">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-sky mb-4">Impact & commercial potential</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-navy">
              One rulebook, <span className="text-gradient">an entire market</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {IMPACT.map((s, i) => (
              <motion.div key={s.label} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.05 }} className="rounded-3xl border border-line bg-bg p-8 card-elevate hover:-translate-y-1 transition-transform">
                <s.Icon className="w-7 h-7 text-sky mb-5" strokeWidth={1.7} />
                <p className="font-display text-3xl font-semibold text-navy">{s.big}</p>
                <p className="font-semibold text-blue mt-1">{s.label}</p>
                <p className="text-sm text-ink-soft mt-2 leading-relaxed">{s.sub}</p>
              </motion.div>
            ))}
          </div>

          <motion.p {...fadeUp} className="mt-8 text-center text-xs text-ink-faint">
            Figures are projected targets based on compliance-automation benchmarks · to be validated in pilot
          </motion.p>
        </div>
      </section>

      {/* ───────────── ROADMAP ───────────── */}
      <section className="relative py-32 sky-bg noise">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-sky mb-4">Roadmap</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-navy">
              Prototype → <span className="text-gradient">India&apos;s compliance rail</span>
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue via-sky to-gold md:-translate-x-px" />
            <div className="space-y-12">
              {ROADMAP.map((r, i) => (
                <motion.div key={r.phase} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.05 }} className={`relative flex ${i % 2 ? "md:justify-start" : "md:justify-end"}`}>
                  <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-10 h-10 rounded-full bg-surface border-2 border-sky flex items-center justify-center font-display font-semibold text-blue z-10">
                    {i + 1}
                  </div>
                  <div className="ml-16 md:ml-0 md:w-[calc(50%-48px)] rounded-2xl border border-line bg-surface p-6 card-elevate">
                    <div className="flex items-baseline gap-3 mb-2">
                      <h3 className="font-display text-xl font-semibold text-navy">{r.phase}</h3>
                      <span className="text-xs font-semibold text-sky">{r.window}</span>
                    </div>
                    <p className="text-sm text-ink-soft leading-relaxed">{r.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── SCALE & SEBI MANDATE (beat 8) ───────────── */}
      <section className="relative py-28 bg-surface">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-sky mb-4">Why this serves SEBI&apos;s mandate</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-navy">Structured obligations change what&apos;s possible.</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div {...fadeUp} className="rounded-3xl border border-line bg-bg p-10 card-elevate">
              <p className="text-xs font-bold tracking-[0.25em] uppercase text-blue mb-3">Market development</p>
              <h3 className="font-display text-2xl font-semibold text-navy leading-snug">Same rigour for the two-person adviser and the top-ten broker.</h3>
              <p className="mt-4 text-ink-soft leading-relaxed">Compliance rigour stops being a function of headcount. A small intermediary gets the same clause-anchored controls, evidence contracts and audit trail as the largest firm — lowering the cost of doing the right thing.</p>
            </motion.div>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="rounded-3xl bg-gradient-to-br from-blue to-navy p-10 text-white card-elevate">
              <p className="text-xs font-bold tracking-[0.25em] uppercase text-sky mb-3">Supervision</p>
              <h3 className="font-display text-2xl font-semibold leading-snug">If obligations are structured, consistency becomes observable.</h3>
              <p className="mt-4 text-white/80 leading-relaxed">When every intermediary compiles the same circular into the same structured objects, SEBI can see implementation consistency across the population — not just self-reported filings. Uniform regulation, finally, uniformly measurable.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────── CTA — LiquidEther ───────────── */}
      <section className="relative py-32 bg-surface overflow-hidden">
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative rounded-[2.5rem] overflow-hidden border border-line card-elevate bg-bg">
            <div className="absolute inset-0">
              <LiquidEther colors={["#0a58c4", "#2aa9e8", "#bfe3f7"]} mouseForce={22} cursorSize={110} resolution={0.5} autoDemo autoSpeed={0.55} autoIntensity={2.4} className="pointer-events-auto" />
            </div>
            <div className="relative z-10 px-8 py-24 sm:px-16 text-center pointer-events-none">
              <motion.h2 {...fadeUp} className="font-display text-4xl md:text-6xl font-semibold text-navy leading-tight">
                &ldquo;From regulatory text to <span className="text-gradient">regulatory certainty.</span>&rdquo;
              </motion.h2>
              <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="mt-5 text-ink-soft text-lg">
                NIYAMA · SEBI TechSprint 2026 · built by Kellton on the KAI agentic platform
              </motion.p>
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.18 }} className="mt-10 pointer-events-auto">
                <Link
                  href="/demo"
                  className="group inline-flex items-center gap-2 rounded-2xl bg-blue text-white font-semibold px-9 py-5 text-lg card-elevate hover:bg-navy transition-all hover:-translate-y-0.5"
                >
                  Compile a circular live
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        <footer className="mt-20 border-t border-line/70">
          <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Image src="/kellton-logo.jpg" alt="Kellton" width={100} height={28} className="h-6 w-auto rounded" />
              <span className="h-5 w-px bg-line" />
              <Image src="/sebi-logo.png" alt="SEBI" width={64} height={28} className="h-7 w-auto" />
              <span className="font-display font-semibold text-navy">NIYAMA</span>
            </div>
            <p className="text-xs text-ink-faint text-center md:text-right max-w-md">
              Concept demo for SEBI TechSprint 2026 · Team Kellton. All circular text, firm names and compliance data shown are synthetic.
            </p>
          </div>
        </footer>
      </section>
    </main>
  );
}
