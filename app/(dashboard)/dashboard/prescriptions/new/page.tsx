import { PrescriptionForm } from "./PrescriptionForm";
import { createClient } from "@/lib/supabase/server";

export default async function NewPrescriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string }>;
}) {
  const { patient: patientId } = await searchParams;
  const supabase = await createClient();

  const { data: patients } = await supabase
    .schema("terastar_line")
    .from("patients")
    .select("id, name")
    .order("name");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">処方箋を登録</h1>
      <PrescriptionForm patients={patients ?? []} defaultPatientId={patientId} />
    </div>
  );
}
