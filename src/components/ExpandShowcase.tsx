"use client";

// ExpandShowcase — full-screen expansion on scroll: the compliance cockpit
// starts as a small framed panel and smoothly grows to fill the viewport
// as the user scrolls (GSAP ScrollTrigger scrub).

import React, { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShieldCheck, AlertTriangle, Clock4, FileCheck2, Link2, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ROWS = [
  { id: "OB-101", label: "Quarterly running-account settlement", clause: "Para 6.1", status: "ok", note: "12,408 accounts settled · evidence bound" },
  { id: "OB-202", label: "Half-yearly VAPT on critical systems", clause: "Para 4.2", status: "gap", note: "214 days since last VAPT — remediation task open" },
  { id: "OB-303", label: "Technical glitch T+1 exchange filing", clause: "Para 5.3", status: "gap", note: "INC-7731 filing window closes 17:30 IST" },
  { id: "OB-401", label: "Daily client-level collateral reporting", clause: "Para 7.1", status: "ok", note: "118 consecutive on-time submissions" },
  { id: "OB-104", label: "Retention statement within 24h", clause: "Para 6.4", status: "run", note: "9,980 / 12,408 confirmed within SLA" },
];

export default function ExpandShowcase() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(panelRef.current, { scale: 0.62, borderRadius: 28 });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: "+=1400",
          scrub: 0.5,
          pin: stageRef.current,
          anticipatePin: 1,
        },
      });
      tl.to(".xs-caption", { opacity: 0, y: -30, duration: 0.35 }, 0.05);
      tl.to(panelRef.current, { scale: 1, borderRadius: 0, duration: 1, ease: "power2.inOut" }, 0);
      tl.fromTo(".xs-inner-reveal", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, 0.55);
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <div ref={stageRef} className="h-screen overflow-hidden sky-bg noise relative flex items-center justify-center">
        <div className="xs-caption absolute top-[10%] left-0 right-0 text-center z-20 px-6 pointer-events-none">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-sky mb-3">The compliance cockpit</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-navy">
            Keep scrolling — <span className="text-gradient">step inside</span>
          </h2>
        </div>

        {/* expanding panel */}
        <div ref={panelRef} className="relative w-screen h-screen overflow-hidden bg-navy card-elevate [will-change:transform]">
          <div className="absolute inset-0 bg-[linear-gradient(160deg,#0e2246_0%,#12305e_60%,#174a8c_100%)]" />
          <div className="relative h-full w-full p-6 sm:p-10 lg:p-14 pt-20 sm:pt-24 lg:pt-24 flex flex-col text-white">
            {/* cockpit header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-[11px] font-bold tracking-[0.28em] uppercase text-sky/90">NIYAMA · Compliance Engine</p>
                <h3 className="font-display text-2xl sm:text-3xl font-semibold mt-1">Sharma Securities Ltd · Stock Broker</h3>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 6 agents live
                </span>
                <span className="hash-chip">ledger #4,182 · chain verified</span>
              </div>
            </div>

            {/* stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-7">
              {[
                { Icon: FileCheck2, big: "247", label: "Obligations tracked", tint: "text-sky" },
                { Icon: ShieldCheck, big: "231", label: "Compliant · evidence bound", tint: "text-emerald-400" },
                { Icon: AlertTriangle, big: "9", label: "Gaps → remediation tasks", tint: "text-amber-400" },
                { Icon: Clock4, big: "7", label: "Deadlines in next 7 days", tint: "text-sky" },
              ].map((s) => (
                <div key={s.label} className="xs-inner-reveal rounded-2xl bg-white/[0.07] border border-white/10 px-5 py-4">
                  <s.Icon className={`w-5 h-5 ${s.tint} mb-2`} strokeWidth={1.8} />
                  <p className="font-display text-3xl font-semibold">{s.big}</p>
                  <p className="text-[11px] text-white/60 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* live obligation rows */}
            <div className="xs-inner-reveal mt-6 flex-1 min-h-0 rounded-2xl bg-white/[0.05] border border-white/10 p-4 sm:p-5 overflow-hidden">
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/50 mb-3">Live obligation monitor</p>
              <div className="space-y-2">
                {ROWS.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 rounded-xl bg-white/[0.05] px-4 py-2.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        r.status === "ok" ? "bg-emerald-400" : r.status === "gap" ? "bg-amber-400 animate-pulse" : "bg-sky animate-pulse"
                      }`}
                    />
                    <span className="font-mono-code text-[10px] text-sky/80 w-14 shrink-0">{r.id}</span>
                    <span className="text-sm font-medium truncate">{r.label}</span>
                    <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-white/45 shrink-0">
                      <Link2 className="w-3 h-3" /> {r.clause}
                    </span>
                    <span className="ml-auto text-[11px] text-white/55 truncate max-w-[38%] text-right hidden sm:block">{r.note}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* footer CTA inside cockpit */}
            <div className="xs-inner-reveal mt-5 flex items-center justify-between flex-wrap gap-3">
              <p className="text-[11px] text-white/50">Every row traces to its exact circular clause · every action on the immutable trail</p>
              <Link
                href="/demo"
                className="pointer-events-auto inline-flex items-center gap-2 rounded-xl bg-white text-navy text-sm font-semibold px-5 py-2.5 hover:bg-sky hover:text-white transition-colors"
              >
                Open the live Command Center <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
