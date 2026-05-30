import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/admin";
import { generateShareCode } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, options: optionNames, isAnonymous, deadlineHours } = body;

    if (!title || !optionNames || !Array.isArray(optionNames) || optionNames.length < 2) {
      return NextResponse.json({ error: "至少需要 2 个选项" }, { status: 400 });
    }

    // 生成唯一分享码
    let shareCode = generateShareCode();
    for (let i = 0; i < 5; i++) {
      const { data } = await getSupabase().from("Room").select("id").eq("shareCode", shareCode).maybeSingle();
      if (!data) break;
      shareCode = generateShareCode();
    }

    const hours = Math.min(Math.max(deadlineHours || 24, 1), 168);
    const deadline = new Date(Date.now() + hours * 3600000).toISOString();
    const decisionId = crypto.randomUUID();

    // 创建 Decision
    const { error: dErr } = await getSupabase().from("Decision").insert({
      id: decisionId, title, mode: "MULTI", status: "PENDING",
    });
    if (dErr) throw new Error("决策创建失败: " + dErr.message);

    // 创建 Options
    const optionRows = (optionNames as string[]).map((name, i) => ({
      id: crypto.randomUUID(),
      decisionId,
      name,
      description: "",
      sortOrder: i,
      voteCount: 0,
    }));
    const { error: oErr } = await getSupabase().from("Option").insert(optionRows);
    if (oErr) throw new Error("选项创建失败: " + oErr.message);

    // 创建 Room
    const { error: rErr } = await getSupabase().from("Room").insert({
      id: crypto.randomUUID(),
      shareCode,
      decisionId,
      isAnonymous: !!isAnonymous,
      deadline,
    });
    if (rErr) throw new Error("房间创建失败: " + rErr.message);

    return NextResponse.json({
      shareCode,
      shareUrl: `${request.headers.get("origin") || ""}/room/${shareCode}`,
      deadline,
      decisionId,
      options: optionRows,
    }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "创建失败";
    console.error("[Rooms POST]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
