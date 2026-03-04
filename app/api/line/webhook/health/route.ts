import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const checks: Record<string, string> = {};

  checks["LINE_CHANNEL_SECRET"] = process.env.LINE_CHANNEL_SECRET ? "SET" : "MISSING";
  checks["LINE_CHANNEL_ACCESS_TOKEN"] = process.env.LINE_CHANNEL_ACCESS_TOKEN ? "SET" : "MISSING";
  checks["LINE_WELCOME_MESSAGE"] = process.env.LINE_WELCOME_MESSAGE ? `SET (${process.env.LINE_WELCOME_MESSAGE.length} chars)` : "NOT SET (using default)";
  checks["NEXT_PUBLIC_SUPABASE_URL"] = process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING";
  checks["SUPABASE_SERVICE_ROLE_KEY"] = process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    const supabase = createClient(url, key);

    // Test 1: テナント取得
    try {
      const { data: tenant, error: tenantErr } = await supabase
        .schema("terastar_line")
        .from("tenants")
        .select("id, name, rich_menu_id")
        .limit(1)
        .single();

      if (tenantErr) {
        checks["TENANT"] = `ERROR: ${tenantErr.message} (code: ${tenantErr.code})`;
      } else if (tenant) {
        checks["TENANT"] = `OK: ${tenant.name} (${tenant.id})`;
        checks["RICH_MENU_ID"] = tenant.rich_menu_id ?? "NOT SET (リッチメニューを設定するボタンを押してください)";
      } else {
        checks["TENANT"] = "NO_DATA";
      }
    } catch (e) {
      checks["TENANT"] = `EXCEPTION: ${e instanceof Error ? e.message : String(e)}`;
    }

    // Test 2: 患者数
    try {
      const { count, error } = await supabase
        .schema("terastar_line")
        .from("patients")
        .select("id", { count: "exact", head: true });
      if (error) {
        checks["PATIENTS"] = `ERROR: ${error.message}`;
      } else {
        checks["PATIENTS"] = `COUNT: ${count}`;
      }
    } catch (e) {
      checks["PATIENTS"] = `EXCEPTION: ${e instanceof Error ? e.message : String(e)}`;
    }

    // Test 3: LINE API 疎通確認
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (token) {
      try {
        const res = await fetch("https://api.line.me/v2/bot/info", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const botInfo = await res.json();
        if (res.ok) {
          checks["LINE_BOT"] = `OK: ${botInfo.displayName ?? "unknown"} (basicId: ${botInfo.basicId ?? "?"})`;
        } else {
          checks["LINE_BOT"] = `ERROR: status=${res.status} ${JSON.stringify(botInfo).substring(0, 200)}`;
        }
      } catch (e) {
        checks["LINE_BOT"] = `EXCEPTION: ${e instanceof Error ? e.message : String(e)}`;
      }

      // Test 4: Webhook URL 確認
      try {
        const res = await fetch("https://api.line.me/v2/bot/channel/webhook/endpoint", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const info = await res.json();
        if (res.ok) {
          checks["WEBHOOK_URL"] = info.endpoint ?? "NOT SET";
          checks["WEBHOOK_ACTIVE"] = String(info.active ?? "unknown");
        } else {
          checks["WEBHOOK_URL"] = `ERROR: ${JSON.stringify(info).substring(0, 200)}`;
        }
      } catch (e) {
        checks["WEBHOOK_URL"] = `EXCEPTION: ${e instanceof Error ? e.message : String(e)}`;
      }
    }
  } else {
    checks["DB_CONNECTION"] = "SKIPPED (missing env vars)";
  }

  return NextResponse.json(checks);
}
