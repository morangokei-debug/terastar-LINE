import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const checks: Record<string, string> = {};

  checks["LINE_CHANNEL_SECRET"] = process.env.LINE_CHANNEL_SECRET ? "SET" : "MISSING";
  checks["LINE_CHANNEL_ACCESS_TOKEN"] = process.env.LINE_CHANNEL_ACCESS_TOKEN ? "SET" : "MISSING";
  checks["NEXT_PUBLIC_SUPABASE_URL"] = process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING";
  checks["SUPABASE_SERVICE_ROLE_KEY"] = process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    try {
      const supabase = createClient(url, key);
      const { data: tenant, error: tenantErr } = await supabase
        .schema("terastar_line")
        .from("tenants")
        .select("id, name")
        .limit(1)
        .single();

      if (tenantErr) {
        checks["DB_TENANT"] = `ERROR: ${tenantErr.message} (code: ${tenantErr.code})`;
      } else if (tenant) {
        checks["DB_TENANT"] = `OK: ${tenant.name} (${tenant.id})`;
      } else {
        checks["DB_TENANT"] = "NO_TENANT";
      }

      const { count, error: patErr } = await supabase
        .schema("terastar_line")
        .from("patients")
        .select("id", { count: "exact", head: true });

      if (patErr) {
        checks["DB_PATIENTS"] = `ERROR: ${patErr.message}`;
      } else {
        checks["DB_PATIENTS"] = `COUNT: ${count}`;
      }

      const { data: pending, error: pendErr } = await supabase
        .schema("terastar_line")
        .from("line_pending")
        .select("id, line_user_id, created_at")
        .limit(10);

      if (pendErr) {
        checks["DB_LINE_PENDING"] = `ERROR: ${pendErr.message}`;
      } else {
        checks["DB_LINE_PENDING"] = `COUNT: ${pending?.length ?? 0}`;
        if (pending && pending.length > 0) {
          checks["DB_LINE_PENDING_DATA"] = JSON.stringify(pending);
        }
      }
    } catch (e) {
      checks["DB_CONNECTION"] = `EXCEPTION: ${e instanceof Error ? e.message : String(e)}`;
    }
  } else {
    checks["DB_CONNECTION"] = "SKIPPED (missing env vars)";
  }

  return NextResponse.json(checks);
}
