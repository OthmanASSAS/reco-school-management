"use server";

import { z } from "zod";
import supabase from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { getFormValue, BaseState } from "./common";

// Schéma de validation pour une famille
const FamilySchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis."),
  lastName: z.string().min(1, "Le nom de famille est requis."),
  email: z.string().email("Email invalide."),
  phone: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
});

export type FamilyState = BaseState & {
  errors?: Partial<Record<keyof z.infer<typeof FamilySchema>, string[]>>;
};

// Plus besoin de cette fonction, elle est dans common.ts

export async function createFamily(
  prevState: FamilyState,
  formData: FormData
): Promise<FamilyState> {
  // Validation des données du formulaire
  const validatedFields = FamilySchema.safeParse({
    firstName: getFormValue(formData, "firstName"),
    lastName: getFormValue(formData, "lastName"),
    email: getFormValue(formData, "email"),
    phone: getFormValue(formData, "phone") || null,
    address: getFormValue(formData, "address") || null,
    postalCode: getFormValue(formData, "postalCode") || null,
    city: getFormValue(formData, "city") || null,
  });

  if (!validatedFields.success) {
    const formattedErrors = validatedFields.error.format();
    return {
      errors: {
        firstName: formattedErrors.firstName?._errors,
        lastName: formattedErrors.lastName?._errors,
        email: formattedErrors.email?._errors,
        phone: formattedErrors.phone?._errors,
        address: formattedErrors.address?._errors,
        postalCode: formattedErrors.postalCode?._errors,
        city: formattedErrors.city?._errors,
      },
      message: "Champs manquants ou invalides.",
      success: false,
    };
  }

  const family = validatedFields.data;

  try {
    // 1. Vérifier si la famille existe déjà (même email ou même nom+prénom)
    const { data: existingFamilies, error: checkError } = await supabase
      .from("families")
      .select("id, first_name, last_name, email")
      .or(
        `email.eq.${family.email},and(first_name.eq.${family.firstName},last_name.eq.${family.lastName})`
      );

    if (checkError) {
      console.error("Erreur vérification famille:", checkError);
      return {
        message: "Erreur lors de la vérification de la famille.",
        success: false,
      };
    }

    // 2. Si famille existe déjà
    if (existingFamilies && existingFamilies.length > 0) {
      const existing = existingFamilies[0];
      return {
        message: `Une famille existe déjà avec ces informations : ${existing.first_name} ${existing.last_name} (${existing.email})`,
        success: false,
      };
    }

    // 3. Créer la nouvelle famille
    const { data: newFamily, error: insertError } = await supabase
      .from("families")
      .insert([
        {
          first_name: family.firstName,
          last_name: family.lastName,
          email: family.email,
          phone: family.phone,
          address: family.address,
          postal_code: family.postalCode,
          city: family.city,
        },
      ])
      .select("id, first_name, last_name")
      .single();

    if (insertError) {
      console.error("Erreur création famille:", insertError);
      return {
        message: `Erreur lors de la création de la famille : ${insertError.message}`,
        success: false,
      };
    }

    // 4. Revalider la page pour actualiser la liste
    revalidatePath("/admin/families");

    return {
      message: `Famille ${newFamily.first_name} ${newFamily.last_name} créée avec succès !`,
      success: true,
    };
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return {
      message: "Une erreur inattendue s'est produite.",
      success: false,
    };
  }
}

export async function updateFamily(
  familyId: string,
  prevState: FamilyState,
  formData: FormData
): Promise<FamilyState> {
  // Validation identique à createFamily
  const validatedFields = FamilySchema.safeParse({
    firstName: getFormValue(formData, "firstName"),
    lastName: getFormValue(formData, "lastName"),
    email: getFormValue(formData, "email"),
    phone: getFormValue(formData, "phone") || null,
    address: getFormValue(formData, "address") || null,
    postalCode: getFormValue(formData, "postalCode") || null,
    city: getFormValue(formData, "city") || null,
  });

  if (!validatedFields.success) {
    const formattedErrors = validatedFields.error.format();
    return {
      errors: {
        firstName: formattedErrors.firstName?._errors,
        lastName: formattedErrors.lastName?._errors,
        email: formattedErrors.email?._errors,
        phone: formattedErrors.phone?._errors,
        address: formattedErrors.address?._errors,
        postalCode: formattedErrors.postalCode?._errors,
        city: formattedErrors.city?._errors,
      },
      message: "Champs manquants ou invalides.",
      success: false,
    };
  }

  const family = validatedFields.data;

  try {
    // Vérifier si email existe déjà pour une autre famille
    const { data: existingFamilies, error: checkError } = await supabase
      .from("families")
      .select("id")
      .eq("email", family.email)
      .neq("id", familyId);

    if (checkError) {
      return {
        message: "Erreur lors de la vérification de l'email.",
        success: false,
      };
    }

    if (existingFamilies && existingFamilies.length > 0) {
      return {
        message: "Cet email est déjà utilisé par une autre famille.",
        success: false,
      };
    }

    
    // Mettre à jour la famille
    const { error: updateError, data: updateData } = await supabase
      .from("families")
      .update({
        first_name: family.firstName,
        last_name: family.lastName,
        email: family.email,
        phone: family.phone,
        address: family.address,
        postal_code: family.postalCode,
        city: family.city,
      })
      .eq("id", familyId)
      .select();
    

    if (updateError) {
      console.error("Erreur mise à jour famille:", updateError);
      return {
        message: `Erreur lors de la mise à jour : ${updateError.message}`,
        success: false,
      };
    }

    revalidatePath("/admin/families");

    return {
      message: "Famille mise à jour avec succès !",
      success: true,
    };
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return {
      message: "Une erreur inattendue s'est produite.",
      success: false,
    };
  }
}

export async function deleteFamily(
  familyId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Vérifier si la famille a des étudiants
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("id")
      .eq("family_id", familyId);

    if (studentsError) {
      return {
        success: false,
        message: "Erreur lors de la vérification des étudiants.",
      };
    }

    if (students && students.length > 0) {
      return {
        success: false,
        message: `Impossible de supprimer : cette famille a ${students.length} étudiant(s) inscrit(s).`,
      };
    }

    // Supprimer la famille
    const { error: deleteError } = await supabase.from("families").delete().eq("id", familyId);

    if (deleteError) {
      console.error("Erreur suppression famille:", deleteError);
      return {
        success: false,
        message: `Erreur lors de la suppression : ${deleteError.message}`,
      };
    }

    revalidatePath("/admin/families");

    return {
      success: true,
      message: "Famille supprimée avec succès !",
    };
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return {
      success: false,
      message: "Une erreur inattendue s'est produite.",
    };
  }
}
