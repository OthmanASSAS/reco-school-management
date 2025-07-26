"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Users, User } from "lucide-react";
import { Family } from "@/types/families";
import PaymentHistory from "./PaymentHistory";
import { fetchCourseDiscountSettings } from "@/lib/settings";

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
  const [discountSettings, setDiscountSettings] = useState({
    startAt: 3,
    step: 25,
    mode: "cumulative",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseDiscountSettings()
      .then(settings => {
        setDiscountSettings(settings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Calcule le total des cours pour l'année sélectionnée avec dégressif dynamique
  const calculateTotalAmount = (family: Family) => {
    const currentYearObj = currentSchoolYear
      ? schoolYears.find(y => y.id === currentSchoolYear)
      : null;
    const schoolYearStart = currentYearObj
      ? new Date(currentYearObj.start_date).getFullYear()
      : new Date().getFullYear();

    const { startAt, step, mode } = discountSettings;
    const allEnrollments = family.students.flatMap(student =>
      student.enrollments.filter(enrollment => {
        const enrollmentYear = new Date(enrollment.start_date).getFullYear();
        return enrollment.status === "active" && enrollmentYear === schoolYearStart;
      })
    );

    let total = 0;
    console.log({ total });
    console.log({ allEnrollments });
    allEnrollments.forEach((enrollment, idx) => {
      console.log({ enrollment });
      let price = enrollment.courses?.price ? parseFloat(enrollment.courses.price as any) : 0;
      if (idx >= startAt - 1) {
        const reduction = mode === "cumulative" ? (idx - (startAt - 2)) * step : step;
        console.log({ price, reduction, startAt, step, mode });
        price = Math.max(0, price - reduction);
      }
      total += price;
    });
    return total;
  };

  // Calcule le total payé pour l'année sélectionnée
  const calculatePaidAmount = (family: Family) => {
    let paid = 0;
    const currentYearObj = currentSchoolYear
      ? schoolYears.find(y => y.id === currentSchoolYear)
      : null;
    const schoolYearStart = currentYearObj
      ? new Date(currentYearObj.start_date).getFullYear()
      : new Date().getFullYear();

    (family.payments || []).forEach(payment => {
      const paymentYear = new Date(payment.created_at).getFullYear();
      if (paymentYear === schoolYearStart) {
        paid += payment.amount_cash || 0;
        paid += payment.amount_card || 0;
        paid += payment.amount_transfer || 0;
        let cheques = payment.cheques;
        if (typeof cheques === "string") {
          try {
            cheques = JSON.parse(cheques);
          } catch {
            cheques = [];
          }
        }
        if (Array.isArray(cheques)) {
          paid += cheques.reduce((sum, lot) => sum + (lot.count || 0) * (lot.amount || 0), 0);
        }
        if (payment.refund_amount) {
          paid -= payment.refund_amount;
        }
      }
    });
    return paid;
  };

  const totalAmount = calculateTotalAmount(family);
  const paidAmount = calculatePaidAmount(family);
  const remainingAmount = totalAmount - paidAmount;

  return (
    <div className="space-y-6">
      {/* Récapitulatif famille */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800">
          Famille {family.first_name} {family.last_name}
        </h4>
        <p className="text-sm text-blue-600">{family.email}</p>
        <p className="text-sm text-blue-600">{family.phone}</p>
      </div>

      {/* Informations sur les élèves et cours */}
      <div>
        <h4 className="font-medium mb-3">
          Cours de l'année{" "}
          {currentSchoolYear
            ? schoolYears.find(y => y.id === currentSchoolYear)?.label ||
              `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
            : "courante"}
        </h4>
        <div className="space-y-3">
          {family.students.map(student => (
            <div key={student.id} className="p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-sm">
                {student.first_name} {student.last_name}
                <span className="text-xs text-gray-500 ml-2">
                  ({student.registration_type === "child" ? "Enfant" : "Adulte"})
                </span>
              </h5>
              {student.enrollments.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {student.enrollments.map(enrollment => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-2 bg-white rounded"
                    >
                      <div>
                        <span className="font-medium">{enrollment.courses?.name}</span>
                        <div className="text-sm text-gray-600">{enrollment.courses?.type}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-lg">
                          {enrollment.courses?.price || 0}€
                        </span>
                        {/* Statut de paiement global */}
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            paidAmount >= totalAmount && totalAmount > 0
                              ? "bg-green-100 text-green-800"
                              : paidAmount > 0
                                ? "bg-orange-100 text-orange-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {paidAmount >= totalAmount && totalAmount > 0
                            ? "Payé"
                            : paidAmount > 0
                              ? "Partiel"
                              : "En attente"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-xs text-yellow-700">
                    ⚠️ Aucun cours inscrit pour cette année scolaire
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Affichage du dégressif */}
        <div className="mt-4 text-xs text-blue-700 italic">
          {discountSettings.mode === "cumulative"
            ? `Dégressif appliqué à partir du ${discountSettings.startAt}e cours : -${discountSettings.step}€ pour le ${discountSettings.startAt}e, -${discountSettings.step * 2}€ pour le ${discountSettings.startAt + 1}e, etc.`
            : `Dégressif appliqué à partir du ${discountSettings.startAt}e cours : -${discountSettings.step}€ pour chaque cours à partir du ${discountSettings.startAt}e`}
        </div>
      </div>

      {/* Résumé des paiements */}
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h4 className="font-medium mb-3 text-yellow-800">
          Résumé des paiements - Année{" "}
          {currentSchoolYear
            ? schoolYears.find(y => y.id === currentSchoolYear)?.label ||
              `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
            : "courante"}
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total des cours :</span>
            <span className="font-bold text-lg">{totalAmount}€</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Cours payés :</span>
            <span className="text-sm text-green-600 font-medium">{paidAmount}€</span>
          </div>
          <div className="flex justify-between items-center border-t pt-2">
            <span className="font-medium">Reste à payer :</span>
            <span
              className={`font-bold text-lg ${remainingAmount > 0 ? "text-red-600" : "text-green-600"}`}
            >
              {remainingAmount}€
            </span>
          </div>
        </div>
        {remainingAmount <= 0 && (
          <div className="mt-3 p-2 bg-green-100 rounded border border-green-200">
            <p className="text-sm text-green-700 font-medium">
              ✅ Tous les cours de cette année sont payés !
              {remainingAmount < 0 && ` (Crédit de ${Math.abs(remainingAmount)}€)`}
            </p>
          </div>
        )}
      </div>

      {/* Historique des paiements globaux famille */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h5 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <CreditCard size={18} />
          Historique des paiements famille
        </h5>
        <div className="space-y-3">
          {(family.payments || []).length === 0 && (
            <div className="text-gray-500">Aucun paiement enregistré pour cette famille.</div>
          )}
          {(family.payments || []).map(payment => {
            const paymentMethods = [];
            if (payment.amount_cash && payment.amount_cash > 0) {
              paymentMethods.push(
                <span
                  key="cash"
                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                >
                  💵 {payment.amount_cash}€ espèces
                </span>
              );
            }
            if (payment.amount_card && payment.amount_card > 0) {
              paymentMethods.push(
                <span
                  key="card"
                  className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                >
                  💳 {payment.amount_card}€ carte
                </span>
              );
            }
            if (payment.amount_transfer && payment.amount_transfer > 0) {
              paymentMethods.push(
                <span
                  key="transfer"
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                >
                  📤 {payment.amount_transfer}€ virement
                </span>
              );
            }
            if (payment.cheques) {
              let cheques = payment.cheques;
              if (typeof cheques === "string") {
                try {
                  cheques = JSON.parse(cheques);
                } catch {
                  cheques = [];
                }
              }
              if (Array.isArray(cheques) && cheques.length > 0) {
                cheques.forEach((lot: any, idx: number) => {
                  if (lot.count && lot.amount) {
                    paymentMethods.push(
                      <span
                        key={`cheque-${idx}`}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium"
                      >
                        🏪 {lot.count} chèque{lot.count > 1 ? "s" : ""} de {lot.amount}€ (
                        {lot.banque})
                      </span>
                    );
                  }
                });
              }
            }
            if (payment.refund_amount && payment.refund_amount > 0) {
              paymentMethods.push(
                <span
                  key="refund"
                  className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium"
                >
                  💸 Remboursement {payment.refund_amount}€
                </span>
              );
            }
            if (payment.books) {
              paymentMethods.push(
                <span
                  key="books"
                  className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium"
                >
                  📚 Livres inclus
                </span>
              );
            }
            return (
              <div key={payment.id} className="border-l-2 border-blue-200 pl-3">
                <div className="text-xs text-gray-500 mb-1">
                  {new Date(payment.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="flex flex-wrap gap-1">{paymentMethods}</div>
                {payment.remarks && (
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    💬 {payment.remarks}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

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
