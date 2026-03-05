import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function randomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

export async function POST() {
  const supabase = await createClient();
  const { data: tenant } = await supabase
    .schema("terastar_line")
    .from("tenants")
    .select("id")
    .limit(1)
    .single();

  if (!tenant) {
    return NextResponse.json({ error: "テナントがありません" }, { status: 500 });
  }

  const token = randomCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const { error } = await supabase
    .schema("terastar_line")
    .from("tenants")
    .update({
      notification_register_token: token,
      notification_register_token_expires_at: expiresAt.toISOString(),
    })
    .eq("id", tenant.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ token, expiresAt: expiresAt.toISOString() });
}
