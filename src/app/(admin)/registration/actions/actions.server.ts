"use server";

import supabase from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export type OnsiteRegistrationState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export type OnsiteRegistrationPayload = {
  schoolYearId: string;
  // Famille existante OU nouvelle
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
  // Élèves existants ou nouveaux
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
  // Attribution des cours par élève
  enrollments: Array<{
    studentRefIndex: number; // index dans students[]
    courseIds: string[]; // course_id (pas instance)
  }>;
  // Paiement optionnel famille
  payment?: {
    amount_cash?: number;
    amount_card?: number;
    amount_transfer?: number;
    refund_amount?: number;
    books?: boolean;
    remarks?: string;
    cheques?: any[];
  } | null;
  // Optionnel: lier des préinscriptions existantes à compléter
  registrationIdsToComplete?: string[];
};

export async function createOnsiteRegistration(
  _prev: OnsiteRegistrationState,
  formData: FormData
): Promise<OnsiteRegistrationState> {
  try {
    const payloadStr = formData.get("payload") as string;
    const payload: OnsiteRegistrationPayload = JSON.parse(payloadStr);

    const {
      schoolYearId,
      familyId: maybeFamilyId,
      newFamily,
      students,
      enrollments,
      payment,
      registrationIdsToComplete,
    } = payload;

    // 1) Upsert famille
    let familyId = maybeFamilyId || null;
    if (!familyId) {
      if (!newFamily) {
        return { message: "Famille requise", errors: { family: ["Famille inexistante"] } };
      }
      const { data: familyInsert, error: familyError } = await supabase
        .from("families")
        .insert({
          first_name: newFamily.first_name,
          last_name: newFamily.last_name,
          email: newFamily.email,
          phone: newFamily.phone || null,
          address: newFamily.address || null,
          postal_code: newFamily.postal_code || null,
          city: newFamily.city || null,
        })
        .select("id")
        .single();
      if (familyError) return { message: familyError.message };
      familyId = familyInsert.id;
    }

    // 2) Upsert élèves
    const studentIds: string[] = [];
    for (let i = 0; i < students.length; i++) {
      const s = students[i] as any;
      if (s.isNew) {
        const { data: studentInsert, error: studentError } = await supabase
          .from("students")
          .insert({
            family_id: familyId,
            first_name: s.first_name,
            last_name: s.last_name,
            birth_date: s.birth_date,
            registration_type: s.registration_type,
            notes: s.notes || null,
          })
          .select("id")
          .single();
        if (studentError) return { message: studentError.message };
        studentIds.push(studentInsert.id);
      } else {
        studentIds.push(s.id);
      }
    }

    // 3) Créer les enrollments avec school_year_id
    const enrollmentRows: any[] = [];
    for (const e of enrollments) {
      const sid = studentIds[e.studentRefIndex];
      for (const courseId of e.courseIds) {
        enrollmentRows.push({
          student_id: sid,
          course_id: courseId,
          school_year_id: schoolYearId,
          start_date: new Date().toISOString().split("T")[0],
          status: "active",
        });
      }
    }
    if (enrollmentRows.length > 0) {
      const { error: enrollmentsError } = await supabase.from("enrollments").insert(enrollmentRows);
      if (enrollmentsError) return { message: enrollmentsError.message };
    }

    // 4) Paiement famille optionnel avec school_year_id
    if (payment) {
      const { error: paymentError } = await supabase.from("payments").insert({
        family_id: familyId,
        school_year_id: schoolYearId,
        amount_cash: payment.amount_cash || 0,
        amount_card: payment.amount_card || 0,
        amount_transfer: payment.amount_transfer || 0,
        refund_amount: payment.refund_amount || 0,
        books: payment.books || false,
        remarks: payment.remarks || null,
        cheques: payment.cheques || null,
      });
      if (paymentError) return { message: paymentError.message };
    }

    // 5) Marquer des préinscriptions comme complétées (optionnel)
    if (registrationIdsToComplete && registrationIdsToComplete.length > 0) {
      const { error: regErr } = await supabase
        .from("registrations")
        .update({ status: "completed" })
        .in("id", registrationIdsToComplete);
      if (regErr) return { message: regErr.message };
    }

    // Revalidate
    revalidatePath("/(admin)/registration");
    revalidatePath("/(admin)/families");
    revalidatePath("/(admin)/students");

    return { success: true, message: "Inscription enregistrée" };
  } catch (e: any) {
    return { message: e?.message || "Erreur serveur" };
  }
}
