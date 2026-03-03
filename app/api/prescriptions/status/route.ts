import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prescriptionId, status, notifyLine } = body;

    if (!prescriptionId || !status) {
      return NextResponse.json(
        { error: "prescriptionId と status が必要です" },
        { status: 400 }
      );
    }

    const validStatuses = ["received", "preparing", "completed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "無効なステータスです" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { data: prescription, error: fetchError } = await supabase
      .schema("terastar_line")
      .from("prescriptions")
      .select("id, patient_id")
      .eq("id", prescriptionId)
      .single();

    if (fetchError || !prescription) {
      return NextResponse.json(
        { error: "処方箋が見つかりません" },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .schema("terastar_line")
      .from("prescriptions")
      .update({ status })
      .eq("id", prescriptionId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    let lineUserId: string | null = null;
    if (status === "completed" && notifyLine) {
      const { data: patient } = await supabase
        .schema("terastar_line")
        .from("patients")
        .select("line_user_id")
        .eq("id", prescription.patient_id)
        .single();
      lineUserId = patient?.line_user_id ?? null;

      if (lineUserId) {
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
        await fetch(`${baseUrl}/api/line/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: lineUserId,
            message: "お薬のご用意ができました。お越しください。",
          }),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[prescriptions/status]", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
