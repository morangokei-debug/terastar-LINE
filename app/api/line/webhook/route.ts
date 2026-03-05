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
  const trimmed = typeof env === "string" ? env.trim() : "";
  return trimmed.length > 0 ? trimmed : DEFAULT_WELCOME_MESSAGE;
}

/**
 * LINE リプライメッセージ送信（Webhook イベントへの応答・推奨）
 * follow イベントでは reply の方が確実に届く
 */
async function sendReplyMessage(
  replyToken: string,
  text: string
): Promise<boolean> {
  if (!LINE_CHANNEL_ACCESS_TOKEN || !replyToken) return false;
  try {
    const res = await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        replyToken,
        messages: [{ type: "text", text }],
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.warn("[LINE Webhook] sendReplyMessage failed:", res.status, errText);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("[LINE Webhook] sendReplyMessage failed:", e);
    return false;
  }
}

/**
 * LINE プッシュメッセージ送信（postback 等で使用）
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
    if (!res.ok) {
      const errText = await res.text();
      console.warn("[LINE Webhook] sendPushMessage failed:", res.status, errText);
      return false;
    }
    return true;
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

function getBaseUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return siteUrl.replace(/\/$/, "");
  const prodUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prodUrl) return `https://${prodUrl}`;
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;
  return "https://terastar-line.vercel.app";
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
  console.log("[LINE Webhook] === POST received ===");
  try {
    const body = await request.text();
    const signature = request.headers.get("x-line-signature");
    console.log("[LINE Webhook] body length:", body.length, "signature:", signature ? "present" : "missing");

    if (!verifySignature(body, signature)) {
      console.error("[LINE Webhook] SIGNATURE VERIFICATION FAILED");
      console.error("[LINE Webhook] LINE_CHANNEL_SECRET set:", !!LINE_CHANNEL_SECRET);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    console.log("[LINE Webhook] signature OK");

    const parsed = body ? JSON.parse(body) : {};
    const events = parsed.events;
    if (!events || !Array.isArray(events)) {
      console.log("[LINE Webhook] no events (verification ping)");
      return NextResponse.json({ ok: true });
    }
    console.log("[LINE Webhook] events count:", events.length, "types:", events.map((e: { type: string }) => e.type));

    const supabase = getServiceClient();
    if (!supabase) {
      console.error("[LINE Webhook] Supabase client could not be created. URL:", !!process.env.NEXT_PUBLIC_SUPABASE_URL, "KEY:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
      return NextResponse.json({ ok: true });
    }
    console.log("[LINE Webhook] Supabase client created");

    const { data: tenant, error: tenantErr } = await supabase
      .schema("terastar_line")
      .from("tenants")
      .select("id")
      .limit(1)
      .single();

    console.log("[LINE Webhook] tenant query:", tenant ? `id=${tenant.id}` : "null", "error:", tenantErr?.message ?? "none");

    let activeTenant = tenant;
    if (!activeTenant) {
      const { data: inserted, error: insertErr } = await supabase
        .schema("terastar_line")
        .from("tenants")
        .insert({ name: "テラスターファーマシー" })
        .select("id")
        .single();
      console.log("[LINE Webhook] tenant insert:", inserted ? `id=${inserted.id}` : "null", "error:", insertErr?.message ?? "none");
      if (insertErr || !inserted) {
        console.error("[LINE Webhook] CANNOT GET OR CREATE TENANT - ABORTING");
        return NextResponse.json({ ok: true });
      }
      activeTenant = inserted;
    }

    for (const event of events) {
      const lineUserId = event.source?.userId;
      if (!lineUserId) {
        console.log("[LINE Webhook] event has no userId, skipping:", event.type);
        continue;
      }

      if (event.type === "follow") {
        console.log("[LINE Webhook] === FOLLOW event === userId:", lineUserId);

        // 1. 挨拶メッセージを reply で送信
        const replyToken = event.replyToken;
        const welcomeMsg = getWelcomeMessage();
        console.log("[LINE Webhook] welcomeMsg length:", welcomeMsg.length, "replyToken:", replyToken ? "present" : "missing");

        if (replyToken) {
          const sent = await sendReplyMessage(replyToken, welcomeMsg);
          console.log("[LINE Webhook] reply result:", sent);
          if (!sent) {
            const pushSent = await sendPushMessage(lineUserId, welcomeMsg);
            console.log("[LINE Webhook] push fallback result:", pushSent);
          }
        } else {
          const pushSent = await sendPushMessage(lineUserId, welcomeMsg);
          console.log("[LINE Webhook] push (no replyToken) result:", pushSent);
        }

        // 2. リッチメニューをユーザーに即時設定
        const { data: tenantFull, error: tenantFullErr } = await supabase
          .schema("terastar_line")
          .from("tenants")
          .select("rich_menu_id")
          .eq("id", activeTenant.id)
          .single();
        console.log("[LINE Webhook] rich_menu_id:", tenantFull?.rich_menu_id ?? "null", "error:", tenantFullErr?.message ?? "none");

        if (tenantFull?.rich_menu_id && LINE_CHANNEL_ACCESS_TOKEN) {
          try {
            const rmRes = await fetch(
              `https://api.line.me/v2/bot/user/${lineUserId}/richmenu/${tenantFull.rich_menu_id}`,
              {
                method: "POST",
                headers: { Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` },
              }
            );
            console.log("[LINE Webhook] rich menu set result:", rmRes.status);
            if (!rmRes.ok) {
              const errText = await rmRes.text();
              console.warn("[LINE] rich menu set for user failed:", rmRes.status, errText);
            }
          } catch (e) {
            console.warn("[LINE] rich menu set for user failed:", e);
          }
        } else if (!tenantFull?.rich_menu_id) {
          console.warn("[LINE] rich_menu_id not set on tenant. Run リッチメニューを設定する in dashboard.");
        }

        // 3. 患者として登録
        const { data: existing, error: existingErr } = await supabase
          .schema("terastar_line")
          .from("patients")
          .select("id")
          .eq("tenant_id", activeTenant.id)
          .eq("line_user_id", lineUserId)
          .single();
        console.log("[LINE Webhook] existing patient:", existing?.id ?? "null", "error:", existingErr?.message ?? "none");

        if (!existing) {
          const now = new Date().toISOString();
          const { data: newPatient, error: insertErr } = await supabase
            .schema("terastar_line")
            .from("patients")
            .insert({
              tenant_id: activeTenant.id,
              name: `LINE友だち追加（${now.slice(0, 10)}）`,
              line_user_id: lineUserId,
              linked_at: now,
            })
            .select("id")
            .single();
          console.log("[LINE Webhook] patient insert:", newPatient?.id ?? "null", "error:", insertErr?.message ?? "none");

          if (insertErr) {
            console.warn("[LINE] patients insert failed:", insertErr.message);
            await supabase
              .schema("terastar_line")
              .from("line_pending")
              .upsert(
                { tenant_id: activeTenant.id, line_user_id: lineUserId },
                { onConflict: "tenant_id,line_user_id" }
              );
          } else {
            await supabase
              .schema("terastar_line")
              .from("line_pending")
              .delete()
              .eq("tenant_id", activeTenant.id)
              .eq("line_user_id", lineUserId);
          }
        }

        // 4. 名前登録の案内メッセージを送信
        const registerUrl = `${getBaseUrl()}/register?uid=${lineUserId}`;
        await sendPushMessage(
          lineUserId,
          `お名前の登録をお願いします。\n次回から処方箋送信時に自動入力されます。\n\n${registerUrl}`
        );
        console.log("[LINE Webhook] register URL sent:", registerUrl);

        console.log("[LINE Webhook] === FOLLOW complete ===");
      } else if (event.type === "message") {
        const msg = event.message;
        const isText = msg?.type === "text";
        const isImage = msg?.type === "image";
        if (!isText && !isImage) continue;

        const content = isText ? msg.text : "[画像]";

        // 通知先登録：「通知登録 コード」または「通知登録コード」で登録
        const notifyMatch = msg.text.trim().match(/^通知登録\s*(\S{4,8})$/);
        if (isText && notifyMatch) {
          const token = notifyMatch[1]?.toUpperCase();
          if (token) {
            const svc = getServiceClient();
            if (svc) {
              const { data: t } = await svc
                .schema("terastar_line")
                .from("tenants")
                .select("id")
                .eq("notification_register_token", token)
                .gt("notification_register_token_expires_at", new Date().toISOString())
                .limit(1)
                .single();
              if (t) {
                await svc
                  .schema("terastar_line")
                  .from("tenants")
                  .update({
                    notification_line_user_id: lineUserId,
                    notification_register_token: null,
                    notification_register_token_expires_at: null,
                  })
                  .eq("id", t.id);
                await sendReplyMessage(
                  event.replyToken ?? "",
                  "通知先として登録しました。処方箋が届くとこのアカウントに通知が届きます。"
                );
                continue;
              }
            }
          }
        }

        // 患者がいなければ作成（followが遅れた場合のフォールバック）
        let { data: patient } = await supabase
          .schema("terastar_line")
          .from("patients")
          .select("id")
          .eq("line_user_id", lineUserId)
          .eq("tenant_id", activeTenant.id)
          .single();

        if (!patient) {
          const now = new Date().toISOString();
          const { data: inserted } = await supabase
            .schema("terastar_line")
            .from("patients")
            .insert({
              tenant_id: activeTenant.id,
              name: `LINE（${now.slice(0, 10)}）`,
              line_user_id: lineUserId,
              linked_at: now,
            })
            .select("id")
            .single();
          patient = inserted;
        }

        if (patient) {
          if (isText) {
            const { data: recentSchedule } = await supabase
              .schema("terastar_line")
              .from("follow_up_schedules")
              .select("id, pattern_id")
              .eq("patient_id", patient.id)
              .not("sent_at", "is", null)
              .order("sent_at", { ascending: false })
              .limit(1)
              .single();

            if (recentSchedule) {
              const { data: existingReply } = await supabase
                .schema("terastar_line")
                .from("follow_up_replies")
                .select("id")
                .eq("schedule_id", recentSchedule.id)
                .eq("reply_type", "text")
                .limit(1)
                .single();

              if (!existingReply) {
                await supabase
                  .schema("terastar_line")
                  .from("follow_up_replies")
                  .insert({
                    tenant_id: activeTenant.id,
                    patient_id: patient.id,
                    schedule_id: recentSchedule.id,
                    reply_type: "text",
                    reply_text: msg.text,
                  });

                if (recentSchedule.pattern_id) {
                  const { data: patternData } = await supabase
                    .schema("terastar_line")
                    .from("follow_up_patterns")
                    .select("reply_thank_message")
                    .eq("id", recentSchedule.pattern_id)
                    .single();

                  if (patternData?.reply_thank_message) {
                    await sendPushMessage(lineUserId, patternData.reply_thank_message);
                  }
                }
              }
            }
          }

          await supabase.schema("terastar_line").from("chat_messages").insert({
            tenant_id: activeTenant.id,
            patient_id: patient.id,
            sender: "patient",
            content,
            line_message_id: msg.id,
          });
        }
      } else if (event.type === "postback") {
        const data = event.postback?.data ?? "";

        // 処方箋送信ボタン押下時：uid付きURLを送信
        if (data === "prescription_submit") {
          const prescriptionUrl = `${getBaseUrl()}/prescription-submit?uid=${lineUserId}`;
          await sendPushMessage(
            lineUserId,
            `こちらから処方箋を送信できます。\n\n${prescriptionUrl}`
          );
          continue;
        }

        const { data: patient } = await supabase
          .schema("terastar_line")
          .from("patients")
          .select("id")
          .eq("line_user_id", lineUserId)
          .eq("tenant_id", activeTenant.id)
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
            tenant_id: activeTenant.id,
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
            tenant_id: activeTenant.id,
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
