import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Webhook の患者登録ロジックをテストするエンドポイント
 * テスト用のダミー line_user_id で insert → 確認 → 削除
 */
export async function GET() {
  const results: Record<string, string> = {};

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: "ENV missing" }, { status: 500 });
  }

  const supabase = createClient(url, key);

  try {
    // 1. テナント取得
    const { data: tenant, error: tErr } = await supabase
      .schema("terastar_line")
      .from("tenants")
      .select("id")
      .limit(1)
      .single();

    if (tErr || !tenant) {
      results["tenant"] = `FAIL: ${tErr?.message ?? "no tenant"}`;
      return NextResponse.json(results);
    }
    results["tenant"] = `OK: ${tenant.id}`;

    // 2. テスト用 patient を insert
    const testLineId = `__test_${Date.now()}`;
    const { data: inserted, error: insErr } = await supabase
      .schema("terastar_line")
      .from("patients")
      .insert({
        tenant_id: tenant.id,
        name: `テスト患者（自動削除）`,
        line_user_id: testLineId,
        linked_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insErr) {
      results["patient_insert"] = `FAIL: ${insErr.message} (code: ${insErr.code})`;
      return NextResponse.json(results);
    }
    results["patient_insert"] = `OK: ${inserted.id}`;

    // 3. 読み取り確認
    const { data: readBack, error: readErr } = await supabase
      .schema("terastar_line")
      .from("patients")
      .select("id, name, line_user_id")
      .eq("id", inserted.id)
      .single();

    if (readErr) {
      results["patient_read"] = `FAIL: ${readErr.message}`;
    } else {
      results["patient_read"] = `OK: ${readBack.name}`;
    }

    // 4. テストデータ削除
    const { error: delErr } = await supabase
      .schema("terastar_line")
      .from("patients")
      .delete()
      .eq("id", inserted.id);

    results["patient_delete"] = delErr ? `FAIL: ${delErr.message}` : "OK";

    // 5. 現在の patients count
    const { count } = await supabase
      .schema("terastar_line")
      .from("patients")
      .select("id", { count: "exact", head: true });
    results["patients_count"] = `${count}`;

    // 6. line_pending count
    const { count: pendCount } = await supabase
      .schema("terastar_line")
      .from("line_pending")
      .select("id", { count: "exact", head: true });
    results["line_pending_count"] = `${pendCount}`;

  } catch (e) {
    results["exception"] = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(results);
}
