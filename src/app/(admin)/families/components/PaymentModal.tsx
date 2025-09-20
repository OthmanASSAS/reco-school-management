"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
import { Family } from "@/types/families";
import PaymentSummary from "./PaymentSummary";
import PaymentForm from "./PaymentForm";

interface PaymentModalProps {
  family: Family;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSaved: () => void;
  currentSchoolYear: string | null;
  schoolYears: { id: string; label?: string; start_date: string; end_date?: string }[];
}

export default function PaymentModal({
  family,
  open,
  onOpenChange,
  onPaymentSaved,
  currentSchoolYear,
  schoolYears,
}: PaymentModalProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const handlePaymentSaved = () => {
    setShowPaymentForm(false);
    onOpenChange(false);
    onPaymentSaved();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={open => {
        onOpenChange(open);
        setShowPaymentForm(false);
      }}
    >
      <DialogContent className="w-full max-w-[40vw] max-h-[95vh] flex flex-col p-4 sm:p-8">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {showPaymentForm
              ? `Saisir un paiement - Famille ${family.last_name}`
              : `Gestion des paiements - Famille ${family.last_name}`}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {showPaymentForm ? (
            <PaymentForm
              family={family}
              currentSchoolYear={currentSchoolYear}
              onPaymentSaved={handlePaymentSaved}
              onCancel={() => setShowPaymentForm(false)}
            />
          ) : (
            <PaymentSummary
              family={family}
              currentSchoolYear={currentSchoolYear}
              schoolYears={schoolYears}
              onStartPayment={() => setShowPaymentForm(true)}
              onClose={() => onOpenChange(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
