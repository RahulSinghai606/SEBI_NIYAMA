"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { REGISTER_SB, SECTION_TEXT, SB_PDF_URL } from "@/lib/corpus-stockbrokers";
import { enforceAnchoring, toRegisterJSON, toRegisterCSV, type ObligationRecord } from "@/lib/obligation";

const sev: Record<string, string> = { critical: "#cf4433", high: "#d97f1d", medium: "#0a58c4" };

export default function RegisterPage() {
  const records = useMemo(() => enforceAnchoring(REGISTER_SB, SECTION_TEXT), []);
  const emitted = records.filter((r) => r.status !== "abstained");
  const [open, setOpen] = useState<string | null>(emitted[0]?.id ?? null);

  const download = (kind: "json" | "csv") => {
    const body = kind === "json" ? toRegisterJSON(emitted) : toRegisterCSV(emitted);
    const blob = new Blob([body], { type: kind === "json" ? "application/json" : "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `niyama-obligation-register.${kind}`;
    a.click();
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)] px-5 py-8 md:px-10" style={{ fontFamily: "var(--font-body)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--niyama-blue)]">Machine-readable · clause-anchored</div>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>Obligation Register</h1>
            <p className="mt-1 max-w-2xl text-sm text-[var(--ink-soft)]">Not retrieved text — a structured, testable register. Each record: clause anchor · verbatim source span · owner · frequency · <b>evidence contract</b> · <b>rule-as-code (the test)</b> · full provenance to the SEBI PDF.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/" className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--niyama-navy)]">← Home</Link>
            <Link href="/demo" className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--niyama-navy)]">Demo</Link>
            <button onClick={() => download("json")} className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--niyama-navy)]">↓ JSON</button>
            <button onClick={() => download("csv")} className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--niyama-navy)]">↓ CSV</button>
            <Link href="/metrics" className="rounded-full bg-[var(--niyama-navy)] px-4 py-2 text-sm font-semibold text-white">Metrics →</Link>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-2 text-xs text-[var(--ink-soft)]">
          <b>Stock Broker</b> · SEBI Master Circular for Stock Brokers · SEBI/HO/MIRSD/MIRSD-PoD/P/CIR/2025/90 · 17 Jun 2025 · {emitted.length} obligations emitted · every one verbatim-anchored · <a className="font-semibold text-[var(--niyama-blue)]" href={SB_PDF_URL} target="_blank" rel="noreferrer">source PDF ↗</a>
        </div>

        <div className="mt-5 space-y-2">
          {emitted.map((r) => (
            <RecordRow key={r.id} r={r} open={open === r.id} onToggle={() => setOpen(open === r.id ? null : r.id)} />
          ))}
        </div>
      </div>
    </main>
  );
}

function RecordRow({ r, open, onToggle }: { r: ObligationRecord; open: boolean; onToggle: () => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
      <button onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-3 text-left">
        <span className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase text-white" style={{ background: sev[r.severity] }}>{r.severity}</span>
        <span className="font-mono text-xs font-semibold text-[var(--niyama-navy)]">{r.clauseAnchor}</span>
        <span className="flex-1 truncate text-sm">{r.action}</span>
        <span className="hidden shrink-0 text-[11px] text-[var(--ink-faint)] md:inline">{r.ownerRole}</span>
        <span className="shrink-0 text-[var(--ink-faint)]">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="border-t border-[var(--line)] bg-[var(--bg)] px-4 py-4">
          {/* provenance / source card — where it's pulled from */}
          <div className="rounded-xl border border-[var(--niyama-blue)]/25 bg-white p-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--niyama-blue)]">Source · pulled from</div>
            <div className="mt-1 text-xs text-[var(--ink-soft)]">
              {r.provenance.source.document} · <span className="font-mono">{r.provenance.source.ref}</span> · {r.provenance.source.page} · {r.provenance.source.publishedDate}
              <span className="text-[var(--ink-faint)]"> · retrieved {r.provenance.source.retrievedAt}</span>
            </div>
            <div className="mt-2 rounded-lg bg-[var(--bg-soft)] p-2 text-[13px] leading-relaxed">
              <span className="mr-1 rounded bg-[var(--niyama-sky)]/20 px-1 text-[10px] font-bold uppercase text-[var(--niyama-navy)]">verbatim anchor</span>
              &ldquo;{r.sourceSpan}&rdquo;
            </div>
            <a href={r.provenance.source.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-[var(--niyama-blue)]">View on sebi.gov.in ↗</a>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Field k="Owner / role" v={r.ownerRole} />
            <Field k="Trigger" v={r.trigger} />
            <Field k="Frequency" v={r.frequency} />
            <Field k="Deadline" v={r.deadline} />
          </div>
          {r.conditions.length > 0 && <Field k="Conditions" v={r.conditions.join(" · ")} className="mt-3" />}

          {/* evidence contract */}
          <div className="mt-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--ink-faint)]">Evidence contract</div>
            <div className="mt-1 overflow-hidden rounded-lg border border-[var(--line)]">
              {r.evidenceContract.map((e, i) => (
                <div key={i} className="grid grid-cols-[1.3fr_1.3fr_1fr_0.9fr] gap-2 border-b border-[var(--line)] px-2 py-1.5 text-[11px] last:border-0">
                  <span className="font-semibold">{e.artifact}</span>
                  <span className="text-[var(--ink-soft)]">{e.sourceSystem}</span>
                  <span className="text-[var(--ink-soft)]">{e.format}</span>
                  <span className="text-[var(--ink-faint)]">{e.retention}</span>
                </div>
              ))}
            </div>
          </div>

          {/* rule-as-code (the test) */}
          <div className="mt-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--ink-faint)]">Rule-as-Code · the test <span className="font-mono normal-case text-[var(--niyama-blue)]">{r.rule.id}</span></div>
            <pre className="mt-1 overflow-x-auto rounded-lg bg-[var(--niyama-navy)] p-3 text-[11px] leading-relaxed text-[#cfe3ff]"><code>{r.rule.code}</code></pre>
            <div className="mt-1 text-[11px] text-[var(--ink-soft)]"><b>Assertion:</b> {r.rule.test}</div>
          </div>

          {r.supersedes && r.supersedes.length > 0 && (
            <div className="mt-3 rounded-lg border border-[var(--seal-gold)]/40 bg-[var(--seal-gold)]/5 px-3 py-2 text-[11px] text-[var(--ink-soft)]">
              <b>Supersedes:</b> {r.supersedes.join("; ")}
            </div>
          )}
          <div className="mt-2 text-[10px] text-[var(--ink-faint)]">confidence {r.confidence.toFixed(2)} · status {r.status} · id {r.id}</div>
        </div>
      )}
    </div>
  );
}

function Field({ k, v, className = "" }: { k: string; v: string; className?: string }) {
  return (
    <div className={className}>
      <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--ink-faint)]">{k}</div>
      <div className="text-sm">{v}</div>
    </div>
  );
}
