"use server";

import { z } from "zod";
import supabase from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// Schema pour la modification d'un étudiant
const UpdateStudentSchema = z.object({
  studentId: z.string().min(1, "ID étudiant requis"),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  birthDate: z.string().min(1, "La date de naissance est requise"),
  registrationType: z.enum(["child", "adult"], { message: "Type d'élève requis" }),
});

export type UpdateStudentState = {
  errors?: {
    studentId?: string[];
    firstName?: string[];
    lastName?: string[];
    birthDate?: string[];
    registrationType?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function updateStudent(
  prevState: UpdateStudentState,
  formData: FormData
): Promise<UpdateStudentState> {
  const selectedCourses = formData.getAll("selectedCourses") as string[];

  const validatedFields = UpdateStudentSchema.safeParse({
    studentId: formData.get("studentId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    birthDate: formData.get("birthDate"),
    registrationType: formData.get("registrationType"),
  });

  if (!validatedFields.success) {
    const formattedErrors = validatedFields.error.format();
    return {
      errors: {
        studentId: formattedErrors.studentId?._errors,
        firstName: formattedErrors.firstName?._errors,
        lastName: formattedErrors.lastName?._errors,
        birthDate: formattedErrors.birthDate?._errors,
        registrationType: formattedErrors.registrationType?._errors,
      },
      message: "Champs manquants ou invalides.",
    };
  }

  const { studentId, firstName, lastName, birthDate, registrationType } = validatedFields.data;

  try {
    // Mettre à jour l'étudiant
    const { error: updateError } = await supabase
      .from("students")
      .update({
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate,
        registration_type: registrationType,
      })
      .eq("id", studentId);

    if (updateError) {
      console.error("Erreur mise à jour étudiant:", updateError);
      return {
        message: `Erreur lors de la mise à jour: ${updateError.message}`,
      };
    }

    // Supprimer les anciennes inscriptions
    const { error: deleteEnrollmentsError } = await supabase
      .from("enrollments")
      .delete()
      .eq("student_id", studentId);

    if (deleteEnrollmentsError) {
      console.error("Erreur suppression anciennes inscriptions:", deleteEnrollmentsError);
    }

    // Ajouter les nouvelles inscriptions
    if (selectedCourses.length > 0) {
      const enrollmentInserts = selectedCourses.map(courseId => ({
        student_id: studentId,
        course_id: courseId,
        start_date: new Date().toISOString().split("T")[0],
        status: "active",
        created_at: new Date().toISOString(),
      }));

      const { error: enrollmentsError } = await supabase
        .from("enrollments")
        .insert(enrollmentInserts);

      if (enrollmentsError) {
        console.error("Erreur ajout nouvelles inscriptions:", enrollmentsError);
      }
    }

    revalidatePath("/(admin)/families");
    revalidatePath("/(admin)/students");

    return {
      message: `${firstName} ${lastName} a été mis(e) à jour avec succès !`,
      success: true,
    };
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return {
      message: "Une erreur inattendue s'est produite.",
    };
  }
}

// Action pour supprimer un étudiant
export type DeleteStudentState = {
  message?: string | null;
  success?: boolean;
};

export async function deleteStudent(
  prevState: DeleteStudentState,
  formData: FormData
): Promise<DeleteStudentState> {
  const studentId = formData.get("studentId") as string;

  if (!studentId) {
    return {
      message: "ID étudiant manquant.",
    };
  }

  try {
    // Récupérer les infos de l'étudiant avant suppression (pour le message)
    const { data: student, error: fetchError } = await supabase
      .from("students")
      .select("first_name, last_name")
      .eq("id", studentId)
      .single();

    if (fetchError) {
      return {
        message: "Étudiant introuvable.",
      };
    }

    // Supprimer l'étudiant (les enrollments seront supprimés automatiquement par CASCADE)
    const { error: deleteError } = await supabase.from("students").delete().eq("id", studentId);

    if (deleteError) {
      console.error("Erreur suppression étudiant:", deleteError);
      return {
        message: `Erreur lors de la suppression: ${deleteError.message}`,
      };
    }

    revalidatePath("/(admin)/families");
    revalidatePath("/(admin)/students");

    return {
      message: `${student.first_name} ${student.last_name} a été supprimé(e) avec succès.`,
      success: true,
    };
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return {
      message: "Une erreur inattendue s'est produite.",
    };
  }
}
