import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}

export async function GET(_request: Request, { params }: { params: { code: string } }) {
  try {
    const supabase = getSupabase();
    const code = params.code.toUpperCase();
    const { data: room, error: rErr } = await supabase.from("Room").select("*, decision:Decision(*, options:Option(*))").eq("shareCode", code).single();
    if (rErr || !room) return NextResponse.json({ error: "房间不存在" }, { status: 404 });

    const decision = room.decision as Record<string, unknown>;
    const options = (decision.options as Array<Record<string, unknown>>) || [];
    const optionIds = options.map((o) => o.id as string);
    const { data: votes } = await supabase.from("Vote").select("optionId").in("optionId", optionIds);
    const voteCounts: Record<string, number> = {};
    (votes || []).forEach((v: { optionId: string }) => { voteCounts[v.optionId] = (voteCounts[v.optionId] || 0) + 1; });

    const now = new Date();
    const deadline = room.deadline ? new Date(room.deadline as string) : null;
    return NextResponse.json({
      shareCode: room.shareCode, isAnonymous: room.isAnonymous, deadline: room.deadline, closedAt: room.closedAt,
      isExpired: deadline ? now > deadline : false, isClosed: !!room.closedAt,
      decision: {
        id: decision.id, title: decision.title, status: decision.status,
        options: options.map((opt) => ({ id: opt.id, name: opt.name, description: opt.description, voteCount: voteCounts[opt.id as string] || 0, voteCountDisplay: opt.voteCount || 0 })),
      },
    });
  } catch { return NextResponse.json({ error: "获取房间失败" }, { status: 500 }); }
}
