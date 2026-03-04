import { NextRequest, NextResponse } from "next/server";

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

type LineMessage = {
  type: string;
  text?: string;
  quickReply?: {
    items: {
      type: "action";
      action: { type: string; label: string; data?: string; text?: string };
    }[];
  };
  [key: string]: unknown;
};

/**
 * LINE プッシュメッセージ送信 API
 * - message (string) を渡すとテキストメッセージを送信
 * - messages (LineMessage[]) を渡すと任意のメッセージオブジェクトを送信
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
    const { userId, message, messages } = body as {
      userId: string;
      message?: string;
      messages?: LineMessage[];
    };

    if (!userId) {
      return NextResponse.json(
        { error: "userId が必要です" },
        { status: 400 }
      );
    }

    let lineMessages: LineMessage[];
    if (messages && Array.isArray(messages) && messages.length > 0) {
      lineMessages = messages;
    } else if (message) {
      lineMessages = [{ type: "text", text: message }];
    } else {
      return NextResponse.json(
        { error: "message または messages が必要です" },
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
        messages: lineMessages,
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
