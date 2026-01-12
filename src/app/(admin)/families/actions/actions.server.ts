// /Users/oassas/Projets/inscription-app/src/app/(admin)/families/actions/actions.server.ts
"use server";

import { getFamilies } from "@/lib/dal/families";
import { revalidatePath } from "next/cache";

/**
 * Action pour récupérer les familles à jour depuis le serveur.
 * Utile pour rafraîchir la liste après une action.
 */
export async function fetchFamiliesAction() {
  return await getFamilies();
}
