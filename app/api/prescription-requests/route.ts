import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * 患者からの処方箋送信リクエスト（リッチメニュー経由）
 * 認証不要・公開API
 * FormData: patient_name, memo, image（任意）
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let patient_name: string;
    let memo: string | undefined;
    let birth_date: string | undefined;
    let line_user_id: string | undefined;
    let imageFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      patient_name = (formData.get("patient_name") as string) || "";
      memo = (formData.get("memo") as string) || undefined;
      birth_date = (formData.get("birth_date") as string) || undefined;
      line_user_id = (formData.get("line_user_id") as string) || undefined;
      const file = formData.get("image") as File | null;
      if (file && file.size > 0) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          return NextResponse.json(
            { error: "画像はJPEG/PNG/WebPのみ対応しています" },
            { status: 400 }
          );
        }
        if (file.size > MAX_SIZE) {
          return NextResponse.json(
            { error: "画像は5MB以下にしてください" },
            { status: 400 }
          );
        }
        imageFile = file;
      }
    } else {
      const body = await request.json();
      patient_name = body.patient_name || "";
      memo = body.memo;
      birth_date = body.birth_date;
      line_user_id = body.line_user_id;
    }

    if (!patient_name || typeof patient_name !== "string") {
      return NextResponse.json(
        { error: "お名前を入力してください" },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "サーバー設定エラー" },
        { status: 500 }
      );
    }

    let { data: tenant } = await supabase
      .schema("terastar_line")
      .from("tenants")
      .select("id, notification_line_user_id")
      .limit(1)
      .single();

    if (!tenant) {
      const { data: inserted, error: insertErr } = await supabase
        .schema("terastar_line")
        .from("tenants")
        .insert({ name: "テラスターファーマシー" })
        .select("id, notification_line_user_id")
        .single();
      if (insertErr || !inserted) {
        console.error("[prescription-requests] tenant insert failed:", insertErr);
        return NextResponse.json(
          { error: "テナントが登録されていません" },
          { status: 500 }
        );
      }
      tenant = inserted;
    }

    let image_url: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop() || "jpg";
      const path = `${tenant.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const buf = await imageFile.arrayBuffer();
      const { error: uploadErr } = await supabase.storage
        .from("prescription-images")
        .upload(path, buf, {
          contentType: imageFile.type,
          upsert: false,
        });
      if (uploadErr) {
        console.error("[prescription-requests] upload failed:", uploadErr);
        return NextResponse.json(
          { error: "画像のアップロードに失敗しました" },
          { status: 500 }
        );
      }
      const { data: urlData } = supabase.storage
        .from("prescription-images")
        .getPublicUrl(path);
      image_url = urlData.publicUrl;
    }

    const { error } = await supabase
      .schema("terastar_line")
      .from("prescription_requests")
      .insert({
        tenant_id: tenant.id,
        patient_name: patient_name.trim(),
        memo: memo?.trim() || null,
        birth_date: birth_date || null,
        line_user_id: line_user_id || null,
        image_url,
      });

    if (error) {
      console.error("[prescription-requests]", error);
      return NextResponse.json(
        { error: "送信に失敗しました" },
        { status: 500 }
      );
    }

    // 通知先が登録されていればLINEプッシュ通知
    const { data: tenantForNotify } = await supabase
      .schema("terastar_line")
      .from("tenants")
      .select("notification_line_user_id")
      .eq("id", tenant!.id)
      .single();
    const notifyUserId = tenantForNotify?.notification_line_user_id;
    const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (notifyUserId && lineToken) {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
          : "https://terastar-line.vercel.app");
      const dashboardUrl = `${baseUrl}/dashboard/prescription-requests`;
      const notifyText = `⚠️ 新しい処方箋が届きました\n\n患者名: ${patient_name.trim()}\n\n確認: ${dashboardUrl}`;
      try {
        await fetch("https://api.line.me/v2/bot/message/push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lineToken}`,
          },
          body: JSON.stringify({
            to: notifyUserId,
            messages: [{ type: "text", text: notifyText }],
          }),
        });
      } catch (e) {
        console.warn("[prescription-requests] notify failed:", e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[prescription-requests]", error);
    return NextResponse.json(
      { error: "送信に失敗しました" },
      { status: 500 }
    );
  }
}
