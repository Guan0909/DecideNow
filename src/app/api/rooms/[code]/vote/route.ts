import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const body = await request.json();
    const { optionId, reason } = body;
    if (!optionId) return NextResponse.json({ error: "请选择一个选项" }, { status: 400 });

    const code = params.code.toUpperCase();

    // 查房间
    const { data: room, error: rErr } = await supabase
      .from("Room")
      .select("*, decision:Decision(*, options:Option(*))")
      .eq("shareCode", code)
      .single();

    if (rErr || !room) return NextResponse.json({ error: "房间不存在" }, { status: 404 });
    if (room.closedAt) return NextResponse.json({ error: "投票已截止" }, { status: 410 });
    if (room.deadline && new Date() > new Date(room.deadline as string)) {
      return NextResponse.json({ error: "投票已过期" }, { status: 410 });
    }

    // 验证选项
    const decision = room.decision as Record<string, unknown>;
    const options = (decision.options as Array<{ id: string }>) || [];
    if (!options.find((o) => o.id === optionId)) {
      return NextResponse.json({ error: "无效的选项" }, { status: 400 });
    }

    // 创建投票
    const { data: vote, error: vErr } = await getSupabase().from("Vote").insert({
      id: crypto.randomUUID(),
      optionId,
      reason: reason || null,
      isAnonymous: !!room.isAnonymous,
    }).select().single();

    if (vErr) throw new Error(vErr.message);

    // 更新票数
    const { data: opt } = await getSupabase().from("Option").select("voteCount").eq("id", optionId).single();
    await getSupabase().from("Option").update({ voteCount: ((opt?.voteCount as number) || 0) + 1 }).eq("id", optionId);

    return NextResponse.json({ success: true, voteId: vote.id }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "投票失败";
    console.error("[Vote POST]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
