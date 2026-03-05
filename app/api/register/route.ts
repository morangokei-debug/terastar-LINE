import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { line_user_id, name, birth_date } = body;

    if (!line_user_id || !name || typeof name !== "string") {
      return NextResponse.json(
        { error: "お名前を入力してください" },
        { status: 400 }
      );
    }

    if (!birth_date) {
      return NextResponse.json(
        { error: "生年月日を入力してください" },
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

    const { data: patient, error: findErr } = await supabase
      .schema("terastar_line")
      .from("patients")
      .select("id")
      .eq("line_user_id", line_user_id)
      .single();

    if (findErr || !patient) {
      return NextResponse.json(
        { error: "患者情報が見つかりません。先にLINEで友だち追加してください。" },
        { status: 404 }
      );
    }

    const { error: updateErr } = await supabase
      .schema("terastar_line")
      .from("patients")
      .update({
        name: name.trim(),
        birth_date,
        updated_at: new Date().toISOString(),
      })
      .eq("id", patient.id);

    if (updateErr) {
      console.error("[register]", updateErr);
      return NextResponse.json(
        { error: "登録に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json(
      { error: "登録に失敗しました" },
      { status: 500 }
    );
  }
}
