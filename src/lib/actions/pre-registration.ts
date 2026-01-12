"use server";
import { processPreRegistrationTransaction, type PreRegistrationPayload } from "@/lib/dal/registration";

export async function preRegister(formData: FormData) {
  try {
    const family = JSON.parse(formData.get("family") as string);
    const students = JSON.parse(formData.get("students") as string);
    const appointmentDay = formData.get("appointmentDay") as string;

    // Préparation du payload pour le DAL (respect du contrat d'interface)
    const payload: PreRegistrationPayload = {
      family: {
        familyName: family.familyName,
        parentFirstName: family.parentFirstName,
        contactEmail: family.contactEmail,
        contactPhone: family.contactPhone,
        address: family.address,
        postalCode: family.postalCode,
        city: family.city,
      },
      students: students.map((s: any) => ({
        firstName: s.firstName,
        lastName: s.lastName,
        birthDate: s.birthDate,
        registration_type: s.registration_type,
      })),
      appointmentDay,
    };

    // Appel de la transaction atomique Prisma
    const result = await processPreRegistrationTransaction(payload);

    return { 
      success: true, 
      messages: result.messages, 
      status: 201 
    };
  } catch (e: unknown) {
    console.error("Erreur lors de la pré-inscription Prisma:", e);
    return { 
      error: e instanceof Error ? e.message : "Erreur serveur inconnue", 
      status: 500 
    };
  }
}
