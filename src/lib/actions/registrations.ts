"use server";

import { z } from "zod";
import supabase from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { getFormValue, getFormBoolean } from "./common";

// Schémas alignés avec la vraie structure BDD
const StudentSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis."),
  lastName: z.string().min(1, "Le nom de famille est requis."),
  birthDate: z.string().min(1, "La date de naissance est requise."),
  registrationType: z.enum(["child", "adult"]),
  alreadyRegistered: z.boolean(),
  notes: z.string().optional().nullable(),
});

const RegistrationSchema = z.object({
  familyId: z.string().min(1, "La famille est requise."),
  schoolYearId: z.string().min(1, "L'année scolaire est requise."),
  courseInstanceId: z.string().min(1, "Le cours est requis."),
  isWaitingList: z.boolean(),
  appointmentDay: z.string().optional().nullable(),
});

const FormSchema = z.object({
  student: StudentSchema,
  registration: RegistrationSchema,
});

export type RegistrationState = {
  errors?: {
    student?: Partial<Record<keyof z.infer<typeof StudentSchema>, string[]>>;
    registration?: Partial<Record<keyof z.infer<typeof RegistrationSchema>, string[]>>;
  };
  message?: string | null;
};

// Fonction pour convertir les types UI vers BDD
function mapRegistrationType(uiType: string): "child" | "adult" {
  const mapping: Record<string, "child" | "adult"> = {
    Enfant: "child",
    Adulte: "adult",
  };
  return mapping[uiType] || "child";
}

export async function createRegistration(
  prevState: RegistrationState,
  formData: FormData
): Promise<RegistrationState> {
  // Récupération et conversion des données
  const rawRegistrationType = getFormValue(formData, "registrationType");
  const mappedRegistrationType = mapRegistrationType(rawRegistrationType);

  // Validation des données du formulaire avec conversion appropriée
  const validatedFields = FormSchema.safeParse({
    student: {
      firstName: getFormValue(formData, "firstName"),
      lastName: getFormValue(formData, "lastName"),
      birthDate: getFormValue(formData, "birthDate"),
      registrationType: mappedRegistrationType,
      alreadyRegistered: getFormBoolean(formData, "alreadyRegistered"),
      notes: getFormValue(formData, "notes") || null,
    },
    registration: {
      familyId: getFormValue(formData, "familyId"),
      schoolYearId: getFormValue(formData, "schoolYearId"),
      courseInstanceId: getFormValue(formData, "courseInstanceId"),
      isWaitingList: getFormBoolean(formData, "isWaitingList"),
      appointmentDay: getFormValue(formData, "appointmentDay") || null,
    },
  });

  if (!validatedFields.success) {
    const formattedErrors = validatedFields.error.format();

    return {
      errors: {
        student: {
          firstName: formattedErrors.student?.firstName?._errors,
          lastName: formattedErrors.student?.lastName?._errors,
          birthDate: formattedErrors.student?.birthDate?._errors,
          registrationType: formattedErrors.student?.registrationType?._errors,
          alreadyRegistered: formattedErrors.student?.alreadyRegistered?._errors,
          notes: formattedErrors.student?.notes?._errors,
        },
        registration: {
          familyId: formattedErrors.registration?.familyId?._errors,
          schoolYearId: formattedErrors.registration?.schoolYearId?._errors,
          courseInstanceId: formattedErrors.registration?.courseInstanceId?._errors,
          isWaitingList: formattedErrors.registration?.isWaitingList?._errors,
          appointmentDay: formattedErrors.registration?.appointmentDay?._errors,
        },
      },
      message: "Champs manquants ou invalides. Échec de la création de l'inscription.",
    };
  }

  const { student, registration } = validatedFields.data;

  try {
    // Insertion de l'étudiant
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .insert([
        {
          family_id: registration.familyId,
          last_name: student.lastName,
          first_name: student.firstName,
          birth_date: student.birthDate,
          level: null,
          registration_type: student.registrationType,
          already_registered: student.alreadyRegistered,
          notes: student.notes,
        },
      ])
      .select("id")
      .single();

    if (studentError) {
      console.error("Erreur création étudiant:", studentError);
      return {
        message: `Erreur de base de données: Échec de la création de l'étudiant. ${studentError.message}`,
      };
    }

    // TEST : Essayons d'abord de voir si c'est directement un course_id
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("id, name")
      .eq("id", registration.courseInstanceId)
      .single();

    if (courseData) {
      // C'est un course_id direct, pas un course_instance_id

      // 🎯 NOUVEAU : Créer l'enrollment directement
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from("enrollments")
        .insert([
          {
            student_id: studentData.id,
            course_id: registration.courseInstanceId, // Utiliser directement comme course_id
            start_date: new Date().toISOString().split("T")[0],
            status: registration.isWaitingList ? "pending" : "active",
          },
        ])
        .select("id")
        .single();

      if (enrollmentError) {
        console.error("Erreur création enrollment:", enrollmentError);
        return {
          message: `Erreur de base de données: Échec de la création de l'inscription au cours. ${enrollmentError.message}`,
        };
      }

      // Pas besoin de créer de registration si on utilise enrollments
    } else {
      // Récupérer les infos de la course_instance sélectionnée
      const { data: courseInstanceData, error: courseInstanceError } = await supabase
        .from("course_instances")
        .select("id, course_id")
        .eq("id", registration.courseInstanceId)
        .single();

      if (courseInstanceError || !courseInstanceData) {
        console.error("Erreur récupération course_instance:", courseInstanceError);

        // Debug supplémentaire : voir tous les course_instances
        const { data: allInstances } = await supabase
          .from("course_instances")
          .select("id, course_id")
          .limit(5);

        return {
          message: `Erreur: Instance de cours introuvable. ID recherché: ${registration.courseInstanceId}. ${courseInstanceError?.message}`,
        };
      }

      // 🎯 NOUVEAU : Créer l'enrollment dans la table enrollments
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from("enrollments")
        .insert([
          {
            student_id: studentData.id,
            course_id: courseInstanceData.course_id, // Utiliser le course_id de l'instance
            start_date: new Date().toISOString().split("T")[0], // Date d'aujourd'hui
            status: registration.isWaitingList ? "pending" : "active",
          },
        ])
        .select("id")
        .single();

      if (enrollmentError) {
        console.error("Erreur création enrollment:", enrollmentError);
        return {
          message: `Erreur de base de données: Échec de la création de l'inscription au cours. ${enrollmentError.message}`,
        };
      }

      // Insertion de l'inscription (table registrations - si vous en avez encore besoin)
      const { error: registrationError } = await supabase.from("registrations").insert([
        {
          student_id: studentData.id,
          course_instance_id: courseInstanceData.id, // Utiliser l'ID de l'instance
          is_waiting_list: registration.isWaitingList,
          status: "pending",
          family_id: registration.familyId,
          school_year_id: registration.schoolYearId,
          appointment_day: registration.appointmentDay,
          enrollment_id: enrollmentData.id, // Lier à l'enrollment créé
        },
      ]);

      if (registrationError) {
        console.error("Erreur création inscription:", registrationError);
        return {
          message: `Erreur de base de données: Échec de la création de l'inscription. ${registrationError.message}`,
        };
      }
    }

    // Revalidation des caches
    revalidatePath("/(admin)/registration");
    revalidatePath("/(admin)/students");
    revalidatePath("/(admin)/families");

    return {
      message: "Inscription créée avec succès !",
    };
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return {
      message: "Une erreur inattendue s'est produite. Veuillez réessayer.",
    };
  }
}
