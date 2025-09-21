"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase";
import { Family } from "@/types/families";

interface PaymentFormProps {
  family: Family;
  currentSchoolYear: string | null;
  onPaymentSaved: () => void;
  onCancel: () => void;
}

interface ChequeLot {
  count: number;
  amount: number;
  banque: string;
  nom: string;
}

const BANKS = [
  "BNP Paribas",
  "Crédit Agricole",
  "Société Générale",
  "Banque Populaire",
  "Caisse d'Épargne",
  "LCL",
  "CIC",
  "La Banque Postale",
  "Crédit Mutuel",
  "HSBC",
  "Boursorama",
  "Autre...",
];

export default function PaymentForm({
  family,
  currentSchoolYear,
  onPaymentSaved,
  onCancel,
}: PaymentFormProps) {
  const { toast } = useToast();
  const [paymentForm, setPaymentForm] = useState({
    cash_amount: 0,
    card_amount: 0,
    amount_transfer: 0,
    books: false,
  });
  const [chequeLots, setChequeLots] = useState<ChequeLot[]>([
    { count: 1, amount: 0, banque: BANKS[0], nom: family.last_name },
  ]);
  const [refund, setRefund] = useState(0);
  const [remarques, setRemarques] = useState("");
  const [selectedPaymentYearId, setSelectedPaymentYearId] = useState<string | null>(
    currentSchoolYear
  );

  const totalCheques = chequeLots.reduce((sum, lot) => sum + lot.count * lot.amount, 0);

  const handleSavePayment = async () => {
    try {
      if (
        paymentForm.cash_amount <= 0 &&
        paymentForm.card_amount <= 0 &&
        paymentForm.amount_transfer <= 0 &&
        totalCheques <= 0
      ) {
        toast({
          variant: "destructive",
          title: "Montant requis",
          description: "Veuillez saisir un montant à payer.",
        });
        return;
      }

      console.log("🔍 PaymentForm Debug:", {
        paymentForm,
        chequeLots,
        totalCheques,
        refund,
        remarques,
      });

      const paymentToCreate: Record<string, unknown> = {
        family_id: family.id,
        amount_cash: paymentForm.cash_amount,
        amount_card: paymentForm.card_amount,
        amount_transfer: paymentForm.amount_transfer,
        refund_amount: refund,
        books: paymentForm.books,
        remarks: remarques,
        cheques: chequeLots,
      };

      if (selectedPaymentYearId) {
        paymentToCreate.school_year_id = selectedPaymentYearId;
      }

      const { error } = await supabase.from("payments").insert(paymentToCreate);

      if (error) {
        const message = error.message?.toLowerCase?.() || "";
        const schoolYearColumnMissing =
          message.includes("school year id") && message.includes("payments");

        if (paymentToCreate.school_year_id && schoolYearColumnMissing) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { school_year_id, ...fallbackPayload } = paymentToCreate;

          console.warn(
            "[PaymentForm] Colonne school_year_id manquante sur payments, nouvel essai sans ce champ.",
            error
          );

          const fallbackResult = await supabase.from("payments").insert(fallbackPayload);

          if (fallbackResult.error) {
            throw fallbackResult.error;
          }

          toast({
            variant: "default",
            title: "Paiement enregistré",
            description:
              "Colonne school_year_id absente dans la base : le paiement a été créé sans liaison d'année.",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Paiement enregistré",
          description: "Le paiement a été enregistré avec succès !",
        });
      }

      onPaymentSaved();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      toast({
        variant: "destructive",
        title: "Erreur d'enregistrement",
        description: `Erreur lors de la création des paiements: ${message}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="cash_amount">Espèces (€)</Label>
          <Input
            id="cash_amount"
            type="number"
            min={0}
            value={paymentForm.cash_amount}
            onChange={e =>
              setPaymentForm(prev => ({ ...prev, cash_amount: parseFloat(e.target.value) || 0 }))
            }
          />
        </div>
        <div>
          <Label htmlFor="card_amount">Carte bancaire (€)</Label>
          <Input
            id="card_amount"
            type="number"
            min={0}
            value={paymentForm.card_amount}
            onChange={e =>
              setPaymentForm(prev => ({ ...prev, card_amount: parseFloat(e.target.value) || 0 }))
            }
          />
        </div>
        <div>
          <Label htmlFor="amount_transfer">Virement bancaire (€)</Label>
          <Input
            id="amount_transfer"
            type="number"
            min={0}
            value={paymentForm.amount_transfer}
            onChange={e =>
              setPaymentForm(prev => ({
                ...prev,
                amount_transfer: parseFloat(e.target.value) || 0,
              }))
            }
          />
        </div>
      </div>

      {/* Sélection de l'année du paiement (pour arriérés) */}
      <div>
        <Label>Année du paiement</Label>
        <Select
          value={selectedPaymentYearId || undefined}
          onValueChange={val => setSelectedPaymentYearId(val)}
        >
          <SelectTrigger className="w-72">
            <SelectValue placeholder="Année sélectionnée dans l'entête" />
          </SelectTrigger>
          <SelectContent>
            {/* On délègue la liste à l'écran parent qui transmet currentSchoolYear; sinon on garde la sélection actuelle */}
            {/* S'il faut la liste complète, on peut la passer via props ou un hook global */}
            <SelectItem value={currentSchoolYear || ""}>
              {currentSchoolYear ? "Année en cours (sélection en haut)" : "Sans année"}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-gray-50 rounded p-4">
        <div className="font-medium mb-2">Chèques</div>
        {chequeLots.map((lot, idx) => (
          <div key={idx} className="space-y-2 border rounded p-4 mb-4 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Nombre de chèques</Label>
                <Input
                  type="number"
                  min={1}
                  value={lot.count}
                  onChange={e =>
                    setChequeLots(current =>
                      current.map((c, i) =>
                        i === idx ? { ...c, count: parseInt(e.target.value) || 1 } : c
                      )
                    )
                  }
                />
              </div>
              <div>
                <Label>Montant par chèque (€)</Label>
                <Input
                  type="number"
                  min={0}
                  value={lot.amount}
                  onChange={e =>
                    setChequeLots(current =>
                      current.map((c, i) =>
                        i === idx ? { ...c, amount: parseFloat(e.target.value) || 0 } : c
                      )
                    )
                  }
                />
              </div>
              <div>
                <Label>Banque</Label>
                <Select
                  value={lot.banque}
                  onValueChange={val =>
                    setChequeLots(current =>
                      current.map((c, i) => (i === idx ? { ...c, banque: val } : c))
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BANKS.map(b => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nom sur le chèque</Label>
                <Input
                  type="text"
                  value={lot.nom}
                  onChange={e =>
                    setChequeLots(current =>
                      current.map((c, i) => (i === idx ? { ...c, nom: e.target.value } : c))
                    )
                  }
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setChequeLots(current => current.filter((_, i) => i !== idx))}
              >
                Supprimer
              </Button>
            </div>
          </div>
        ))}
        <Button
          className="mt-2 w-full"
          size="sm"
          variant="outline"
          onClick={() =>
            setChequeLots(current => [
              ...current,
              { count: 1, amount: 0, banque: BANKS[0], nom: family.last_name },
            ])
          }
        >
          + Ajouter un lot de chèques
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Label>Remboursement (€)</Label>
          <Input
            type="number"
            min={0}
            value={refund}
            onChange={e => setRefund(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label>Remarques</Label>
          <Textarea id="remarques" value={remarques} onChange={e => setRemarques(e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={handleSavePayment}>Enregistrer le paiement</Button>
      </div>
    </div>
  );
}
