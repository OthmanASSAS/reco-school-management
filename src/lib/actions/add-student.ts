"use server";

import { z } from "zod";
import supabase from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// Schema pour l'ajout d'un étudiant
const AddStudentSchema = z.object({
  familyId: z.string().min(1, "ID famille requis"),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  birthDate: z.string().min(1, "La date de naissance est requise"),
  registrationType: z.enum(["child", "adult"], { message: "Type d'élève requis" }),
  schoolYearId: z.string().min(1, "Année scolaire requise"),
});

export type AddStudentState = {
  errors?: {
    familyId?: string[];
    firstName?: string[];
    lastName?: string[];
    birthDate?: string[];
    registrationType?: string[];
    schoolYearId?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function addStudent(
  prevState: AddStudentState,
  formData: FormData
): Promise<AddStudentState> {
  const selectedCoursesString = formData.get("selectedCourses") as string;
  let selectedCourses: string[] = [];

  if (selectedCoursesString) {
    try {
      selectedCourses = JSON.parse(selectedCoursesString);
    } catch {
      console.warn("⚠️ JSON invalide pour selectedCourses, utilisation d'un tableau vide");
      selectedCourses = [];
    }
  }

  const validatedFields = AddStudentSchema.safeParse({
    familyId: formData.get("familyId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    birthDate: formData.get("birthDate"),
    registrationType: formData.get("registrationType"),
    schoolYearId: formData.get("schoolYearId"),
  });

  if (!validatedFields.success) {
    const formattedErrors = validatedFields.error.format();
    return {
      errors: {
        familyId: formattedErrors.familyId?._errors,
        firstName: formattedErrors.firstName?._errors,
        lastName: formattedErrors.lastName?._errors,
        birthDate: formattedErrors.birthDate?._errors,
        registrationType: formattedErrors.registrationType?._errors,
        schoolYearId: formattedErrors.schoolYearId?._errors,
      },
      message: "Champs manquants ou invalides.",
    };
  }

  const { familyId, firstName, lastName, birthDate, registrationType, schoolYearId } =
    validatedFields.data;

  try {
    // Ajouter l'étudiant
    const { data: newStudent, error: insertError } = await supabase
      .from("students")
      .insert({
        family_id: familyId,
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate,
        registration_type: registrationType,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Erreur ajout étudiant:", insertError);
      return {
        message: `Erreur lors de l'ajout: ${insertError.message}`,
      };
    }

    // Ajouter les inscriptions aux cours
    if (selectedCourses.length > 0) {
      console.log("📚 Création des enrollments pour:", selectedCourses);

      const enrollmentInserts = selectedCourses.map(courseId => ({
        student_id: newStudent.id,
        course_id: courseId,
        school_year_id: schoolYearId,
        start_date: new Date().toISOString().split("T")[0],
        status: "active",
        created_at: new Date().toISOString(),
      }));

      console.log("📝 Enrollments à créer:", enrollmentInserts);

      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("enrollments")
        .insert(enrollmentInserts)
        .select();

      if (enrollmentsError) {
        console.error("❌ Erreur ajout inscriptions:", enrollmentsError);
      } else {
        console.log("✅ Enrollments créés:", enrollmentsData);
      }
    } else {
      console.log("⚠️ Aucun cours sélectionné");
    }

    revalidatePath("/(admin)/families");
    revalidatePath("/(admin)/students");

    return {
      message: `${firstName} ${lastName} a été ajouté(e) avec succès !`,
      success: true,
    };
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return {
      message: "Une erreur inattendue s'est produite.",
    };
  }
}

// Schema pour la modification d'un étudiant
const UpdateStudentSchema = z.object({
  studentId: z.string().min(1, "ID étudiant requis"),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  birthDate: z.string().min(1, "La date de naissance est requise"),
  registrationType: z.enum(["child", "adult"], { message: "Type d'élève requis" }),
  schoolYearId: z.string().optional(),
});

export type UpdateStudentState = {
  errors?: {
    studentId?: string[];
    firstName?: string[];
    lastName?: string[];
    birthDate?: string[];
    registrationType?: string[];
    schoolYearId?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function updateStudent(
  prevState: UpdateStudentState,
  formData: FormData
): Promise<UpdateStudentState> {
  const selectedCoursesString = formData.get("selectedCourses") as string;
  const selectedCourses = selectedCoursesString ? JSON.parse(selectedCoursesString) : [];

  const validatedFields = UpdateStudentSchema.safeParse({
    studentId: formData.get("studentId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    birthDate: formData.get("birthDate"),
    registrationType: formData.get("registrationType"),
    schoolYearId: formData.get("schoolYearId"),
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
        schoolYearId: formattedErrors.schoolYearId?._errors,
      },
      message: "Champs manquants ou invalides.",
    };
  }

  const { studentId, firstName, lastName, birthDate, registrationType, schoolYearId } =
    validatedFields.data;

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

    // Supprimer les anciennes inscriptions pour cette année scolaire uniquement
    console.log("🗑️ Suppression des enrollments existants pour l'étudiant:", studentId);

    let schoolYearToUse = schoolYearId;

    // Si pas d'année fournie, prendre la plus récente
    if (!schoolYearToUse) {
      const { data: latestYear } = await supabase
        .from("school_years")
        .select("id")
        .order("start_date", { ascending: false })
        .limit(1)
        .single();

      schoolYearToUse = latestYear?.id;
    }

    if (!schoolYearToUse) {
      console.error("❌ Aucune année scolaire trouvée pour la suppression");
      return {
        message: "Erreur: aucune année scolaire trouvée. Veuillez contacter l'administrateur.",
        success: false,
      };
    }

    // Supprimer seulement les enrollments de l'année courante
    const { error: deleteEnrollmentsError } = await supabase
      .from("enrollments")
      .delete()
      .eq("student_id", studentId)
      .eq("school_year_id", schoolYearToUse);

    if (deleteEnrollmentsError) {
      console.error("❌ Erreur suppression anciennes inscriptions:", deleteEnrollmentsError);
      return {
        message: `Erreur lors de la suppression des anciens cours: ${deleteEnrollmentsError.message}`,
        success: false,
      };
    } else {
      console.log("✅ Anciens enrollments supprimés pour l'année:", schoolYearToUse);
    }

    // Ajouter les nouvelles inscriptions
    if (selectedCourses.length > 0) {
      const enrollmentInserts = selectedCourses.map((courseId: string) => ({
        student_id: studentId,
        course_id: courseId,
        school_year_id: schoolYearToUse,
        start_date: new Date().toISOString().split("T")[0],
        status: "active",
        created_at: new Date().toISOString(),
      }));

      console.log("📝 Enrollments à créer (update):", enrollmentInserts);

      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("enrollments")
        .insert(enrollmentInserts)
        .select();

      if (enrollmentsError) {
        console.error("❌ Erreur ajout nouvelles inscriptions:", enrollmentsError);
        return {
          message: `Erreur lors de l'ajout des cours: ${enrollmentsError.message}`,
          success: false,
        };
      } else {
        console.log("✅ Enrollments créés (update):", enrollmentsData);
      }
    }

    // Revalidation des pages concernées
    revalidatePath("/(admin)/families");
    revalidatePath("/(admin)/students");

    console.log("✅ Modification étudiant terminée avec succès");

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
