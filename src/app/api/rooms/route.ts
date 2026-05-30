import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateShareCode } from "@/lib/utils";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, options: optionNames, isAnonymous, deadlineHours } = body;
    if (!title || !optionNames || !Array.isArray(optionNames) || optionNames.length < 2) {
      return NextResponse.json({ error: "至少需要 2 个选项" }, { status: 400 });
    }

    const supabase = getSupabase();
    let shareCode = generateShareCode();
    for (let i = 0; i < 5; i++) {
      const { data } = await supabase.from("Room").select("id").eq("shareCode", shareCode).maybeSingle();
      if (!data) break;
      shareCode = generateShareCode();
    }

    const hours = Math.min(Math.max(deadlineHours || 24, 1), 168);
    const deadline = new Date(Date.now() + hours * 3600000).toISOString();
    const decisionId = crypto.randomUUID();

    const { error: dErr } = await supabase.from("Decision").insert({ id: decisionId, title, mode: "MULTI", status: "PENDING" });
    if (dErr) throw new Error("决策创建失败: " + dErr.message);

    const optionRows = (optionNames as string[]).map((name, i) => ({ id: crypto.randomUUID(), decisionId, name, description: "", sortOrder: i, voteCount: 0 }));
    const { error: oErr } = await supabase.from("Option").insert(optionRows);
    if (oErr) throw new Error("选项创建失败: " + oErr.message);

    const { error: rErr } = await supabase.from("Room").insert({ id: crypto.randomUUID(), shareCode, decisionId, isAnonymous: !!isAnonymous, deadline });
    if (rErr) throw new Error("房间创建失败: " + rErr.message);

    return NextResponse.json({ shareCode, shareUrl: `${request.headers.get("origin") || ""}/room/${shareCode}`, deadline, decisionId, options: optionRows }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "创建失败";
    console.error("[Rooms POST]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
