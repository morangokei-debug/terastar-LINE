import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PatternEditForm } from "./PatternEditForm";

export default async function EditPatternPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pattern } = await supabase
    .schema("terastar_line")
    .from("follow_up_patterns")
    .select("*")
    .eq("id", id)
    .single();

  if (!pattern) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">フォローアップ設定 - 編集</h1>
      <PatternEditForm pattern={pattern} />
    </div>
  );
}
