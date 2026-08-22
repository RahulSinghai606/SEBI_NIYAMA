"use client";

// NIYAMA Command Center — compile a SEBI circular live:
// circular → agent pipeline → Obligation Graph → Rules-as-Code →
// mandatory officer sign-off → Compliance Engine → immutable audit trail.

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Radar,
  ScanText,
  Scale,
  Network,
  ShieldCheck,
  AlertTriangle,
  Clock4,
  Play,
  PenLine,
  Link2,
  Lock,
  FileText,
  GitBranch,
  Braces,
  Send,
  CheckCheck,
  ListChecks,
  Landmark,
  RotateCcw,
  Volume2,
  Activity,
  OctagonX,
} from "lucide-react";
import { circulars, Circular, AgentStep, Obligation, Rule } from "@/lib/data";

type Phase = "idle" | "compiling" | "review" | "active";
type Tab = "graph" | "rules";

const STEP_ICONS: Record<string, React.ElementType> = {
  radar: Radar,
  scan: ScanText,
  scale: Scale,
  network: Network,
};

const SEV: Record<string, string> = {
  critical: "text-alert bg-alert/10",
  high: "text-warn bg-warn/10",
  medium: "text-blue bg-blue/10",
};

type LedgerEntry = { seq: number; action: string; actor: string; time: string; hash: string; prev: string };

// deterministic toy hash for the demo ledger (display only)
function toyHash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return "0x" + (h >>> 0).toString(16).padStart(8, "0");
}

