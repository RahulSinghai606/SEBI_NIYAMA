import { NextRequest, NextResponse } from "next/server";
import { ops, setKill } from "@/lib/ops";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(ops().killSwitch);
}

export async function POST(req: NextRequest) {
  const { engaged, reason } = await req.json();
  setKill(Boolean(engaged), "Compliance Officer · ops console", reason || (engaged ? "manual emergency stop" : "post-incident review complete"));
  return NextResponse.json(ops().killSwitch);
}
