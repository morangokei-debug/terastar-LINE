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
    // Test 1: Direct REST API call to PostgREST
    try {
      const restUrl = `${url}/rest/v1/tenants?select=id,name&limit=1`;
      const res = await fetch(restUrl, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Accept-Profile": "terastar_line",
          Accept: "application/json",
        },
      });
      const body = await res.text();
      checks["REST_DIRECT"] = `status=${res.status} body=${body.substring(0, 200)}`;
    } catch (e) {
      checks["REST_DIRECT"] = `EXCEPTION: ${e instanceof Error ? e.message : String(e)}`;
    }

    // Test 2: supabase-js .schema() method
    try {
      const supabase = createClient(url, key);
      const { data: tenant, error: tenantErr } = await supabase
        .schema("terastar_line")
        .from("tenants")
        .select("id, name")
        .limit(1)
        .single();

      if (tenantErr) {
        checks["JS_SCHEMA"] = `ERROR: ${tenantErr.message} (code: ${tenantErr.code})`;
      } else if (tenant) {
        checks["JS_SCHEMA"] = `OK: ${tenant.name} (${tenant.id})`;
      } else {
        checks["JS_SCHEMA"] = "NO_DATA";
      }
    } catch (e) {
      checks["JS_SCHEMA"] = `EXCEPTION: ${e instanceof Error ? e.message : String(e)}`;
    }

    // Test 3: supabase-js with db.schema option
    try {
      const supabase2 = createClient(url, key, {
        db: { schema: "terastar_line" },
      });
      const { data: tenant2, error: tenantErr2 } = await supabase2
        .from("tenants")
        .select("id, name")
        .limit(1)
        .single();

      if (tenantErr2) {
        checks["JS_DB_SCHEMA"] = `ERROR: ${tenantErr2.message} (code: ${tenantErr2.code})`;
      } else if (tenant2) {
        checks["JS_DB_SCHEMA"] = `OK: ${tenant2.name} (${tenant2.id})`;
      } else {
        checks["JS_DB_SCHEMA"] = "NO_DATA";
      }
    } catch (e) {
      checks["JS_DB_SCHEMA"] = `EXCEPTION: ${e instanceof Error ? e.message : String(e)}`;
    }
  } else {
    checks["DB_CONNECTION"] = "SKIPPED (missing env vars)";
  }

  return NextResponse.json(checks);
}
