import { NextResponse } from "next/server";
import { listEngagements } from "@/lib/engagements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const items = await listEngagements();
  return NextResponse.json({ engagements: items });
}
