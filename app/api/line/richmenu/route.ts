import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

function getBaseUrl(request: NextRequest): string {
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return siteUrl;
  const host = request.headers.get("host") || "localhost:3000";
  return host.startsWith("localhost") ? `http://${host}` : `https://${host}`;
}

/**
 * リッチメニューをセットアップするAPI
 * GET: セットアップ実行（認証済み薬剤師のみ推奨）
 */
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
  const homepageUrl =
    process.env.NEXT_PUBLIC_PHARMACY_HOMEPAGE_URL || baseUrl;

  const richMenu = {
    size: { width: 2500, height: 843 },
    selected: false,
    name: "メインメニュー",
    chatBarText: "メニュー",
    areas: [
      {
        bounds: { x: 0, y: 0, width: 833, height: 843 },
        action: {
          type: "uri",
          label: "処方箋送信",
          uri: `${baseUrl}/prescription-submit`,
        },
      },
      {
        bounds: { x: 833, y: 0, width: 834, height: 843 },
        action: {
          type: "uri",
          label: "ホームページ",
          uri: homepageUrl,
        },
      },
      {
        bounds: { x: 1667, y: 0, width: 833, height: 843 },
        action: {
          type: "message",
          label: "メッセージ入力",
          text: "お問い合わせ",
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

    // 2. 画像生成（3分割＋ラベル表示）
    const width = 2500;
    const height = 843;
    const sectionWidth = Math.floor(width / 3);
    const labels = ["処方箋送信", "ホームページ", "メッセージ入力"];
    const colors = ["#f97316", "#ffffff", "#e5e7eb"];

    const rects = colors
      .map(
        (color, i) =>
          `<rect x="${i * sectionWidth}" y="0" width="${sectionWidth}" height="${height}" fill="${color}"/>`
      )
      .join("");

    const texts = labels
      .map(
        (label, i) => {
          const x = i * sectionWidth + sectionWidth / 2;
          const y = height / 2;
          const fill = i === 1 ? "#1f2937" : i === 0 ? "#ffffff" : "#374151";
          return `<text x="${x}" y="${y}" font-family="'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif" font-size="64" font-weight="bold" fill="${fill}" text-anchor="middle" dominant-baseline="middle">${label}</text>`;
        }
      )
      .join("");

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        ${rects}
        ${texts}
      </svg>
    `;

    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

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
