"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- ADD STUDENT ---
const AddStudentSchema = z.object({
  familyId: z.string().min(1, "ID famille requis"),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  birthDate: z.string().min(1, "La date de naissance est requise"),
  studentType: z.enum(["child", "adult"], { message: "Type d'élève requis" }),
  appointmentDay: z.string().optional().nullable(),
  schoolYearId: z.string().min(1, "Année scolaire requise"),
});

export type AddStudentState = {
  errors?: {
    familyId?: string[];
    firstName?: string[];
    lastName?: string[];
    birthDate?: string[];
    studentType?: string[];
    appointmentDay?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function addStudent(
  prevState: AddStudentState,
  formData: FormData
): Promise<AddStudentState> {
  const selectedCourses = formData.getAll("selectedCourses") as string[];
  const validatedFields = AddStudentSchema.safeParse({
    familyId: formData.get("familyId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    birthDate: formData.get("birthDate"),
    studentType: formData.get("studentType"),
    appointmentDay: formData.get("appointmentDay") || null,
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
        studentType: formattedErrors.studentType?._errors,
        appointmentDay: formattedErrors.appointmentDay?._errors,
      },
      message: "Champs manquants ou invalides.",
    };
  }
  const supabase = createClient();
  const { familyId, firstName, lastName, birthDate, studentType, appointmentDay, schoolYearId } =
    validatedFields.data;
  try {
    const { data: familyExists, error: familyError } = await supabase
      .from("families")
      .select("id")
      .eq("id", familyId)
      .single();
    if (familyError || !familyExists) {
      return { message: "Famille introuvable. Veuillez recommencer la recherche." };
    }
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .insert([
        {
          family_id: familyId,
          first_name: firstName,
          last_name: lastName,
          birth_date: birthDate,
          registration_type: studentType,
          already_registered: false,
          level: null,
          notes: `Ajouté via formulaire famille existante le ${new Date().toLocaleDateString("fr-FR")}`,
        },
      ])
      .select("id")
      .single();
    if (studentError) {
      console.error("Erreur création étudiant:", studentError);
      return { message: `Erreur lors de la création de l'étudiant: ${studentError.message}` };
    }
    // Associer les cours sélectionnés à l'étudiant
    if (selectedCourses.length > 0) {
      const studentCourseInserts = selectedCourses.map(courseId => ({
        student_id: studentData.id,
        course_id: courseId,
        school_year_id: schoolYearId, // Ajouter l'année scolaire
        start_date: new Date().toISOString().split("T")[0],
        status: "active",
        created_at: new Date().toISOString(),
      }));
      const { error: coursesError } = await supabase
        .from("enrollments")
        .insert(studentCourseInserts);
      if (coursesError) {
        console.error("Erreur association cours:", coursesError);
      }
    }
    if (appointmentDay) {
      const { error: appointmentError } = await supabase.from("appointments").insert([
        {
          student_id: studentData.id,
          date: appointmentDay,
          created_at: new Date().toISOString(),
        },
      ]);
      if (appointmentError) {
        console.error("Erreur création rendez-vous:", appointmentError);
      }
    }
    revalidatePath("/(admin)/families");
    revalidatePath("/(admin)/students");
    revalidatePath("/(admin)/appointments");
    const coursesMessage =
      selectedCourses.length > 0 ? ` et inscrit(e) à ${selectedCourses.length} cours` : "";
    return {
      message: `${firstName} ${lastName} a été ajouté(e) avec succès à votre famille${coursesMessage} ! Nous vous contacterons bientôt pour finaliser l'inscription.`,
      success: true,
    };
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return { message: "Une erreur inattendue s'est produite. Veuillez réessayer." };
  }
}

// --- UPDATE STUDENT ---
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
// Version avec debug complet de l'ID pour comprendre le problème :

export async function updateStudent(
  prevState: UpdateStudentState,
  formData: FormData
): Promise<UpdateStudentState> {
  const selectedCourses = formData.getAll("selectedCourses") as string[];

  const rawStudentId = formData.get("studentId");

  const validatedFields = UpdateStudentSchema.safeParse({
    studentId: rawStudentId,
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    birthDate: formData.get("birthDate"),
    registrationType: formData.get("registrationType"),
  });

  if (!validatedFields.success) {
    console.error("❌ Validation échouée:", validatedFields.error);
    return { message: "Champs manquants ou invalides." };
  }

  const supabase = createClient();
  const { studentId, firstName, lastName, birthDate, registrationType } = validatedFields.data;

  try {
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
      console.error("❌ Erreur UPDATE:", updateError);
      return { message: `Erreur lors de la mise à jour: ${updateError.message}` };
    }

    const { error: deleteError } = await supabase
      .from("enrollments")
      .delete()
      .eq("student_id", studentId);

    if (deleteError) {
      console.error("❌ Erreur suppression enrollments:", deleteError);
    }

    if (selectedCourses.length > 0) {
      const enrollmentInserts = selectedCourses.map(courseId => ({
        student_id: studentId,
        course_id: courseId,
        start_date: new Date().toISOString().split("T")[0],
        status: "active",
      }));

      const { error: insertError } = await supabase.from("enrollments").insert(enrollmentInserts);

      if (insertError) {
        console.error("❌ Erreur ajout enrollments:", insertError);
      }
    }

    revalidatePath("/(admin)/families");
    revalidatePath("/(admin)/students");

    return {
      message: `${firstName} ${lastName} a été mis(e) à jour avec succès !`,
      success: true,
    };
  } catch (error) {
    console.error("💥 Erreur inattendue:", error);
    return { message: "Une erreur inattendue s'est produite." };
  }
}
// --- DELETE STUDENT ---
export type DeleteStudentState = {
  message?: string | null;
  success?: boolean;
};

export async function deleteStudent(
  prevState: DeleteStudentState,
  formData: FormData
): Promise<DeleteStudentState> {
  const supabase = createClient();
  const studentId = formData.get("studentId") as string;
  if (!studentId) {
    return { message: "ID étudiant manquant." };
  }
  try {
    const { data: student, error: fetchError } = await supabase
      .from("students")
      .select("first_name, last_name")
      .eq("id", studentId)
      .single();
    if (fetchError) {
      return { message: "Étudiant introuvable." };
    }
    const { error: deleteError } = await supabase.from("students").delete().eq("id", studentId);
    if (deleteError) {
      console.error("Erreur suppression étudiant:", deleteError);
      return { message: `Erreur lors de la suppression: ${deleteError.message}` };
    }
    revalidatePath("/(admin)/families");
    revalidatePath("/(admin)/students");
    return {
      message: `${student.first_name} ${student.last_name} a été supprimé(e) avec succès.`,
      success: true,
    };
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return { message: "Une erreur inattendue s'est produite." };
  }
}
