import { NextRequest, NextResponse } from "next/server";

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

/**
 * LINE プッシュメッセージ送信 API
 * 内部からのみ呼び出し（認証済みユーザー経由）
 */
export async function POST(request: NextRequest) {
  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "LINE_CHANNEL_ACCESS_TOKEN が設定されていません" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { userId, message } = body;

    if (!userId || !message) {
      return NextResponse.json(
        { error: "userId と message が必要です" },
        { status: 400 }
      );
    }

    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [{ type: "text", text: message }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[LINE send]", res.status, err);
      return NextResponse.json(
        { error: `LINE API error: ${res.status}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[LINE send]", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
