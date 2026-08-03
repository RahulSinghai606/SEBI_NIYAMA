import { NextResponse } from "next/server";
import { ops, percentile } from "@/lib/ops";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = ops();
  return NextResponse.json({
    killSwitch: s.killSwitch,
    counters: s.counters,
    p50: percentile(50),
    p95: percentile(95),
    p99: percentile(99),
    traces: s.traces.slice(0, 6),
    events: s.events.slice(0, 30),
    uptimeSec: Math.round((Date.now() - s.startedAt) / 1000),
  });
}
