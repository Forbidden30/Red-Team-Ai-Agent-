import { NextResponse } from "next/server";
import { getEngagement, listFindings, readIntel, readNotes } from "@/lib/engagements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { name: string } },
) {
  try {
    const summary = await getEngagement(params.name);
    if (!summary) return NextResponse.json({ error: "not found" }, { status: 404 });
    const [findings, intel, notes] = await Promise.all([
      listFindings(params.name),
      readIntel(params.name),
      readNotes(params.name),
    ]);
    return NextResponse.json({ ...summary, findings, intel, notes });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
