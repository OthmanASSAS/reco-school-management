// /Users/oassas/Projets/inscription-app/src/lib/dal/registration.ts
import { prisma } from "@/lib/prisma";

export type OnsiteRegistrationState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export type OnsiteRegistrationPayload = {
  schoolYearId: string;
  familyId?: string | null;
  newFamily?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    postal_code?: string | null;
    city?: string | null;
  } | null;
  students: Array<
    | { id: string; isNew?: false }
    | {
        isNew: true;
        first_name: string;
        last_name: string;
        birth_date: string;
        registration_type: "child" | "adult";
        notes?: string | null;
      }
  >;
  enrollments: Array<{
    studentRefIndex: number;
    courseIds: string[];
  }>;
  payment?: {
    amount_cash?: number;
    amount_card?: number;
    amount_transfer?: number;
    refund_amount?: number;
    books?: boolean;
    remarks?: string;
    cheques?: {
      count: number;
      amount: number;
      banque: string;
      nom: string;
    }[];
  } | null;
  registrationIdsToComplete?: string[];
};

/**
 * Traite une inscription complète dans une seule transaction atomique.
 * Soit tout passe, soit tout échoue.
 */
export async function processRegistrationTransaction(payload: OnsiteRegistrationPayload) {
  return await prisma.$transaction(async tx => {
    // 1. Gérer la famille
    let familyId = payload.familyId;

    if (!familyId && payload.newFamily) {
      const { first_name, last_name, email, phone, address, postal_code, city } = payload.newFamily;
      const family = await tx.family.create({
        data: {
          firstName: first_name,
          lastName: last_name,
          email: email,
          phone: phone,
          address: address,
          postalCode: postal_code,
          city: city,
        },
      });
      familyId = family.id;
    }

    if (!familyId) throw new Error("Une famille est requise pour l'inscription.");

    // 2. Gérer les élèves
    const studentIds: string[] = [];

    for (const student of payload.students) {
      if ("isNew" in student && student.isNew) {
        const { first_name, last_name, birth_date, registration_type, notes } = student;
        const newStudent = await tx.student.create({
          data: {
            familyId: familyId,
            firstName: first_name,
            lastName: last_name,
            birthDate: birth_date ? new Date(birth_date) : null,
            registrationType: registration_type,
            notes: notes,
          },
        });
        studentIds.push(newStudent.id);
      } else if ("id" in student) {
        studentIds.push(student.id);
      }
    }

    // 3. Créer les inscriptions (Enrollments)
    const enrollmentData = payload.enrollments.flatMap(enrollment => {
      const sId = studentIds[enrollment.studentRefIndex];
      return enrollment.courseIds.map(courseId => ({
        studentId: sId,
        courseId: courseId,
        schoolYearId: payload.schoolYearId,
        startDate: new Date(),
        status: "active",
      }));
    });

    if (enrollmentData.length > 0) {
      await tx.enrollment.createMany({
        data: enrollmentData,
      });
    }
    // 4. Créer le paiement (si présent dans le payload)
    if (payload.payment) {
      const { amount_cash, amount_card, amount_transfer, refund_amount, books, remarks, cheques } =
        payload.payment;

      await tx.payment.create({
        data: {
          familyId: familyId,
          schoolYearId: payload.schoolYearId,
          amountCash: amount_cash,
          amountCard: amount_card,
          amountTransfer: amount_transfer,
          refundAmount: refund_amount,
          books: books,
          remarks: remarks,
          cheques: cheques,
        },
      });
    }
    // 5. Marquer des préinscriptions comme complétées (optionnel)
    if (payload.registrationIdsToComplete && payload.registrationIdsToComplete.length > 0) {
      await tx.registration.updateMany({
        where: {
          id: { in: payload.registrationIdsToComplete },
        },
        data: {
          status: "completed",
        },
      });
    }

    return { familyId, studentIds };
  });
}
