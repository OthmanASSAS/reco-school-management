"use server";

import { z } from "zod";
import supabase from "@/lib/supabase";

const SearchFamilySchema = z.object({
  email: z.string().email("Email invalide"),
  familyName: z.string().min(1, "Le nom de famille est requis"),
});

export type SearchFamilyState = {
  family?: {
    id: string;
    // Note: Pas d'autres données pour la sécurité
  };
  error?: string;
  success?: boolean;
};

function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export async function searchFamily(
  prevState: SearchFamilyState,
  formData: FormData
): Promise<SearchFamilyState> {
  const validatedFields = SearchFamilySchema.safeParse({
    email: formData.get("email"),
    familyName: formData.get("familyName"),
  });

  if (!validatedFields.success) {
    return {
      error: "Veuillez remplir correctement l'email et le nom de famille",
    };
  }

  const { email, familyName } = validatedFields.data;

  try {
    // Recherche famille - On vérifie seulement l'existence, pas de données sensibles retournées
    const { data: familyData, error } = await supabase
      .from("families")
      .select("id")
      .eq("email", email)
      .ilike("last_name", familyName)
      .single();

    if (error || !familyData) {
      return {
        error: "Famille non trouvée. Vérifiez l'email et le nom de famille saisis.",
      };
    }

    // Retour sécurisé - seulement l'ID pour usage interne
    return {
      family: {
        id: familyData.id,
      },
      success: true,
    };
  } catch (error) {
    console.error("Erreur recherche famille:", error);
    return {
      error: "Erreur lors de la recherche. Veuillez réessayer.",
    };
  }
}
