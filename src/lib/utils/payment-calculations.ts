import { Family } from "@/types/families";

export interface DiscountSettings {
  startAt: number;
  step: number;
  mode: "cumulative" | "fixed";
}

/**
 * Filtre les enrollments par année scolaire avec fallback intelligent
 */
export function filterEnrollmentsBySchoolYear(
  enrollments: any[],
  schoolYearId: string | null,
  schoolYears: any[]
) {
  if (!schoolYearId) {
    return enrollments.filter(e => e.status === "active");
  }

  const schoolYear = schoolYears.find(y => y.id === schoolYearId);
  if (!schoolYear) {
    return [];
  }

  return enrollments.filter(enrollment => {
    const isActive = enrollment.status === "active";

    // Priorité absolue : school_year_id exact
    if (enrollment.school_year_id) {
      return isActive && enrollment.school_year_id === schoolYearId;
    }

    // Fallback : chevauchement de dates avec logique scolaire (septembre-août)
    const enrollmentDate = new Date(enrollment.start_date);
    const enrollmentMonth = enrollmentDate.getMonth() + 1; // 1-12
    const enrollmentYear = enrollmentDate.getFullYear();

    // Si le cours commence entre septembre (9) et décembre (12), c'est l'année scolaire en cours
    // Si le cours commence entre janvier (1) et août (8), c'est l'année scolaire précédente
    const enrollmentSchoolYear = enrollmentMonth >= 9 ? enrollmentYear : enrollmentYear - 1;

    const schoolYearStart = new Date(schoolYear.start_date).getFullYear();
    const schoolYearEnd = schoolYear.end_date
      ? new Date(schoolYear.end_date).getFullYear()
      : schoolYearStart + 1;

    const belongsToSchoolYear = enrollmentSchoolYear === schoolYearStart;

    return isActive && belongsToSchoolYear;
  });
}

/**
 * Calcule le montant total avec dégressivité familiale
 */
export function calculateFamilyTotal(
  family: Family,
  schoolYearId: string | null,
  schoolYears: any[],
  discountSettings: DiscountSettings
): number {
  const { startAt, step, mode } = discountSettings;

  const allEnrollments = family.students.flatMap(student =>
    filterEnrollmentsBySchoolYear(student.enrollments, schoolYearId, schoolYears)
  );

  let total = 0;
  allEnrollments.forEach((enrollment, idx) => {
    let price = parseFloat(enrollment.courses?.price || "0");

    // Appliquer la dégressivité à partir du 3e cours
    if (idx >= startAt - 1) {
      const reduction = mode === "cumulative" ? (idx - (startAt - 2)) * step : step;
      price = Math.max(0, price - reduction);
    }

    total += price;
  });

  return total;
}

/**
 * Calcule le montant payé pour une année scolaire
 */
export function calculatePaidAmount(
  family: Family,
  schoolYearId: string | null,
  schoolYears: any[]
): number {
  // Si pas d'année scolaire spécifiée, retourner tous les paiements
  if (!schoolYearId) {
    let totalPaid = 0;
    (family.payments || []).forEach(payment => {
      let amount = 0;
      amount += payment.amount_cash || 0;
      amount += payment.amount_card || 0;
      amount += payment.amount_transfer || 0;

      // Gérer les chèques (JSON ou array)
      const cheques =
        typeof payment.cheques === "string"
          ? JSON.parse(payment.cheques || "[]")
          : payment.cheques || [];

      const chequesAmount = cheques.reduce(
        (sum: number, lot: any) => sum + (lot.count || 0) * (lot.amount || 0),
        0
      );
      amount += chequesAmount;

      // Soustraire les remboursements
      amount -= payment.refund_amount || 0;

      totalPaid += amount;
    });
    return totalPaid;
  }

  const schoolYear = schoolYears.find(y => y.id === schoolYearId);
  if (!schoolYear) {
    return 0;
  }

  const schoolYearStart = new Date(schoolYear.start_date).getFullYear();

  let totalPaid = 0;

  (family.payments || []).forEach(payment => {
    // Priorité: si le paiement a un school_year_id, on compare directement
    if (payment.school_year_id) {
      if (payment.school_year_id !== schoolYearId) return;
    } else {
      // Fallback par date (logique septembre-août)
      const paymentDate = new Date(payment.created_at);
      const paymentMonth = paymentDate.getMonth() + 1;
      const paymentYear = paymentDate.getFullYear();
      const paymentSchoolYear = paymentMonth >= 9 ? paymentYear : paymentYear - 1;
      const belongsToSchoolYear = paymentSchoolYear === schoolYearStart;

      // Laisser passer les paiements récents pour ne pas surprendre lors du basculement d'année
      const isRecentPayment =
        new Date().getTime() - paymentDate.getTime() < 30 * 24 * 60 * 60 * 1000;
      if (!belongsToSchoolYear && !isRecentPayment) return;
    }

    let amount = 0;
    amount += payment.amount_cash || 0;
    amount += payment.amount_card || 0;
    amount += payment.amount_transfer || 0;

    const cheques =
      typeof payment.cheques === "string"
        ? JSON.parse(payment.cheques || "[]")
        : payment.cheques || [];
    const chequesAmount = cheques.reduce(
      (sum: number, lot: any) => sum + (lot.count || 0) * (lot.amount || 0),
      0
    );
    amount += chequesAmount;

    amount -= payment.refund_amount || 0;

    totalPaid += amount;
  });

  return totalPaid;
}

/**
 * Filtre les paiements par année scolaire
 */
export function filterPaymentsBySchoolYear(payments: any[], schoolYear: any): any[] {
  if (!schoolYear) return payments;

  const schoolYearStart = new Date(schoolYear.start_date).getFullYear();
  const schoolYearEnd = new Date(schoolYear.end_date).getFullYear();

  return payments.filter(payment => {
    // Priorité: equality par school_year_id si présent
    if (payment.school_year_id) {
      return payment.school_year_id === schoolYear.id;
    }

    // Fallback par date
    const paymentDate = new Date(payment.created_at);
    const paymentYear = paymentDate.getFullYear();

    const isInSchoolYear = paymentYear >= schoolYearStart && paymentYear <= schoolYearEnd;
    const isRecentPayment = new Date().getTime() - paymentDate.getTime() < 30 * 24 * 60 * 60 * 1000;

    return isInSchoolYear || isRecentPayment;
  });
}
