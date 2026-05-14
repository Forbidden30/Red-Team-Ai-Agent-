import { NextResponse } from "next/server";
import { readFinding } from "@/lib/engagements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { name: string; file: string } },
) {
  try {
    const content = await readFinding(params.name, params.file);
    if (content === null) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ content });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
