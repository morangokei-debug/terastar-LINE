import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * 患者からの処方箋送信リクエスト（リッチメニュー経由）
 * 認証不要・公開API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patient_name, memo, line_user_id } = body;

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

    const { data: tenant } = await supabase
      .schema("terastar_line")
      .from("tenants")
      .select("id")
      .limit(1)
      .single();

    if (!tenant) {
      return NextResponse.json(
        { error: "テナントが登録されていません" },
        { status: 500 }
      );
    }

    const { error } = await supabase
      .schema("terastar_line")
      .from("prescription_requests")
      .insert({
        tenant_id: tenant.id,
        line_user_id: line_user_id || null,
        patient_name: patient_name.trim(),
        memo: memo?.trim() || null,
      });

    if (error) {
      console.error("[prescription-requests]", error);
      return NextResponse.json(
        { error: "送信に失敗しました" },
        { status: 500 }
      );
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
