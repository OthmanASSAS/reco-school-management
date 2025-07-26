"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Family } from "@/types/families";
import { fetchCourseDiscountSettings } from "@/lib/settings";
import {
  calculateFamilyTotal,
  calculatePaidAmount,
  filterEnrollmentsBySchoolYear,
  DiscountSettings,
} from "@/lib/utils/payment-calculations";
import PaymentSummaryCard from "./PaymentSummaryCard";
import StudentCoursesCard from "./StudentCoursesCard";
import PaymentHistoryCard from "./PaymentHistoryCard";

interface PaymentSummaryProps {
  family: Family;
  currentSchoolYear: string | null;
  schoolYears: any[];
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
  console.log({ family });
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
        setError("Erreur lors du chargement des paramètres");
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  const totalAmount = calculateFamilyTotal(
    family,
    currentSchoolYear,
    schoolYears,
    discountSettings
  );
  const paidAmount = calculatePaidAmount(family, currentSchoolYear, schoolYears);
  const remainingAmount = totalAmount - paidAmount;

  const currentSchoolYearObj = schoolYears.find(y => y.id === currentSchoolYear);
  const schoolYearLabel = currentSchoolYearObj?.label || "Année courante";

  return (
    <div className="space-y-6">
      {/* En-tête famille */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800">
          Famille {family.first_name} {family.last_name}
        </h4>
        <p className="text-sm text-blue-600">{family.email}</p>
        <p className="text-sm text-blue-600">{family.phone}</p>
      </div>

      {/* Cours par étudiant */}
      <div>
        <h4 className="font-medium mb-3">Cours de l'année {schoolYearLabel}</h4>
        <div className="space-y-3">
          {family.students.map(student => {
            const enrollments = filterEnrollmentsBySchoolYear(
              student.enrollments,
              currentSchoolYear,
              schoolYears
            );

            return (
              <StudentCoursesCard
                key={student.id}
                student={student}
                enrollments={enrollments}
                totalPaid={paidAmount}
                totalDue={totalAmount}
              />
            );
          })}
        </div>

        {/* Info dégressivité */}
        <div className="mt-4 text-xs text-blue-700 italic">
          {discountSettings.mode === "cumulative"
            ? `Dégressif appliqué à partir du ${discountSettings.startAt}e cours : -${discountSettings.step}€ pour le ${discountSettings.startAt}e, -${discountSettings.step * 2}€ pour le ${discountSettings.startAt + 1}e, etc.`
            : `Dégressif appliqué à partir du ${discountSettings.startAt}e cours : -${discountSettings.step}€ pour chaque cours à partir du ${discountSettings.startAt}e`}
        </div>
      </div>

      {/* Résumé financier */}
      <PaymentSummaryCard
        totalAmount={totalAmount}
        paidAmount={paidAmount}
        schoolYearLabel={schoolYearLabel}
      />

      {/* Historique */}
      <PaymentHistoryCard family={family} schoolYear={currentSchoolYearObj} />

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={onStartPayment} className="flex-1" disabled={remainingAmount <= 0}>
          Saisir un paiement
        </Button>
        <Button variant="outline" onClick={onClose} className="flex-1">
          Fermer
        </Button>
      </div>
    </div>
  );
}
