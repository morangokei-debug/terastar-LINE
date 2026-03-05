import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: tenant } = await supabase
    .schema("terastar_line")
    .from("tenants")
    .select("notification_line_user_id")
    .limit(1)
    .single();

  return NextResponse.json({
    hasNotificationRecipient: !!tenant?.notification_line_user_id,
  });
}
