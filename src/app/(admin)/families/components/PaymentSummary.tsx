"use client";

import { Family, SchoolYear } from "@/types/families";
import {
  calculateFamilyTotal,
  calculatePaidAmount,
  filterEnrollmentsBySchoolYear,
  DiscountSettings,
} from "@/lib/utils/payment-calculations";
import { fetchCourseDiscountSettings } from "@/lib/settings";
import { useEffect, useState } from "react";
import PaymentSummaryCard from "./PaymentSummaryCard";
import StudentCoursesCard from "./StudentCoursesCard";
import PaymentHistoryCard from "./PaymentHistoryCard";

interface PaymentSummaryProps {
  family: Family;
  currentSchoolYear: string | null;
  schoolYears: SchoolYear[];
  onStartPayment: () => void;
  onClose: () => void;
}

export default function PaymentSummary({
  family,
  currentSchoolYear,
  schoolYears,
  onStartPayment,
  onClose,
}: PaymentSummaryProps) {
  const [discountSettings, setDiscountSettings] = useState<DiscountSettings>({
    startAt: 3,
    step: 25,
    mode: "cumulative",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourseDiscountSettings()
      .then(settings => {
        setDiscountSettings(settings);
        setLoading(false);
      })
      .catch(err => {
        setError("Erreur lors du chargement des paramètres de réduction.");
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Chargement du résumé...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const totalAmount = calculateFamilyTotal(
    family,
    currentSchoolYear,
    schoolYears,
    discountSettings
  );
  const paidAmount = calculatePaidAmount(family, currentSchoolYear, schoolYears);
  const schoolYearLabel =
    schoolYears.find(y => y.id === currentSchoolYear)?.label || "Année en cours";

  return (
    <div className="space-y-6">
      <PaymentSummaryCard
        totalAmount={totalAmount}
        paidAmount={paidAmount}
        schoolYearLabel={schoolYearLabel}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold">Détail des cours</h4>
          {family.students.map(student => (
            <StudentCoursesCard
              key={student.id}
              student={student}
              enrollments={filterEnrollmentsBySchoolYear(
                student.enrollments,
                currentSchoolYear,
                schoolYears
              )}
              totalPaid={paidAmount} // This prop might be simplified
              totalDue={totalAmount} // This prop might be simplified
            />
          ))}
        </div>
        <div className="space-y-4">
          <h4 className="font-semibold">Historique des paiements</h4>
          <PaymentHistoryCard
            family={family}
            schoolYear={schoolYears.find(y => y.id === currentSchoolYear)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Fermer
        </button>
        <button
          onClick={onStartPayment}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Saisir un paiement
        </button>
      </div>
    </div>
  );
}
