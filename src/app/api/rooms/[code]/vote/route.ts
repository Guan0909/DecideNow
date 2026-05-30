import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}

export async function POST(request: Request, { params }: { params: { code: string } }) {
  try {
    const body = await request.json();
    const { optionId, reason } = body;
    if (!optionId) return NextResponse.json({ error: "请选择一个选项" }, { status: 400 });

    const supabase = getSupabase();
    const code = params.code.toUpperCase();
    const { data: room, error: rErr } = await supabase.from("Room").select("*, decision:Decision(*, options:Option(*))").eq("shareCode", code).single();
    if (rErr || !room) return NextResponse.json({ error: "房间不存在" }, { status: 404 });
    if (room.closedAt) return NextResponse.json({ error: "投票已截止" }, { status: 410 });
    if (room.deadline && new Date() > new Date(room.deadline as string)) return NextResponse.json({ error: "投票已过期" }, { status: 410 });

    const decision = room.decision as Record<string, unknown>;
    const options = (decision.options as Array<{ id: string }>) || [];
    if (!options.find((o) => o.id === optionId)) return NextResponse.json({ error: "无效的选项" }, { status: 400 });

    const { data: vote, error: vErr } = await supabase.from("Vote").insert({ id: crypto.randomUUID(), optionId, reason: reason || null, isAnonymous: !!room.isAnonymous }).select().single();
    if (vErr) throw new Error(vErr.message);

    const { data: opt } = await supabase.from("Option").select("voteCount").eq("id", optionId).single();
    await supabase.from("Option").update({ voteCount: ((opt?.voteCount as number) || 0) + 1 }).eq("id", optionId);

    return NextResponse.json({ success: true, voteId: vote.id }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "投票失败";
    console.error("[Vote POST]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
