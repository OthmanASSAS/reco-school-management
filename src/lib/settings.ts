import supabase from "@/lib/supabase";

export async function fetchCourseDiscountSettings() {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "course_discount")
    .single();
  if (error) throw error;
  return data?.value || { startAt: 3, step: 25, mode: "cumulative" };
}
