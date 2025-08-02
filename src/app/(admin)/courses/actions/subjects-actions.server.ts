"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface Subject {
  id?: string;
  name: string;
  description?: string;
  color: string;
  order_index: number;
  is_active: boolean;
  course_id: string;
}

export async function createSubject(data: Omit<Subject, "id">) {
  const supabase = await createClient();

  try {
    // Déterminer l'ordre suivant
    const { data: existingSubjects } = await supabase
      .from("subjects")
      .select("order_index")
      .eq("course_id", data.course_id)
      .order("order_index", { ascending: false })
      .limit(1);

    const nextOrder =
      existingSubjects && existingSubjects.length > 0 ? existingSubjects[0].order_index + 1 : 1;

    const { data: subject, error } = await supabase
      .from("subjects")
      .insert({
        ...data,
        order_index: nextOrder,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de la création de la matière:", error);
      return { success: false, message: "Erreur lors de la création de la matière" };
    }

    revalidatePath(`/admin/courses/${data.course_id}/matieres`);
    return { success: true, message: "Matière créée avec succès", data: subject };
  } catch (error) {
    console.error("Erreur lors de la création de la matière:", error);
    return { success: false, message: "Erreur lors de la création de la matière" };
  }
}

export async function updateSubject(subjectId: string, data: Partial<Subject>) {
  const supabase = await createClient();

  try {
    const { data: subject, error } = await supabase
      .from("subjects")
      .update(data)
      .eq("id", subjectId)
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de la mise à jour de la matière:", error);
      return { success: false, message: "Erreur lors de la mise à jour de la matière" };
    }

    revalidatePath(`/admin/courses/${subject.course_id}/matieres`);
    return { success: true, message: "Matière mise à jour avec succès", data: subject };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la matière:", error);
    return { success: false, message: "Erreur lors de la mise à jour de la matière" };
  }
}

export async function deleteSubject(subjectId: string) {
  const supabase = await createClient();

  try {
    // Récupérer le course_id avant suppression
    const { data: subject } = await supabase
      .from("subjects")
      .select("course_id")
      .eq("id", subjectId)
      .single();

    const { error } = await supabase.from("subjects").delete().eq("id", subjectId);

    if (error) {
      console.error("Erreur lors de la suppression de la matière:", error);
      return { success: false, message: "Erreur lors de la suppression de la matière" };
    }

    if (subject) {
      revalidatePath(`/admin/courses/${subject.course_id}/matieres`);
    }
    return { success: true, message: "Matière supprimée avec succès" };
  } catch (error) {
    console.error("Erreur lors de la suppression de la matière:", error);
    return { success: false, message: "Erreur lors de la suppression de la matière" };
  }
}

export async function copySubjectsFromTemplate(targetCourseId: string, templateCourseId: string) {
  const supabase = await createClient();

  try {
    // Récupérer les matières du template
    const { data: templateSubjects, error: fetchError } = await supabase
      .from("subjects")
      .select("*")
      .eq("course_id", templateCourseId)
      .order("order_index");

    if (fetchError) {
      console.error("Erreur lors de la récupération des matières template:", fetchError);
      return { success: false, message: "Erreur lors de la récupération des matières template" };
    }

    if (!templateSubjects || templateSubjects.length === 0) {
      return { success: false, message: "Aucune matière trouvée dans le template" };
    }

    // Déterminer l'ordre de départ
    const { data: existingSubjects } = await supabase
      .from("subjects")
      .select("order_index")
      .eq("course_id", targetCourseId)
      .order("order_index", { ascending: false })
      .limit(1);

    const startOrder =
      existingSubjects && existingSubjects.length > 0 ? existingSubjects[0].order_index + 1 : 1;

    // Créer les nouvelles matières
    const subjectsToInsert = templateSubjects.map((subject, index) => ({
      name: subject.name,
      description: subject.description,
      color: subject.color,
      order_index: startOrder + index,
      is_active: true,
      course_id: targetCourseId,
    }));

    const { error: insertError } = await supabase.from("subjects").insert(subjectsToInsert);

    if (insertError) {
      console.error("Erreur lors de la copie des matières:", insertError);
      return { success: false, message: "Erreur lors de la copie des matières" };
    }

    revalidatePath(`/admin/courses/${targetCourseId}/matieres`);
    return {
      success: true,
      message: `${subjectsToInsert.length} matière(s) copiée(s) avec succès`,
    };
  } catch (error) {
    console.error("Erreur lors de la copie des matières:", error);
    return { success: false, message: "Erreur lors de la copie des matières" };
  }
}

export async function reorderSubjects(subjectIds: string[]) {
  const supabase = await createClient();

  try {
    // Mettre à jour l'ordre de toutes les matières
    const updates = subjectIds.map((id, index) => ({
      id,
      order_index: index + 1,
    }));

    const { error } = await supabase.from("subjects").upsert(updates, { onConflict: "id" });

    if (error) {
      console.error("Erreur lors de la réorganisation des matières:", error);
      return { success: false, message: "Erreur lors de la réorganisation des matières" };
    }

    // Revalider le cache pour tous les cours concernés
    const { data: subjects } = await supabase
      .from("subjects")
      .select("course_id")
      .in("id", subjectIds);

    if (subjects) {
      const courseIds = [...new Set(subjects.map(s => s.course_id))];
      courseIds.forEach(courseId => {
        revalidatePath(`/admin/courses/${courseId}/matieres`);
      });
    }

    return { success: true, message: "Ordre des matières mis à jour" };
  } catch (error) {
    console.error("Erreur lors de la réorganisation des matières:", error);
    return { success: false, message: "Erreur lors de la réorganisation des matières" };
  }
}
