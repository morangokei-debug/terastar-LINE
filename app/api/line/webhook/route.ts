import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

/**
 * LINE Webhook 署名検証
 */
function verifySignature(body: string, signature: string | null): boolean {
  if (!LINE_CHANNEL_SECRET || !signature) return false;
  const hash = crypto
    .createHmac("sha256", LINE_CHANNEL_SECRET)
    .update(body)
    .digest("base64");
  return hash === signature;
}

/**
 * Supabase サービスロール（Webhook は認証なしで呼ばれるため）
 */
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * LINE Webhook エンドポイント
 * - 友だち追加、メッセージ受信などのイベントを受信
 * - DB保存・患者紐付け（line_user_id で既存患者を検索）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-line-signature");

    if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const parsed = body ? JSON.parse(body) : {};
    const events = parsed.events;
    if (!events || !Array.isArray(events)) {
      return NextResponse.json({ ok: true });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      console.warn("[LINE Webhook] Supabase not configured, skipping DB save");
      return NextResponse.json({ ok: true });
    }

    const { data: tenant } = await supabase
      .schema("terastar_line")
      .from("tenants")
      .select("id")
      .limit(1)
      .single();

    if (!tenant) {
      return NextResponse.json({ ok: true });
    }

    for (const event of events) {
      const lineUserId = event.source?.userId;
      if (!lineUserId) continue;

      if (event.type === "follow") {
        const { error: pendingErr } = await supabase
          .schema("terastar_line")
          .from("line_pending")
          .upsert(
            { tenant_id: tenant.id, line_user_id: lineUserId },
            { onConflict: "tenant_id,line_user_id" }
          );
        if (pendingErr) {
          console.warn("[LINE] line_pending upsert failed:", pendingErr.message);
        }
      } else if (event.type === "message") {
        const msg = event.message;
        if (msg?.type !== "text") continue;

        const { data: patient } = await supabase
          .schema("terastar_line")
          .from("patients")
          .select("id")
          .eq("line_user_id", lineUserId)
          .eq("tenant_id", tenant.id)
          .single();

        if (patient) {
          await supabase.schema("terastar_line").from("chat_messages").insert({
            tenant_id: tenant.id,
            patient_id: patient.id,
            sender: "patient",
            content: msg.text,
            line_message_id: msg.id,
          });
        }
      } else if (event.type === "postback") {
        const data = event.postback?.data ?? "";
        const { data: patient } = await supabase
          .schema("terastar_line")
          .from("patients")
          .select("id")
          .eq("line_user_id", lineUserId)
          .eq("tenant_id", tenant.id)
          .single();

        if (patient) {
          await supabase.schema("terastar_line").from("follow_up_replies").insert({
            tenant_id: tenant.id,
            patient_id: patient.id,
            reply_type: "postback",
            reply_text: data,
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[LINE Webhook] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
