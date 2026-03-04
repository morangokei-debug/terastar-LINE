import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

const DEFAULT_WELCOME_MESSAGE = `友だち追加ありがとうございます！✨
テラスターファーマシーです。

このLINEでは

・処方箋の事前送信
・お薬のご相談
・服用後のフォローアップ

が可能です。

処方箋は写真を撮って
このトークに送信してください。📷

お薬の準備ができ次第ご連絡いたします。`;

function getWelcomeMessage(): string {
  const env = process.env.LINE_WELCOME_MESSAGE;
  return env?.trim() || DEFAULT_WELCOME_MESSAGE;
}

/**
 * LINE プッシュメッセージ送信
 */
async function sendPushMessage(userId: string, text: string): Promise<boolean> {
  if (!LINE_CHANNEL_ACCESS_TOKEN) return false;
  try {
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [{ type: "text", text }],
      }),
    });
    return res.ok;
  } catch (e) {
    console.warn("[LINE Webhook] sendPushMessage failed:", e);
    return false;
  }
}

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
        // 既に患者として登録済みか確認
        const { data: existing } = await supabase
          .schema("terastar_line")
          .from("patients")
          .select("id")
          .eq("tenant_id", tenant.id)
          .eq("line_user_id", lineUserId)
          .single();

        if (!existing) {
          // 未登録なら患者として新規作成（患者一覧に自動表示）
          const now = new Date().toISOString();
          const { error: insertErr } = await supabase
            .schema("terastar_line")
            .from("patients")
            .insert({
              tenant_id: tenant.id,
              name: `LINE友だち追加（${now.slice(0, 10)}）`,
              line_user_id: lineUserId,
              linked_at: now,
            });
          if (insertErr) {
            console.warn("[LINE] patients insert failed:", insertErr.message);
            // フォールバック: line_pending に保存（手動紐付け用）
            await supabase
              .schema("terastar_line")
              .from("line_pending")
              .upsert(
                { tenant_id: tenant.id, line_user_id: lineUserId },
                { onConflict: "tenant_id,line_user_id" }
              );
          } else {
            // 患者登録成功時、line_pending に残っていれば削除
            await supabase
              .schema("terastar_line")
              .from("line_pending")
              .delete()
              .eq("tenant_id", tenant.id)
              .eq("line_user_id", lineUserId);
          }
        }
        await sendPushMessage(lineUserId, getWelcomeMessage());
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

        if (msg.text === "お問い合わせ") {
          await sendPushMessage(
            lineUserId,
            "お問い合わせありがとうございます。\nこのトークにメッセージをお送りいただければ、薬剤師が確認次第ご返信いたします。\n\nお気軽にご相談ください💊"
          );
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
          let scheduleId: string | null = null;
          let replyText = data;

          if (data.startsWith("followup_reply:")) {
            const parts = data.split(":");
            scheduleId = parts[1] ?? null;
            replyText = parts.slice(2).join(":");
          }

          await supabase.schema("terastar_line").from("follow_up_replies").insert({
            tenant_id: tenant.id,
            patient_id: patient.id,
            schedule_id: scheduleId,
            reply_type: "postback",
            reply_text: replyText,
          });

          if (scheduleId) {
            const { data: schedule } = await supabase
              .schema("terastar_line")
              .from("follow_up_schedules")
              .select("pattern_id")
              .eq("id", scheduleId)
              .single();

            if (schedule?.pattern_id) {
              const { data: pattern } = await supabase
                .schema("terastar_line")
                .from("follow_up_patterns")
                .select("reply_thank_message")
                .eq("id", schedule.pattern_id)
                .single();

              if (pattern?.reply_thank_message) {
                await sendPushMessage(lineUserId, pattern.reply_thank_message);
              }
            }
          }

          await supabase.schema("terastar_line").from("chat_messages").insert({
            tenant_id: tenant.id,
            patient_id: patient.id,
            sender: "patient",
            content: `【フォロー返信】${replyText}`,
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
