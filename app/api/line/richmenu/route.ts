import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readFileSync } from "fs";
import { join } from "path";

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

function getBaseUrl(request: NextRequest): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return siteUrl.replace(/\/$/, "");
  const prodUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prodUrl) return `https://${prodUrl}`;
  const host = request.headers.get("host") || "localhost:3000";
  return host.startsWith("localhost") ? `http://${host}` : `https://${host}`;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "LINE_CHANNEL_ACCESS_TOKEN が設定されていません" },
      { status: 500 }
    );
  }

  const baseUrl = getBaseUrl(request);
  const homepageUrl = "https://try-arrows.org/";

  const richMenu = {
    size: { width: 2500, height: 843 },
    selected: true,
    name: "メインメニュー",
    chatBarText: "メニュー",
    areas: [
      {
        bounds: { x: 0, y: 0, width: 833, height: 843 },
        action: {
          type: "postback",
          label: "処方箋送信",
          data: "prescription_submit",
        },
      },
      {
        bounds: { x: 833, y: 0, width: 1667, height: 843 },
        action: {
          type: "uri",
          label: "ホームページ",
          uri: homepageUrl,
        },
      },
    ],
  };

  try {
    // 1. リッチメニュー作成
    const createRes = await fetch("https://api.line.me/v2/bot/richmenu", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(richMenu),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error("[Rich Menu] create failed:", createRes.status, errText);
      return NextResponse.json(
        { error: `リッチメニュー作成失敗: ${errText}` },
        { status: 502 }
      );
    }

    const { richMenuId } = await createRes.json();
    if (!richMenuId) {
      return NextResponse.json(
        { error: "richMenuId が取得できませんでした" },
        { status: 502 }
      );
    }

    // 2. 事前生成済みのPNG画像を読み込み
    const pngBuffer = readFileSync(
      join(process.cwd(), "public", "richmenu.png")
    );

    // 3. 画像アップロード
    const uploadRes = await fetch(
      `https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`,
      {
        method: "POST",
        headers: {
          "Content-Type": "image/png",
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: new Uint8Array(pngBuffer),
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error("[Rich Menu] upload failed:", uploadRes.status, errText);
      return NextResponse.json(
        { error: `画像アップロード失敗: ${errText}` },
        { status: 502 }
      );
    }

    // 4. デフォルトに設定
    const setRes = await fetch(
      "https://api.line.me/v2/bot/user/all/richmenu/" + richMenuId,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
      }
    );

    if (!setRes.ok) {
      const errText = await setRes.text();
      console.error("[Rich Menu] set default failed:", setRes.status, errText);
      return NextResponse.json(
        { error: `デフォルト設定失敗: ${errText}` },
        { status: 502 }
      );
    }

    // 5. テナントに rich_menu_id を保存（follow時にユーザーへ即時設定するため）
    try {
      const { createClient: createServiceClient } = await import("@supabase/supabase-js");
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (url && key) {
        const supabaseAdmin = createServiceClient(url, key);
        const { data: t } = await supabaseAdmin
          .schema("terastar_line")
          .from("tenants")
          .select("id")
          .limit(1)
          .single();
        if (t) {
          await supabaseAdmin
            .schema("terastar_line")
            .from("tenants")
            .update({ rich_menu_id: richMenuId })
            .eq("id", t.id);
        }
      }
    } catch (e) {
      console.warn("[Rich Menu] tenant rich_menu_id update failed (run migration if needed):", e);
    }

    return NextResponse.json({
      ok: true,
      richMenuId,
      message: "リッチメニューを設定しました",
    });
  } catch (error) {
    console.error("[Rich Menu]", error);
    return NextResponse.json(
      { error: "リッチメニュー設定中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
