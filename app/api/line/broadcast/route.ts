import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "LINE_CHANNEL_ACCESS_TOKEN が設定されていません" },
      { status: 500 }
    );
  }

  const authClient = await createServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { message, mode, patientIds } = body as {
      message: string;
      mode: "broadcast" | "multicast";
      patientIds?: string[];
    };

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "メッセージを入力してください" },
        { status: 400 }
      );
    }

    if (mode === "broadcast") {
      const res = await fetch(
        "https://api.line.me/v2/bot/message/broadcast",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({
            messages: [{ type: "text", text: message.trim() }],
          }),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        console.error("[LINE broadcast]", res.status, err);
        return NextResponse.json(
          { error: `LINE API error: ${res.status}` },
          { status: 502 }
        );
      }

      return NextResponse.json({ ok: true, mode: "broadcast" });
    }

    if (mode === "multicast") {
      if (!patientIds || patientIds.length === 0) {
        return NextResponse.json(
          { error: "送信先の患者を選択してください" },
          { status: 400 }
        );
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

      const { data: patients } = await supabase
        .schema("terastar_line")
        .from("patients")
        .select("line_user_id")
        .in("id", patientIds)
        .not("line_user_id", "is", null);

      const lineUserIds = (patients ?? [])
        .map((p) => p.line_user_id)
        .filter(Boolean) as string[];

      if (lineUserIds.length === 0) {
        return NextResponse.json(
          { error: "LINE紐付け済みの患者がいません" },
          { status: 400 }
        );
      }

      const chunks: string[][] = [];
      for (let i = 0; i < lineUserIds.length; i += 500) {
        chunks.push(lineUserIds.slice(i, i + 500));
      }

      let sentCount = 0;
      for (const chunk of chunks) {
        const res = await fetch(
          "https://api.line.me/v2/bot/message/multicast",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
              to: chunk,
              messages: [{ type: "text", text: message.trim() }],
            }),
          }
        );

        if (!res.ok) {
          const err = await res.text();
          console.error("[LINE multicast]", res.status, err);
          return NextResponse.json(
            {
              error: `LINE API error: ${res.status}`,
              sentSoFar: sentCount,
            },
            { status: 502 }
          );
        }
        sentCount += chunk.length;
      }

      return NextResponse.json({
        ok: true,
        mode: "multicast",
        sent: sentCount,
      });
    }

    return NextResponse.json(
      { error: "mode は broadcast または multicast を指定してください" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[LINE broadcast]", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
