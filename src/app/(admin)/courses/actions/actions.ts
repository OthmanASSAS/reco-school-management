import supabase from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { Course } from "@/types";

export async function getCoursesWithDetail() {
  try {
    const { data, error } = await supabase.from("courses").select(`
        *,
        teachers:teacher_id(full_name),
        rooms:room_id(name)
      `);

    if (error) {
      console.error("Erreur getCoursesWithDetail:", error);
      return [];
    }

    return data;
  } catch (e) {
    console.error("Catch getCoursesWithDetail:", e);
    return [];
  }
}

export async function createCourse(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const teacher_id = formData.get("teacher_id") as string;
  const room_id = formData.get("room_id") as string;
  const price = formData.get("price") ? Number(formData.get("price")) : null;
  const capacity = formData.get("capacity") ? Number(formData.get("capacity")) : null;
  const schedule = formData.get("schedule") as string | null;
  const label = formData.get("label") as string | null;
  const category = formData.get("category") as string | null;
  const audience = formData.get("audience") as string | null;
  const school_year_id = formData.get("school_year_id") as string | null;

  const { error } = await supabase.from("courses").insert({
    name,
    type,
    teacher_id,
    room_id,
    price,
    capacity,
    schedule,
    label,
    category,
    audience,
    school_year_id,
  });

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/courses");
}

export async function updateCourse(id: string, formData: FormData) {
  "use server";
  await supabase
    .from("courses")
    .update({
      name: formData.get("name"),
      teacher_id: formData.get("teacher_id"),
      room_id: formData.get("room_id"),
      price: formData.get("price"),
      type: formData.get("type"),
      schedule: formData.get("schedule"),
    })
    .eq("id", id);
  revalidatePath("/courses");
}

export async function deleteCourse(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await supabase.from("courses").delete().eq("id", id);
  revalidatePath("/courses");
}
