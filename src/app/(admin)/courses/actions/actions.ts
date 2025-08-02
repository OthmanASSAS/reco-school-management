<<<<<<< HEAD
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
  const teacher_id = formData.get("teacher_id") as string;
  // ... autres champs
  await supabase.from("courses").insert({ name, teacher_id /*...*/ });
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
=======
export * from "./actions.server";
// Ce fichier ne contient plus de Server Actions. Utilisez actions.server.ts pour les Server Actions Next.js.
>>>>>>> main
