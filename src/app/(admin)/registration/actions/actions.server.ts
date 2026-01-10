"use server";

import { processRegistrationTransaction } from "@/lib/dal/registration";
import type { OnsiteRegistrationPayload, OnsiteRegistrationState } from "@/lib/dal/registration";
import { revalidatePath } from "next/cache";

export type { OnsiteRegistrationState, OnsiteRegistrationPayload };

export async function createOnsiteRegistration(
  _prev: OnsiteRegistrationState,
  formData: FormData
): Promise<OnsiteRegistrationState> {
  try {
    const payloadStr = formData.get("payload") as string;
    const payload: OnsiteRegistrationPayload = JSON.parse(payloadStr);

    // Appel de la transaction Prisma
    await processRegistrationTransaction(payload);

    // Revalidate
    revalidatePath("/(admin)/registration");
    revalidatePath("/(admin)/families");
    revalidatePath("/(admin)/students");

    return { success: true, message: "Inscription enregistrée" };
  } catch (e: unknown) {
    console.error("Erreur lors de l'inscription onsite:", e);
    return { message: e instanceof Error ? e.message : "Erreur serveur" };
  }
}
