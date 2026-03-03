import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

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
 * LINE Webhook エンドポイント
 * - 友だち追加、メッセージ受信などのイベントを受信
 * - 署名検証を行い、200 OK を返す（LINEは1秒以内の応答を期待）
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

    // イベント処理（Phase 2で実装: DB保存、患者紐付けなど）
    for (const event of events) {
      if (event.type === "follow") {
        // 友だち追加: 患者紐付け処理を後で実装
        console.log("[LINE] follow:", event.source?.userId);
      } else if (event.type === "message") {
        // メッセージ受信: チャット履歴保存を後で実装
        console.log("[LINE] message:", event.message?.type, event.source?.userId);
      } else if (event.type === "postback") {
        // ボタンタップ（選択式返信）: フォローアップ返信処理を後で実装
        console.log("[LINE] postback:", event.postback?.data, event.source?.userId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[LINE Webhook] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
