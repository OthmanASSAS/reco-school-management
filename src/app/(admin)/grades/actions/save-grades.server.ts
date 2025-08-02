"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface GradeEntry {
  studentId: string;
  score: string;
  comment: string;
}

interface GradeInput {
  studentId: string;
  subjectId: string;
  periodType: string;
  periodValue: string;
  score: number;
  coefficient: number;
  comments?: string;
}

export async function saveGrades(
  subjectId: string,
  grades: GradeEntry[],
  periodType: string,
  periodValue: string,
  schoolYearId: string
) {
  const supabase = await createClient();

  try {
    // Filtrer les notes valides (avec un score)
    const validGrades = grades.filter(grade => {
      const score = parseFloat(grade.score);
      return !isNaN(score) && score >= 0 && score <= 20;
    });

    if (validGrades.length === 0) {
      throw new Error("Aucune note valide à sauvegarder");
    }

    // Préparer les données pour l'insertion
    const gradesToInsert = validGrades.map(grade => ({
      student_id: grade.studentId,
      subject_id: subjectId,
      score: parseFloat(grade.score),
      coefficient: 1, // Coefficient par défaut
      period_type: periodType,
      period_value: periodValue,
      school_year_id: schoolYearId,
      comments: grade.comment.trim() || null,
      evaluation_date: new Date().toISOString().split("T")[0],
    }));

    // Insérer les notes
    const { error } = await supabase.from("grades").insert(gradesToInsert);

    if (error) {
      console.error("Erreur lors de la sauvegarde des notes:", error);
      throw new Error(`Erreur lors de la sauvegarde: ${error.message}`);
    }

    // Revalider la page pour mettre à jour l'affichage
    revalidatePath("/grades");

    return {
      success: true,
      message: `${validGrades.length} note(s) sauvegardée(s) avec succès`,
      savedCount: validGrades.length,
    };
  } catch (error) {
    console.error("Erreur dans saveGrades:", error);
    throw error;
  }
}

export async function saveGradesFromOverview(grades: GradeInput[], schoolYearId: string) {
  const supabase = await createClient();

  try {
    // Filtrer les notes valides (avec un score > 0)
    const validGrades = grades.filter(grade => grade.score > 0);

    if (validGrades.length === 0) {
      return {
        success: false,
        message: "Aucune note valide à sauvegarder",
      };
    }

    // Préparer les données pour l'insertion
    const gradesToInsert = validGrades.map(grade => ({
      student_id: grade.studentId,
      subject_id: grade.subjectId,
      score: grade.score,
      coefficient: grade.coefficient,
      period_type: grade.periodType,
      period_value: grade.periodValue,
      school_year_id: schoolYearId,
      comments: grade.comments?.trim() || null,
      evaluation_date: new Date().toISOString().split("T")[0],
    }));

    // Insérer les notes
    const { error } = await supabase.from("grades").insert(gradesToInsert);

    if (error) {
      console.error("Erreur lors de la sauvegarde des notes:", error);
      return {
        success: false,
        message: `Erreur lors de la sauvegarde: ${error.message}`,
      };
    }

    // Revalider la page pour mettre à jour l'affichage
    revalidatePath("/grades");

    return {
      success: true,
      message: `${validGrades.length} note(s) sauvegardée(s) avec succès`,
      savedCount: validGrades.length,
    };
  } catch (error) {
    console.error("Erreur dans saveGradesFromOverview:", error);
    return {
      success: false,
      message: "Erreur lors de la sauvegarde des notes",
    };
  }
}
