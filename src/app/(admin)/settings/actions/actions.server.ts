"use server";

import supabase from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function updateCourseDiscountSettings(settings: any) {
  const { error } = await supabase
    .from("settings")
    .upsert([{ key: "course_discount", value: settings }]);
  if (error) throw error;
  revalidatePath("/admin/settings");
  return { success: true };
}
