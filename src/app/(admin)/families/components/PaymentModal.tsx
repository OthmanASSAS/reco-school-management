"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
import { Family } from "@/types/families";
import PaymentSummary from "./PaymentSummary";
import PaymentForm from "./PaymentForm";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase";

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
  const { toast } = useToast();
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const handlePaymentSave = async (paymentData: {
    cash_amount: number;
    card_amount: number;
    amount_transfer: number;
    books: boolean;
    cheques: { count: string | number; amount: string | number; banque: string; nom: string }[];
    refund_amount: number;
    remarks: string;
  }) => {
    try {
      // Paiement global famille : on insère un seul paiement avec family_id
      const paymentToCreate = {
        family_id: family.id,
        // school_year_id sera ajouté plus tard
        ...paymentData,
      };

      const { error } = await supabase.from("payments").insert([paymentToCreate]).select();

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur d'enregistrement",
          description: `Erreur lors de la création du paiement: ${error.message}`,
        });
      } else {
        toast({
          title: "Paiement enregistré",
          description: "Le paiement a été enregistré avec succès !",
        });
        setShowPaymentForm(false);
        onOpenChange(false);
        onPaymentSaved();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors du traitement du paiement.",
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={open => {
        onOpenChange(open);
        setShowPaymentForm(false);
      }}
    >
      <DialogContent className="w-full max-w-[40vw] max-h-[95vh] overflow-auto p-4 sm:p-8">
        <DialogHeader>
          <DialogTitle>
            {showPaymentForm
              ? `Saisir un paiement - Famille ${family.last_name}`
              : `Gestion des paiements - Famille ${family.last_name}`}
          </DialogTitle>
        </DialogHeader>

        {showPaymentForm ? (
          <PaymentForm
            family={family}
            onSave={handlePaymentSave}
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
      </DialogContent>
    </Dialog>
  );
}
