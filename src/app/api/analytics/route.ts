import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, mode, source, metadata } = body;
    if (!event) return NextResponse.json({ error: "event required" }, { status: 400 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    await supabase.from("Analytics").insert({
      id: crypto.randomUUID(),
      event,
      mode: mode || null,
      source: source || null,
      metadata: metadata || null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 }); // 静默失败
  }
}
