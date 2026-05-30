import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code.toUpperCase();

    // 查 Room
    const { data: room, error: rErr } = await supabase
      .from("Room")
      .select("*, decision:Decision(*, options:Option(*))")
      .eq("shareCode", code)
      .single();

    if (rErr || !room) {
      return NextResponse.json({ error: "房间不存在" }, { status: 404 });
    }

    const decision = room.decision as Record<string, unknown>;
    const options = (decision.options as Array<Record<string, unknown>>) || [];

    // 查每个选项的票数
    const optionIds = options.map((o) => o.id as string);
    const { data: votes } = await supabase
      .from("Vote")
      .select("optionId")
      .in("optionId", optionIds);

    const voteCounts: Record<string, number> = {};
    (votes || []).forEach((v: { optionId: string }) => {
      voteCounts[v.optionId] = (voteCounts[v.optionId] || 0) + 1;
    });

    const now = new Date();
    const deadline = room.deadline ? new Date(room.deadline as string) : null;
    const isExpired = deadline ? now > deadline : false;
    const isClosed = !!room.closedAt;

    return NextResponse.json({
      shareCode: room.shareCode,
      isAnonymous: room.isAnonymous,
      deadline: room.deadline,
      closedAt: room.closedAt,
      isExpired,
      isClosed,
      decision: {
        id: decision.id,
        title: decision.title,
        status: decision.status,
        options: options.map((opt) => ({
          id: opt.id,
          name: opt.name,
          description: opt.description,
          voteCount: voteCounts[opt.id as string] || 0,
          voteCountDisplay: opt.voteCount || 0,
        })),
      },
    });
  } catch {
    return NextResponse.json({ error: "获取房间失败" }, { status: 500 });
  }
}