export default function DemoPage() {
  const [circular, setCircular] = useState<Circular>(circulars[0]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [live, setLive] = useState(false);
  const [tab, setTab] = useState<Tab>("graph");
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [pendingReveal, setPendingReveal] = useState(false);
  const [lang, setLang] = useState<"en" | "hi" | "gu" | "mr">("en");
  const [killed, setKilled] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [amendOpen, setAmendOpen] = useState(false);
  const seqRef = useRef(4181);

  // live kill-switch awareness — polled from the ops core
  useEffect(() => {
    let on = true;
    const poll = async () => {
      try {
        const r = await fetch("/api/ops/kill", { cache: "no-store" });
        const d = await r.json();
        if (on) setKilled(Boolean(d.engaged));
      } catch {}
    };
    poll();
    const t = setInterval(poll, 3000);
    return () => {
      on = false;
      clearInterval(t);
    };
  }, []);

  const appendLedger = (action: string, actor: string) => {
    const seq = ++seqRef.current;
    const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
    setLedger((prev) => {
      if (prev.some((e) => e.seq === seq)) return prev;
      const prevHash = prev.length ? prev[prev.length - 1].hash : "0x00000000";
      const hash = toyHash(`${seq}|${action}|${actor}|${prevHash}`);
      return [...prev, { seq, action, actor, time, hash, prev: prevHash }];
    });
  };

  const selectCircular = (c: Circular) => {
    setCircular(c);
    setPhase("idle");
    setSteps([]);
    setVisibleSteps(0);
    setObligations([]);
    setRules([]);
    setLedger([]);
    setAnswer(null);
    setQuestion("");
    setTab("graph");
    setAmendOpen(false);
    seqRef.current = 4181;
  };

  const compile = async () => {
    setPhase("compiling");
    setAmendOpen(false);
    setSteps([]);
    setVisibleSteps(0);
    setObligations([]);
    setRules([]);
    setLedger([]);
    setAnswer(null);
    seqRef.current = 4181;
    appendLedger(`Circular ${circular.ref} ingested`, "Watcher Agent");
    try {
      const res = await fetch("/api/pipeline/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ circularId: circular.id }),
      });
      if (res.status === 423) {
        setPhase("idle");
        setKilled(true);
        appendLedger("BLOCKED (HTTP 423) — kill switch engaged, no agent executed", "Platform Guard");
        return;
      }
      const data = await res.json();
      setSteps(data.steps);
      setObligations(data.obligations);
      setRules(data.rules);
      setLive(data.live);
    } catch {
      setSteps(circular.fallback.steps);
      setObligations(circular.fallback.obligations);
      setRules(circular.fallback.rules);
      setLive(false);
    }
    setPendingReveal(true);
  };

  // staggered reveal of pipeline steps
  useEffect(() => {
    if (!pendingReveal) return;
    if (visibleSteps >= steps.length && steps.length > 0) {
      setPendingReveal(false);
      appendLedger(`${obligations.length} obligations extracted, ${rules.length} rules compiled`, "Parser + Compiler");
      setPhase("review");
      return;
    }
    const t = setTimeout(() => setVisibleSteps((v) => v + 1), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingReveal, visibleSteps, steps.length]);

  const ask = async () => {
    const q = question.trim();
    if (!q || asking) return;
    setAsking(true);
    setAnswer(null);
    appendLedger(`Officer query: "${q.slice(0, 60)}${q.length > 60 ? "…" : ""}"`, "Compliance Officer");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ circularId: circular.id, question: q, obligations, lang }),
      });
      if (res.status === 423) {
        setKilled(true);
        setAnswer("Execution suspended — kill switch engaged. Release it from the Ops Console to resume.");
        setAsking(false);
        return;
      }
      const data = await res.json();
      setAnswer(data.reply);
      appendLedger(`Interpretation Agent answered with clause citation (${lang.toUpperCase()})`, "Interpretation Agent");
    } catch {
      setAnswer("The Interpretation Agent is momentarily unavailable — question logged to the review queue.");
    }
    setAsking(false);
  };

  // Azure Neural TTS — reads the agent's answer aloud in the selected language
  const speak = async () => {
    if (!answer || speaking) return;
    setSpeaking(true);
    try {
      const r = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: answer, lang }),
      });
      if (r.ok) {
        const url = URL.createObjectURL(await r.blob());
        const audio = new Audio(url);
        audio.onended = () => {
          setSpeaking(false);
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => setSpeaking(false);
        await audio.play();
        return;
      }
    } catch {}
    setSpeaking(false);
  };

  const signOff = () => {
    appendLedger(`Rulebook v1.0 approved & activated (${rules.length} rules)`, "Compliance Officer · sign-off");
    circular.engine.forEach((row) => {
      if (row.status === "compliant") appendLedger(`Evidence bound → ${row.obligationId}`, "Evidence Agent");
      if (row.status === "gap") appendLedger(`GAP detected on ${row.obligationId} → remediation task raised`, "Gap & Audit Agent");
    });
    setPhase("active");
  };

  const stats = {
    total: circular.engine.length,
    ok: circular.engine.filter((e) => e.status === "compliant").length,
    gaps: circular.engine.filter((e) => e.status === "gap").length,
    pending: circular.engine.filter((e) => e.status === "pending").length,
  };

  const obligationById = (id: string) => obligations.find((o) => o.id === id) ?? circular.fallback.obligations.find((o) => o.id === id);

  return (
    <main className="min-h-screen sky-bg noise">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto max-w-[1560px] px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-lg hover:bg-bg transition-colors" aria-label="Back to home">
              <ArrowLeft className="w-4 h-4 text-ink-soft" />
            </Link>
            <Image src="/kellton-logo.jpg" alt="Kellton" width={84} height={24} className="h-5 w-auto rounded" />
            <span className="h-5 w-px bg-line" />
            <span className="font-display font-semibold text-navy">
              NIYAMA <span className="text-gradient">Command Center</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5 rounded-lg bg-bg border border-line p-0.5" aria-label="Answer language">
              {(["en", "hi", "gu", "mr"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wide transition-colors ${
                    lang === l ? "bg-blue text-white" : "text-ink-faint hover:text-navy"
                  }`}
                >
                  {l === "en" ? "EN" : l === "hi" ? "हिं" : l === "gu" ? "ગુ" : "मरा"}
                </button>
              ))}
            </div>
            <Link
              href="/ops"
              className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-navy border border-line rounded-full px-3 py-1 hover:border-sky hover:text-blue transition-colors"
            >
              <Activity className="w-3.5 h-3.5" /> Ops Console
            </Link>
            {killed ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-alert bg-alert/10 rounded-full px-3 py-1">
                <OctagonX className="w-3.5 h-3.5" />
                EXECUTION SUSPENDED
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-ok bg-ok/10 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse" />
                REASONING LAYER ONLINE
              </span>
            )}
            <Image src="/sebi-logo.png" alt="SEBI" width={60} height={26} className="h-7 w-auto" />
          </div>
        </div>
      </header>

      {/* platform-wide kill banner */}
      {killed && (
        <div className="bg-alert text-white text-[12px] font-semibold py-2 px-4 flex items-center justify-center gap-2 flex-wrap">
          <OctagonX className="w-4 h-4 shrink-0" />
          KILL SWITCH ENGAGED — all agentic execution is suspended platform-wide. The deterministic rulebook remains read-only.
          <Link href="/ops" className="underline underline-offset-2 font-bold">
            Release from the Ops Console →
          </Link>
        </div>
      )}

      <div className="mx-auto max-w-[1560px] px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[300px_1fr_1.05fr] gap-5">
        {/* ── LEFT: circular feed ── */}
        <aside className="space-y-3">
          <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-ink-faint px-1">Regulatory feed · SEBI</p>
          {circulars.map((c) => {
            const active = c.id === circular.id;
            return (
              <button
                key={c.id}
                onClick={() => selectCircular(c)}
                className={`w-full text-left rounded-2xl p-4 transition-all border ${
                  active ? "bg-surface border-sky card-elevate -translate-y-0.5" : "glass border-transparent hover:border-line hover:bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 p-1.5 rounded-lg bg-blue/8 text-blue shrink-0">
                    <Landmark className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-navy text-sm leading-snug">{c.title}</p>
                    <p className="text-[10px] font-mono-code text-ink-faint mt-1 truncate">{c.ref}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${c.impact === "High" ? "text-alert bg-alert/8" : "text-warn bg-warn/8"}`}>
                    {c.impact} impact
                  </span>
                  <span className="text-[10px] text-ink-faint">{c.category} · {c.date}</span>
                </div>
              </button>
            );
          })}
          <div className="rounded-2xl border border-dashed border-line p-4 text-center">
            <p className="text-xs text-ink-faint leading-relaxed">Watcher Agent monitoring…<br />next poll in 0:47</p>
          </div>
        </aside>

        {/* ── MIDDLE: circular + pipeline ── */}
        <section className="rounded-3xl bg-surface border border-line card-elevate overflow-hidden flex flex-col">
          <div className="bg-gradient-to-br from-blue to-navy text-white px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-mono-code text-white/60">{circular.ref}</p>
                <h2 className="font-display text-xl font-semibold mt-1 leading-snug">{circular.title}</h2>
                <p className="text-xs text-white/70 mt-1">{circular.date} · {circular.category}</p>
              </div>
              <span className="text-[10px] font-bold tracking-[0.16em] uppercase bg-white/15 rounded-full px-3 py-1 shrink-0">Source text</span>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col min-h-0">
            <div className="relative rounded-2xl bg-bg border border-line p-4 overflow-hidden">
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-sky mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Circular text (extract)
              </p>
              <p className="text-[13px] leading-relaxed text-ink-soft font-serif max-h-40 overflow-y-auto thin-scroll pr-2">{circular.excerpt}</p>
              {phase === "compiling" && <span className="scan-line" />}
            </div>

            <button
              onClick={compile}
              disabled={phase === "compiling" || killed}
              className={`mt-5 group w-full inline-flex items-center justify-center gap-2 rounded-2xl font-semibold py-4 card-elevate transition-all disabled:cursor-not-allowed ${
                killed ? "bg-alert/15 text-alert border border-alert/40" : "bg-blue text-white hover:bg-navy disabled:opacity-60"
              }`}
            >
              {killed ? (
                <>
                  <OctagonX className="w-5 h-5" /> Execution suspended — kill switch engaged
                </>
              ) : phase === "compiling" ? (
                <>Compiling circular…</>
              ) : phase === "idle" ? (
                <>
                  <Play className="w-5 h-5" /> Compile this circular
                </>
              ) : (
                <>
                  <RotateCcw className="w-5 h-5" /> Re-compile
                </>
              )}
            </button>

            {/* pipeline trace */}
            <div className="mt-5 flex-1 min-h-0 overflow-y-auto thin-scroll space-y-2.5 pr-1">
              {steps.length > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-ink-faint">Agent pipeline trace</p>
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide rounded-full px-2.5 py-1 ${live ? "text-ok bg-ok/10" : "text-warn bg-warn/10"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${live ? "bg-ok" : "bg-warn"} animate-pulse`} />
                    {live ? "LIVE REASONING" : "CACHED COMPILATION"}
                  </span>
                </div>
              )}
              {phase === "compiling" && steps.length === 0 && (
                <div className="flex items-center gap-2 px-1 py-4 text-xs text-ink-faint">
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-sky inline-block" />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-sky inline-block" />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-sky inline-block" />
                  Watcher → Parser → Interpretation → Mapping agents reasoning on the text…
                </div>
              )}
              {steps.slice(0, visibleSteps).map((s, i) => {
                const Icon = STEP_ICONS[s.icon] ?? Scale;
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="flex gap-3 rounded-2xl border border-line bg-bg p-3.5">
                    <span className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue to-sky text-white flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-navy">{s.agent}</p>
                        <span className="text-[10px] font-semibold text-sky">{Math.round(s.confidence * 100)}%</span>
                      </div>
                      <p className="text-xs text-ink-soft leading-relaxed mt-0.5">{s.finding}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── RIGHT: graph / rules / sign-off / engine / ledger ── */}
        <section className="rounded-3xl bg-surface border border-line card-elevate overflow-hidden flex flex-col min-h-[680px]">
          <AnimatePresence mode="wait">
            {phase === "idle" || phase === "compiling" ? (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-center p-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue to-sky flex items-center justify-center card-elevate mb-6 animate-float pulse-ring relative">
                  <GitBranch className="w-9 h-9 text-white" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-navy">
                  {phase === "compiling" ? "Building the Obligation Graph…" : "The compiler is standing by"}
                </h3>
                <p className="mt-3 text-sm text-ink-soft max-w-sm leading-relaxed">
                  {phase === "compiling"
                    ? "Obligations are being extracted clause-by-clause and compiled into deterministic rules."
                    : "Compile the circular to extract every obligation into a clause-linked graph, generate Rules-as-Code, and route them for officer sign-off."}
                </p>
              </motion.div>
            ) : (
              <motion.div key="work" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col min-h-0">
                {/* header + tabs */}
                <div className="px-5 pt-4 pb-3 border-b border-line flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex gap-1 rounded-xl bg-bg p-1">
                    {(["graph", "rules"] as Tab[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 ${tab === t ? "bg-surface text-blue card-elevate" : "text-ink-faint hover:text-ink-soft"}`}
                      >
                        {t === "graph" ? <GitBranch className="w-3.5 h-3.5" /> : <Braces className="w-3.5 h-3.5" />}
                        {t === "graph" ? `Obligation Graph (${obligations.length})` : `Rules-as-Code (${rules.length})`}
                      </button>
                    ))}
                  </div>
                  {phase === "review" ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-warn bg-warn/10 rounded-full px-3 py-1.5">
                      <PenLine className="w-3.5 h-3.5" /> AWAITING OFFICER SIGN-OFF
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-ok bg-ok/10 rounded-full px-3 py-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> RULEBOOK v1.0 ACTIVE
                    </span>
                  )}
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto thin-scroll p-5 space-y-3">
                  {/* graph / rules */}
                  {tab === "graph" ? (
                    <>
                      {/* beat 3 — the artifact */}
                      <div className="rounded-2xl border border-sky/30 bg-sky/[0.05] px-4 py-2.5 text-[11px] text-ink-soft">
                        <b className="text-navy">We don&apos;t answer questions about the circular — we turn it into objects.</b> Each record is the bridge: clause-anchored, owned, testable. Everything downstream — dashboards, alerts, audits — is software reading a structured record.
                      </div>
                      {obligations.map((o, i) => (
                        <motion.div key={o.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-line bg-bg p-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono-code text-[11px] font-bold text-blue">{o.id}</span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-ink-faint">
                              <Link2 className="w-3 h-3" /> {o.clause}
                            </span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${SEV[o.severity]}`}>{o.severity}</span>
                            {o.intermediary && <span className="text-[9px] font-semibold rounded-full px-2 py-0.5 bg-navy/8 text-navy">{o.intermediary}</span>}
                            <span className="ml-auto text-[10px] text-ink-faint">{o.frequency}</span>
                          </div>
                          <p className="text-sm font-medium text-navy mt-2 leading-snug">{o.action}</p>
                          <div className="mt-2 grid sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-ink-soft">
                            <p><span className="text-ink-faint">Responsible role:</span> {o.actor}</p>
                            <p><span className="text-ink-faint">Trigger:</span> {o.trigger ?? "—"}</p>
                            <p><span className="text-ink-faint">Periodicity:</span> {o.frequency}</p>
                            <p><span className="text-ink-faint">Deadline:</span> {o.deadline}</p>
                          </div>
                          <div className="mt-2">
                            <span className="text-[10px] text-ink-faint">Evidence required:</span>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {o.evidence.map((e) => (
                                <span key={e} className="text-[10px] text-blue bg-blue/8 rounded-full px-2 py-0.5">{e}</span>
                              ))}
                            </div>
                          </div>
                          {o.test && <p className="mt-2 text-[11px] text-ink-soft"><span className="text-ink-faint">Verification test:</span> {o.test}</p>}
                          {o.sourceSpan && (
                            <div className="mt-2 rounded-lg bg-surface border border-line p-2 text-[11px] leading-relaxed">
                              <span className="mr-1 rounded bg-sky/20 px-1 text-[9px] font-bold uppercase text-navy align-middle">source anchor</span>
                              <span className="italic text-ink-soft">&ldquo;{o.sourceSpan}&rdquo;</span>
                              {o.sourceUrl && <a href={o.sourceUrl} target="_blank" rel="noreferrer" className="ml-1 font-semibold text-blue whitespace-nowrap">view on sebi.gov.in ↗</a>}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </>
                  ) : (
                    rules.map((r, i) => (
                        <motion.div key={r.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-line bg-bg p-4">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="font-mono-code text-[11px] font-bold text-blue">{r.id}</span>
                            <span className="font-mono-code text-[11px] text-navy">{r.name}</span>
                            <span className="ml-auto text-[10px] text-ink-faint">{r.trigger}</span>
                          </div>
                          <pre className="rule-code">{r.code}</pre>
                          <p className="mt-2 text-[10px] text-ink-faint">compiles obligation <span className="font-mono-code text-blue">{r.obligationId}</span> · deterministic · versioned</p>
                        </motion.div>
                      ))
                  )}

                  {/* review: ask + sign-off */}
                  {phase === "review" && (
                    <div className="rounded-2xl border border-warn/40 bg-warn/[0.04] p-4 space-y-3">
                      <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-warn flex items-center gap-1.5">
                        <PenLine className="w-3.5 h-3.5" /> Officer review — human in the loop
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && ask()}
                          placeholder="Ask the Interpretation Agent… e.g. does the ₹10,000 cap need per-client consent?"
                          className="flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-sky transition-colors"
                        />
                        <button onClick={ask} disabled={asking || !question.trim()} className="p-2.5 rounded-xl bg-blue text-white hover:bg-navy transition-colors disabled:opacity-50" aria-label="Ask">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                      {asking && (
                        <div className="flex items-center gap-2 text-xs text-ink-faint px-1">
                          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-sky inline-block" />
                          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-sky inline-block" />
                          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-sky inline-block" />
                          Interpretation Agent reading the clauses…
                        </div>
                      )}
                      {answer && (
                        <div className="rounded-xl bg-surface border border-line p-3 text-xs text-ink-soft leading-relaxed">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-navy">Interpretation Agent ({lang.toUpperCase()}): </span>
                            <button
                              onClick={speak}
                              disabled={speaking}
                              className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2.5 py-1 transition-colors ${
                                speaking ? "bg-sky/15 text-sky animate-pulse" : "bg-blue/8 text-blue hover:bg-blue hover:text-white"
                              }`}
                              aria-label="Listen"
                            >
                              <Volume2 className="w-3 h-3" /> {speaking ? "Speaking…" : "Listen"}
                            </button>
                          </div>
                          <p className="mt-1">{answer}</p>
                        </div>
                      )}
                      <button
                        onClick={signOff}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-ok text-white font-semibold py-3.5 hover:brightness-110 transition-all card-elevate"
                      >
                        <CheckCheck className="w-5 h-5" /> Approve & activate rulebook v1.0
                      </button>
                      <p className="text-[10px] text-ink-faint text-center leading-relaxed">The agent prepares; the Compliance Officer attests. Every assertion traces to a clause; every override is logged with a reason. <b className="text-ink-soft">Nothing is auto-filed to an exchange or SEBI</b> — sign-off is mandatory and written to the immutable trail.</p>
                    </div>
                  )}

                  {/* active: compliance engine */}
                  {phase === "active" && (
                    <>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { Icon: ListChecks, n: stats.total, l: "Obligations", tint: "text-blue" },
                          { Icon: ShieldCheck, n: stats.ok, l: "Compliant", tint: "text-ok" },
                          { Icon: AlertTriangle, n: stats.gaps, l: "Gaps", tint: "text-warn" },
                          { Icon: Clock4, n: stats.pending, l: "In progress", tint: "text-sky" },
                        ].map((s) => (
                          <div key={s.l} className="rounded-xl border border-line bg-bg px-3 py-2.5 text-center">
                            <s.Icon className={`w-4 h-4 ${s.tint} mx-auto mb-1`} />
                            <p className="font-display text-xl font-semibold text-navy">{s.n}</p>
                            <p className="text-[9px] text-ink-faint uppercase tracking-wide">{s.l}</p>
                          </div>
                        ))}
                      </div>

                      <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-ink-faint pt-1">Compliance engine · evidence auto-binding</p>
                      {circular.engine.map((row, i) => {
                        const o = obligationById(row.obligationId);
                        return (
                          <motion.div
                            key={row.obligationId}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`rounded-2xl border p-4 ${row.status === "gap" ? "border-warn/50 bg-warn/[0.04]" : "border-line bg-bg"}`}
                          >
                            <div className="flex items-center gap-2">
                              {row.status === "compliant" ? (
                                <ShieldCheck className="w-4 h-4 text-ok shrink-0" />
                              ) : row.status === "gap" ? (
                                <AlertTriangle className="w-4 h-4 text-warn shrink-0" />
                              ) : (
                                <Clock4 className="w-4 h-4 text-sky shrink-0" />
                              )}
                              <span className="font-mono-code text-[11px] font-bold text-blue">{row.obligationId}</span>
                              <span className="text-sm font-medium text-navy truncate">{o?.action}</span>
                              <span
                                className={`ml-auto shrink-0 text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${
                                  row.status === "compliant" ? "text-ok bg-ok/10" : row.status === "gap" ? "text-warn bg-warn/10" : "text-sky bg-sky/10"
                                }`}
                              >
                                {row.status}
                              </span>
                            </div>
                            <p className="text-xs text-ink-soft mt-1.5 ml-6">{row.note}</p>
                            {row.boundEvidence && (
                              <p className="text-[11px] text-ok mt-1 ml-6 flex items-center gap-1.5">
                                <Link2 className="w-3 h-3" /> {row.boundEvidence}
                              </p>
                            )}
                            {row.task && (
                              <p className="text-[11px] font-medium text-warn mt-1.5 ml-6 flex items-start gap-1.5">
                                <ListChecks className="w-3.5 h-3.5 shrink-0 mt-0.5" /> Remediation: {row.task}
                              </p>
                            )}
                          </motion.div>
                        );
                      })}

                      {/* beat 6 — a new circular lands: live diff */}
                      {circular.amendment && (
                        <div className="mt-1 rounded-2xl border border-blue/30 bg-blue/[0.04] p-4">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-blue">Dynamic translation · a new circular lands</p>
                            {!amendOpen && (
                              <button
                                onClick={() => { setAmendOpen(true); appendLedger(`Amendment ingested: ${circular.amendment!.newCircularRef} — impact diff computed`, "Watcher Agent"); }}
                                className="text-[11px] font-bold rounded-full px-3 py-1.5 bg-blue text-white hover:bg-navy transition-colors"
                              >
                                ▶ Drop the amendment
                              </button>
                            )}
                          </div>
                          {amendOpen && (
                            <div className="mt-3 space-y-3">
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-soft">
                                <span className="font-semibold text-navy">{circular.amendment.headline}</span>
                                <a href={circular.amendment.newCircularUrl} target="_blank" rel="noreferrer" className="font-semibold text-blue">{circular.amendment.newCircularRef} ↗</a>
                                <span>Effective: {circular.amendment.effective}</span>
                                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-ok/10 text-ok px-3 py-1 font-bold">issuance → action: {circular.amendment.gapHours}h</span>
                              </div>
                              {circular.amendment.changed.map((c, i) => (
                                <div key={i} className="rounded-xl border border-line bg-surface p-3 text-[12px]">
                                  <div className="font-mono-code text-[11px] font-bold text-navy">{c.clause}</div>
                                  <div className="mt-2 grid md:grid-cols-2 gap-2">
                                    <div className="rounded-lg border border-alert/30 bg-alert/[0.04] p-2"><span className="text-[9px] font-bold uppercase text-alert">was</span><p className="line-through decoration-alert/50 text-ink-soft">{c.was}</p></div>
                                    <div className="rounded-lg border border-ok/40 bg-ok/[0.05] p-2"><span className="text-[9px] font-bold uppercase text-ok">now</span><p className="text-navy font-medium">{c.now}</p></div>
                                  </div>
                                  <div className="mt-2 space-y-1 text-[11px] text-ink-soft">
                                    <p className="flex items-start gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-warn shrink-0 mt-0.5" /> <span><b>Control breaks:</b> {c.breaksControl}</span></p>
                                    <p><b>SOP edit:</b> {c.sopEdit}</p>
                                    <p><b>Owner:</b> {c.owner} · <b>By:</b> {c.by}</p>
                                  </div>
                                </div>
                              ))}
                              <p className="text-[10px] text-ink-faint">This is the gap between issuance and action — which obligations changed, which controls break, who owns each, by when. Measured in hours, not weeks.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* ledger — always visible once entries exist */}
                  {ledger.length > 0 && (
                    <div className="rounded-2xl border border-gold/30 bg-gold/[0.03] p-4">
                      <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gold flex items-center gap-1.5 mb-3">
                        <Lock className="w-3.5 h-3.5" /> Immutable audit trail · hash-chained
                      </p>
                      <div className="space-y-1.5">
                        {ledger.map((e) => (
                          <motion.div key={e.seq} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-[11px]">
                            <span className="font-mono-code text-ink-faint shrink-0">#{e.seq}</span>
                            <span className="text-ink-soft truncate">{e.action}</span>
                            <span className="text-ink-faint shrink-0 hidden sm:block">· {e.actor}</span>
                            <span className="hash-chip ml-auto shrink-0">{e.hash}</span>
                          </motion.div>
                        ))}
                      </div>
                      <p className="text-[9px] text-ink-faint mt-2.5">each entry chains the previous hash — tampering breaks the chain · demo ledger</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      <p className="text-center text-[11px] text-ink-faint pb-6">
        NIYAMA concept demo · SEBI TechSprint 2026 · all circulars &amp; firm data synthetic · Team Kellton, accelerated on KAI
      </p>
    </main>
  );
}
