import supabase from "@/lib/supabase";

export async function fetchCourseDiscountSettings() {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "course_discount")
    .single();
  if (error) throw error;
  console.log({ data });
  return (
    (data?.value ? JSON.parse(data.value) : null) || { startAt: 3, step: 25, mode: "cumulative" }
  );
}
