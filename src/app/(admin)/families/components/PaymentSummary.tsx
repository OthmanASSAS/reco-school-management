"use client";

import { Button } from "@/components/ui/button";
import { CreditCard, Users, User } from "lucide-react";
import { Family } from "@/types/families";
import PaymentHistory from "./PaymentHistory";

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
  const calculateTotalAmount = (family: Family) => {
    let total = 0;
    family.students.forEach(student => {
      student.enrollments.forEach(enrollment => {
        if (enrollment.courses?.price) {
          total += enrollment.courses.price;
        }
      });
    });
    return total;
  };

  const calculatePaidAmount = (family: Family) => {
    let paid = 0;
    family.students.forEach(student => {
      student.payments.forEach(payment => {
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
      });
    });
    return paid;
  };

  const getPaymentStatus = (student: any) => {
    const paidAmount = calculateStudentPaidAmount(student);
    const totalAmount = calculateStudentTotalAmount(student);

    if (paidAmount >= totalAmount && totalAmount > 0) {
      return { status: "Payé", className: "bg-green-100 text-green-800" };
    } else if (paidAmount > 0) {
      return { status: "Partiel", className: "bg-orange-100 text-orange-800" };
    } else {
      return { status: "En attente", className: "bg-yellow-100 text-yellow-800" };
    }
  };

  const calculateStudentPaidAmount = (student: any) => {
    let paid = 0;
    student.payments.forEach((payment: any) => {
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
        paid += cheques.reduce(
          (sum: number, lot: any) => sum + (lot.count || 0) * (lot.amount || 0),
          0
        );
      }
      if (payment.refund_amount) {
        paid -= payment.refund_amount;
      }
    });
    return paid;
  };

  const calculateStudentTotalAmount = (student: any) => {
    let total = 0;
    student.enrollments.forEach((enrollment: any) => {
      if (enrollment.courses?.price) {
        total += enrollment.courses.price;
      }
    });
    return total;
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
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <span className="font-medium">{enrollment.courses?.name}</span>
                        <div className="text-sm text-gray-600">{enrollment.courses?.type}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-lg">
                          {enrollment.courses?.price || 0}€
                        </span>
                        {(() => {
                          const paymentStatus = getPaymentStatus(student);
                          return (
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${paymentStatus.className}`}
                            >
                              {paymentStatus.status}
                            </span>
                          );
                        })()}
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
            <span className="font-bold text-lg text-red-600">{remainingAmount}€</span>
          </div>
        </div>
        {remainingAmount === 0 && (
          <div className="mt-3 p-2 bg-green-100 rounded border border-green-200">
            <p className="text-sm text-green-700 font-medium">
              ✅ Tous les cours de cette année sont payés !
            </p>
          </div>
        )}
      </div>

      <PaymentHistory
        family={family}
        currentSchoolYear={currentSchoolYear}
        schoolYears={schoolYears}
      />

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={onStartPayment} className="flex-1" disabled={remainingAmount === 0}>
          Saisir un paiement
        </Button>
        <Button variant="outline" onClick={onClose} className="flex-1">
          Fermer
        </Button>
      </div>
    </div>
  );
}
