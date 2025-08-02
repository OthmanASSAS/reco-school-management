"use server";

import supabase from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function saveGrade(formData: FormData) {
  const subjectId = formData.get("subjectId") as string;
  const schoolYearId = formData.get("schoolYearId") as string;
  const periodType = formData.get("periodType") as string;
  const periodValue = formData.get("periodValue") as string;
  const coefficient = Number(formData.get("coefficient"));

  try {
    const gradesToInsert = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("grade-")) {
        const studentId = key.replace("grade-", "");
        const score = Number(value);
        const comments = formData.get(`comment-${studentId}`) as string;

        if (!isNaN(score) && score >= 0 && score <= 20) {
          gradesToInsert.push({
            student_id: studentId,
            subject_id: subjectId,
            score: score,
            coefficient: coefficient,
            period_type: periodType,
            period_value: periodValue,
            school_year_id: schoolYearId,
            comments: comments || null,
            evaluation_date: new Date().toISOString().split('T')[0], // Current date for evaluation
          });
        }
      }
    }

    if (gradesToInsert.length > 0) {
      const { error } = await supabase.from("grades").insert(gradesToInsert);
      if (error) throw error;
    }

    revalidatePath("/admin/grades");
    return { message: "Notes sauvegardées avec succès !", success: true };
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des notes:", error);
    return {
      message: "Erreur lors de la sauvegarde des notes",
      success: false,
    };
  }
}

export async function getGrades(studentId: string, courseId: string, schoolYearId: string, subjectId: string) {
  try {
    const { data, error } = await supabase
      .from("grades")
      .select(`
        id, score, coefficient, period_type, period_value, comments, evaluation_date,
        subjects(id, name, course_id)
      `)
      .eq("student_id", studentId)
      .eq("school_year_id", schoolYearId)
      .eq("subject_id", subjectId); // Filter by subjectId

    if (error) throw error;

    // No need to filter by course_id from subjects relation anymore if we filter by subject_id directly
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des notes:", error);
    return [];
  }
}

export async function generateBulletin(studentId: string, schoolYearId: string) {
  // Placeholder for generating bulletin
  console.log("Generating bulletin for:", studentId, schoolYearId);
  // TODO: Implement actual PDF generation logic
  return { message: "Bulletin généré avec succès (placeholder)!", success: true };
}

export async function getGradeHistory(studentId: string) {
  try {
    const { data, error } = await supabase
      .from("grades")
      .select(`
        id, score, coefficient, period_type, period_value, comments, evaluation_date,
        subjects(id, name),
        school_years(id, year_start, year_end)
      `)
      .eq("student_id", studentId)
      .order("evaluation_date", { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique des notes:", error);
    return [];
  }
}