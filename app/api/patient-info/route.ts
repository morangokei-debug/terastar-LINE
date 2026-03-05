import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  const lineUserId = request.nextUrl.searchParams.get("line_user_id");

  if (!lineUserId) {
    return NextResponse.json(
      { error: "line_user_id is required" },
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

  const { data: patient, error } = await supabase
    .schema("terastar_line")
    .from("patients")
    .select("name, birth_date")
    .eq("line_user_id", lineUserId)
    .single();

  if (error || !patient) {
    return NextResponse.json({ name: null, birth_date: null });
  }

  const isAutoName = patient.name?.startsWith("LINE友だち追加") || patient.name?.startsWith("LINE（");

  return NextResponse.json({
    name: isAutoName ? null : patient.name,
    birth_date: patient.birth_date,
  });
}
