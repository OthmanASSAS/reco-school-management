"use server";

import supabase from "@/lib/supabase";
import { revalidatePath } from "next/cache";

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
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const label = formData.get("label") as string;
  const category = formData.get("category") as string;
  const status = formData.get("status") as string;
  const capacity = Number(formData.get("capacity")) || null;
  const price = Number(formData.get("price")) || null;
  const teacher_id = formData.get("teacher_id") as string;
  const room_id = formData.get("room_id") as string;

  try {
    const { error } = await supabase.from("courses").insert([
      {
        name,
        type,
        label,
        category,
        status,
        capacity,
        price,
        teacher_id: teacher_id || null,
        room_id: room_id || null,
      },
    ]);

    if (error) throw error;

    revalidatePath("/admin/courses");
    return { message: "Cours créé avec succès !", success: true };
  } catch (error) {
    console.error("Erreur création cours:", error);
    return {
      message: "Erreur lors de la création du cours",
      success: false,
    };
  }
}

export async function updateCourse(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const label = formData.get("label") as string;
  const category = formData.get("category") as string;
  const status = formData.get("status") as string;
  const capacity = Number(formData.get("capacity")) || null;
  const price = Number(formData.get("price")) || null;
  const teacher_id = formData.get("teacher_id") as string;
  const room_id = formData.get("room_id") as string;

  try {
    const { error } = await supabase
      .from("courses")
      .update({
        name,
        type,
        label,
        category,
        status,
        capacity,
        price,
        teacher_id: teacher_id || null,
        room_id: room_id || null,
      })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/courses");
    return { message: "Cours mis à jour avec succès !", success: true };
  } catch (error) {
    console.error("Erreur mise à jour cours:", error);
    return {
      message: "Erreur lors de la mise à jour du cours",
      success: false,
    };
  }
}

export async function deleteCourse(formData: FormData) {
  const id = formData.get("id") as string;

  try {
    const { error } = await supabase.from("courses").delete().eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/courses");
    return { message: "Cours supprimé avec succès !", success: true };
  } catch (error) {
    console.error("Erreur suppression cours:", error);
    return {
      message: "Erreur lors de la suppression du cours",
      success: false,
    };
  }
}
