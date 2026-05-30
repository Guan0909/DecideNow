import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/admin";

export async function POST(
  _request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code.toUpperCase();
    const { data: room, error: rErr } = await supabase
      .from("Room").select("*").eq("shareCode", code).single();

    if (rErr || !room) return NextResponse.json({ error: "房间不存在" }, { status: 404 });
    if (room.closedAt) return NextResponse.json({ error: "投票已截止" }, { status: 400 });

    const now = new Date().toISOString();
    await supabase.from("Room").update({ closedAt: now }).eq("shareCode", code);
    await supabase.from("Decision").update({ status: "COMPLETED", completedAt: now }).eq("id", room.decisionId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
