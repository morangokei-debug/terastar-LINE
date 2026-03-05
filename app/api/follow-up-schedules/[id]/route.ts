import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { scheduled_at } = body as { scheduled_at: string };

  if (!scheduled_at) {
    return NextResponse.json(
      { error: "scheduled_at is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { error } = await supabase
    .schema("terastar_line")
    .from("follow_up_schedules")
    .update({ scheduled_at })
    .eq("id", id)
    .is("sent_at", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
