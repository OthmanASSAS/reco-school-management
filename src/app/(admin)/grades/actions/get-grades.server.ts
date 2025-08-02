"use server";

import { createClient } from "@/lib/supabase/server";

interface Grade {
  id: string;
  student_id: string;
  score: number;
  comments: string | null;
  evaluation_date: string;
}

export async function getGrades(
  subjectId: string,
  periodType: string,
  periodValue: string,
  schoolYearId: string
) {
  const supabase = await createClient();

  try {
    const { data: grades, error } = await supabase
      .from("grades")
      .select("id, student_id, score, comments, evaluation_date")
      .eq("subject_id", subjectId)
      .eq("period_type", periodType)
      .eq("period_value", periodValue)
      .eq("school_year_id", schoolYearId);

    if (error) {
      console.error("Erreur lors de la récupération des notes:", error);
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }

    return {
      success: true,
      data: grades || [],
    };
  } catch (error) {
    console.error("Erreur dans getGrades:", error);
    throw error;
  }
}

export async function getGradesForSubject(subjectId: string, schoolYearId: string) {
  const supabase = await createClient();

  try {
    const { data: grades, error } = await supabase
      .from("grades")
      .select(
        `
        id, 
        student_id, 
        subject_id,
        score, 
        comments, 
        evaluation_date,
        period_type,
        period_value
      `
      )
      .eq("subject_id", subjectId)
      .eq("school_year_id", schoolYearId)
      .order("evaluation_date", { ascending: false });

    if (error) {
      console.error("Erreur lors de la récupération des notes:", error);
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }

    return {
      success: true,
      data: grades || [],
    };
  } catch (error) {
    console.error("Erreur dans getGradesForSubject:", error);
    throw error;
  }
}
