import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!url || !key) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }
  if (!lineToken) {
    return NextResponse.json(
      { error: "LINE_CHANNEL_ACCESS_TOKEN not configured" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, key);

  const { data: schedule, error: fetchError } = await supabase
    .schema("terastar_line")
    .from("follow_up_schedules")
    .select(
      "id, patient_id, pattern_id, drug_names, scheduled_at, sent_at, patients!inner(name, line_user_id), follow_up_patterns(name, days_after, message_template, reply_options, free_text_prompt)"
    )
    .eq("id", id)
    .single();

  if (fetchError || !schedule) {
    return NextResponse.json(
      { error: "Schedule not found" },
      { status: 404 }
    );
  }

  if (schedule.sent_at) {
    return NextResponse.json(
      { error: "Already sent" },
      { status: 400 }
    );
  }

  const patientRaw = schedule.patients;
  const patient = Array.isArray(patientRaw) ? patientRaw[0] : patientRaw;
  const patternRaw = schedule.follow_up_patterns;
  const pattern = Array.isArray(patternRaw) ? patternRaw[0] : patternRaw;

  if (!patient?.line_user_id) {
    return NextResponse.json(
      { error: "Patient has no LINE account linked" },
      { status: 400 }
    );
  }

  let text =
    (pattern as { message_template?: string })?.message_template ??
    "{患者名}様、体調はいかがですか？";
  text = text
    .replace(/{患者名}/g, (patient as { name?: string }).name ?? "患者")
    .replace(
      /{薬名}/g,
      Array.isArray(schedule.drug_names)
        ? schedule.drug_names.join("、")
        : ""
    )
    .replace(
      /{日数}/g,
      String((pattern as { days_after?: number })?.days_after ?? 0)
    );

  const replyOptions: string[] = Array.isArray(
    (pattern as { reply_options?: string[] })?.reply_options
  )
    ? (pattern as { reply_options: string[] }).reply_options
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
          data: `followup_reply:${schedule.id}:${opt}`,
        },
      })),
    };
  }

  const messages: LineMessage[] = [lineMessage];
  const freeTextPrompt = (pattern as { free_text_prompt?: string })?.free_text_prompt;
  if (freeTextPrompt) {
    messages.push({ type: "text", text: freeTextPrompt });
  }

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lineToken}`,
    },
    body: JSON.stringify({
      to: patient.line_user_id,
      messages,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error("[follow-up send]", res.status, errBody);
    return NextResponse.json(
      { error: `LINE API error: ${res.status}` },
      { status: 502 }
    );
  }

  await supabase
    .schema("terastar_line")
    .from("follow_up_schedules")
    .update({ sent_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ ok: true });
}
