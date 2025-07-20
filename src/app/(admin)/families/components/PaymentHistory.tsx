"use client";

import { Family } from "@/types/families";

interface PaymentHistoryProps {
  family: Family;
  currentSchoolYear: string | null;
  schoolYears: any[];
}

export default function PaymentHistory({
  family,
  currentSchoolYear,
  schoolYears,
}: PaymentHistoryProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Historique des paiements</h4>
      <div className="text-sm text-gray-500">Fonctionnalité en cours de développement...</div>
    </div>
  );
}
