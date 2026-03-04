import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * フォローアップ送信 Cron
 * Vercel Cron で毎日9時などに呼び出す
 * 環境変数 CRON_SECRET で認証（Vercel Cron は Authorization: Bearer を付与）
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, key);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const { data: schedules } = await supabase
    .schema("terastar_line")
    .from("follow_up_schedules")
    .select(
      "id, patient_id, pattern_id, drug_names, scheduled_at, patients!inner(name, line_user_id), follow_up_patterns(name, days_after, message_template, reply_options)"
    )
    .is("sent_at", null)
    .gte("scheduled_at", todayStart.toISOString())
    .lt("scheduled_at", todayEnd.toISOString());

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  let sent = 0;
  for (const s of schedules ?? []) {
    const patientRaw = s.patients;
    const patient = Array.isArray(patientRaw) ? patientRaw[0] : patientRaw;
    const patternRaw = s.follow_up_patterns;
    const pattern = Array.isArray(patternRaw) ? patternRaw[0] : patternRaw;

    if (!patient?.line_user_id) continue;

    let text = pattern?.message_template ?? "{患者名}様、体調はいかがですか？";
    text = text
      .replace(/{患者名}/g, patient.name ?? "患者")
      .replace(/{薬名}/g, Array.isArray(s.drug_names) ? s.drug_names.join("、") : "")
      .replace(/{日数}/g, String(pattern?.days_after ?? 0));

    const replyOptions: string[] = Array.isArray(pattern?.reply_options)
      ? pattern.reply_options
      : [];

    type LineMessage = {
      type: string;
      text: string;
      quickReply?: {
        items: {
          type: "action";
          action: { type: string; label: string; data: string };
        }[];
      };
    };

    const lineMessage: LineMessage = { type: "text", text };

    if (replyOptions.length > 0) {
      lineMessage.quickReply = {
        items: replyOptions.slice(0, 13).map((opt) => ({
          type: "action" as const,
          action: {
            type: "postback",
            label: opt.slice(0, 20),
            data: `followup_reply:${s.id}:${opt}`,
          },
        })),
      };
    }

    const res = await fetch(`${baseUrl}/api/line/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: patient.line_user_id,
        messages: [lineMessage],
      }),
    });

    if (res.ok) {
      await supabase
        .schema("terastar_line")
        .from("follow_up_schedules")
        .update({ sent_at: new Date().toISOString() })
        .eq("id", s.id);
      sent++;
    }
  }

  return NextResponse.json({ ok: true, sent });
}
