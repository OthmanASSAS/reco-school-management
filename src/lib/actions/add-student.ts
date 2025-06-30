"use server";

import { z } from "zod";
import supabase from "@/lib/supabase";
import { revalidatePath } from "next/cache";

const AddStudentSchema = z.object({
  familyId: z.string().min(1, "ID famille requis"),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  birthDate: z.string().min(1, "La date de naissance est requise"),
  studentType: z.enum(["child", "adult"], { message: "Type d'élève requis" }),
  appointmentDay: z.string().optional().nullable(),
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
  const validatedFields = AddStudentSchema.safeParse({
    familyId: formData.get("familyId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    birthDate: formData.get("birthDate"),
    studentType: formData.get("studentType"),
    appointmentDay: formData.get("appointmentDay") || null,
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

  const { familyId, firstName, lastName, birthDate, studentType, appointmentDay } =
    validatedFields.data;

  try {
    // Vérifier que la famille existe
    const { data: familyExists, error: familyError } = await supabase
      .from("families")
      .select("id")
      .eq("id", familyId)
      .single();

    if (familyError || !familyExists) {
      return {
        message: "Famille introuvable. Veuillez recommencer la recherche.",
      };
    }

    // Créer l'étudiant
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
      return {
        message: `Erreur lors de la création de l'étudiant: ${studentError.message}`,
      };
    }

    // Créer le rendez-vous si fourni
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
        // On continue même si le RDV échoue
      }
    }

    // Revalidation des caches
    revalidatePath("/(admin)/families");
    revalidatePath("/(admin)/students");
    revalidatePath("/(admin)/appointments");

    return {
      message: `${firstName} ${lastName} a été ajouté(e) avec succès à votre famille ! Nous vous contacterons bientôt pour finaliser l'inscription.`,
      success: true,
    };
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return {
      message: "Une erreur inattendue s'est produite. Veuillez réessayer.",
    };
  }
}
