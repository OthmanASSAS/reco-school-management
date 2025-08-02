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
import { Trash2 } from "lucide-react";
import { Family } from "@/types/families";
import { useToast } from "@/hooks/use-toast";

// Type pour les chèques dans le formulaire (accepte des chaînes vides)
interface ChequeLotForm {
  count: string | number;
  amount: string | number;
  banque: string;
  nom: string;
}

// Liste de banques courantes
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

interface PaymentFormProps {
  family: Family;
  onSave: (paymentData: {
    cash_amount: number;
    card_amount: number;
    amount_transfer: number;
    books: boolean;
    cheques: ChequeLotForm[];
    refund_amount: number;
    remarks: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function PaymentForm({ family, onSave, onCancel }: PaymentFormProps) {
  const { toast } = useToast();
  const [paymentForm, setPaymentForm] = useState({
    cash_amount: "",
    card_amount: "",
    amount_transfer: "",
    books: false,
  });

  const [chequeLots, setChequeLots] = useState<ChequeLotForm[]>([
    { count: "", amount: "", banque: BANKS[0], nom: family.last_name },
  ]);
  const [refund, setRefund] = useState("");
  const [remarques, setRemarques] = useState("");

  // Gestion des lots de chèques
  const addChequeLot = () =>
    setChequeLots([
      ...chequeLots,
      {
        count: 1,
        amount: 0,
        banque: BANKS[0],
        nom: family.last_name,
      },
    ]);

  const removeChequeLot = (idx: number) => setChequeLots(chequeLots.filter((_, i) => i !== idx));

  const updateChequeLot = (idx: number, field: keyof ChequeLotForm, value: any) =>
    setChequeLots(chequeLots.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));

  // Fonctions utilitaires pour convertir les chaînes en nombres
  const parseNumber = (value: string | number): number => {
    if (typeof value === "number") return value;
    return value === "" ? 0 : parseFloat(value) || 0;
  };

  // Calcul du total des chèques
  const totalCheques = chequeLots.reduce((sum, lot) => {
    const count = parseNumber(lot.count);
    const amount = parseNumber(lot.amount);
    return sum + count * amount;
  }, 0);

  const handleSavePayment = async () => {
    try {
      const cashAmount = parseNumber(paymentForm.cash_amount);
      const cardAmount = parseNumber(paymentForm.card_amount);
      const transferAmount = parseNumber(paymentForm.amount_transfer);
      const refundAmount = parseNumber(refund);

      if (cashAmount <= 0 && cardAmount <= 0 && transferAmount <= 0 && totalCheques <= 0) {
        toast({
          variant: "destructive",
          title: "Montant requis",
          description: "Veuillez saisir un montant à payer.",
        });
        return;
      }

      const paymentData = {
        cash_amount: cashAmount,
        card_amount: cardAmount,
        amount_transfer: transferAmount,
        refund_amount: refundAmount,
        books: paymentForm.books,
        remarks: remarques,
        cheques: chequeLots
          .filter(lot => parseNumber(lot.count) > 0 && parseNumber(lot.amount) > 0)
          .map(lot => ({
            count: parseNumber(lot.count),
            amount: parseNumber(lot.amount),
            banque: lot.banque,
            nom: lot.nom,
          })),
      };

      await onSave(paymentData);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Montants en espèces, carte et virement */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="cash_amount">Espèces (€)</Label>
          <Input
            id="cash_amount"
            type="text"
            value={paymentForm.cash_amount}
            onChange={e => {
              const value = e.target.value;
              // Permet seulement les chiffres, le point et la virgule
              if (value === "" || /^[0-9.,]*$/.test(value)) {
                setPaymentForm(prev => ({
                  ...prev,
                  cash_amount: value,
                }));
              }
            }}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="card_amount">Carte bancaire (€)</Label>
          <Input
            id="card_amount"
            type="text"
            value={paymentForm.card_amount}
            onChange={e => {
              const value = e.target.value;
              // Permet seulement les chiffres, le point et la virgule
              if (value === "" || /^[0-9.,]*$/.test(value)) {
                setPaymentForm(prev => ({
                  ...prev,
                  card_amount: value,
                }));
              }
            }}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="amount_transfer">Virement bancaire (€)</Label>
          <Input
            id="amount_transfer"
            type="text"
            value={paymentForm.amount_transfer}
            onChange={e => {
              const value = e.target.value;
              // Permet seulement les chiffres, le point et la virgule
              if (value === "" || /^[0-9.,]*$/.test(value)) {
                setPaymentForm(prev => ({
                  ...prev,
                  amount_transfer: value,
                }));
              }
            }}
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Section Chèques */}
      <div className="bg-gray-50 rounded p-4">
        <div className="font-medium mb-2">Chèques</div>
        {chequeLots.map((lot, idx) => (
          <div
            key={idx}
            className="space-y-2 border border-gray-200 rounded p-4 mb-4 bg-white shadow-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Nombre de chèques</Label>
                <Input
                  type="text"
                  value={lot.count}
                  onChange={e => {
                    const value = e.target.value;
                    // Permet seulement les chiffres
                    if (value === "" || /^[0-9]*$/.test(value)) {
                      updateChequeLot(idx, "count", value);
                    }
                  }}
                />
              </div>
              <div>
                <Label>Montant par chèque (€)</Label>
                <Input
                  type="text"
                  value={lot.amount}
                  onChange={e => {
                    const value = e.target.value;
                    // Permet seulement les chiffres, le point et la virgule
                    if (value === "" || /^[0-9.,]*$/.test(value)) {
                      updateChequeLot(idx, "amount", value);
                    }
                  }}
                />
              </div>
              <div>
                <Label>Banque</Label>
                <Select
                  value={lot.banque}
                  onValueChange={val => updateChequeLot(idx, "banque", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une banque" />
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
                  onChange={e => updateChequeLot(idx, "nom", e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm text-gray-600">
                Total: {(parseNumber(lot.count) * parseNumber(lot.amount)).toFixed(2)}€
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeChequeLot(idx)}
                title="Supprimer ce lot"
                className="text-red-500 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
        <Button className="mt-2 w-full" size="sm" variant="outline" onClick={addChequeLot}>
          Ajouter un lot de chèques
        </Button>
        <div className="mt-2 text-right text-sm text-gray-700 font-medium">
          Total chèques saisis : {totalCheques.toFixed(2)} €
        </div>
      </div>

      {/* Remboursement */}
      <div>
        <Label htmlFor="refund">Montant remboursé (€)</Label>
        <Input
          id="refund"
          type="text"
          value={refund}
          onChange={e => {
            const value = e.target.value;
            // Permet seulement les chiffres, le point et la virgule
            if (value === "" || /^[0-9.,]*$/.test(value)) {
              setRefund(value);
            }
          }}
          placeholder="0.00"
        />
      </div>

      {/* Livres inclus */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="books"
          checked={paymentForm.books}
          onChange={e => setPaymentForm(prev => ({ ...prev, books: e.target.checked }))}
          className="h-4 w-4"
        />
        <Label htmlFor="books" className="text-sm">
          Livres inclus
        </Label>
      </div>

      {/* Remarques / Observations */}
      <div>
        <Label htmlFor="remarques">Remarques / Observations</Label>
        <Textarea
          id="remarques"
          value={remarques}
          onChange={e => setRemarques(e.target.value)}
          placeholder="Ajouter une remarque..."
          className="min-h-[80px]"
        />
      </div>

      {/* Récapitulatif du paiement */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Récapitulatif du paiement</h4>
        <div className="space-y-1 text-sm">
          {parseNumber(paymentForm.cash_amount) > 0 && (
            <div className="flex justify-between">
              <span>Espèces:</span>
              <span className="font-medium">
                {parseNumber(paymentForm.cash_amount).toFixed(2)}€
              </span>
            </div>
          )}
          {parseNumber(paymentForm.card_amount) > 0 && (
            <div className="flex justify-between">
              <span>Carte bancaire:</span>
              <span className="font-medium">
                {parseNumber(paymentForm.card_amount).toFixed(2)}€
              </span>
            </div>
          )}
          {parseNumber(paymentForm.amount_transfer) > 0 && (
            <div className="flex justify-between">
              <span>Virement:</span>
              <span className="font-medium">
                {parseNumber(paymentForm.amount_transfer).toFixed(2)}€
              </span>
            </div>
          )}
          {totalCheques > 0 && (
            <div className="flex justify-between">
              <span>Chèques:</span>
              <span className="font-medium">{totalCheques.toFixed(2)}€</span>
            </div>
          )}
          {parseNumber(refund) > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Remboursement:</span>
              <span className="font-medium">-{parseNumber(refund).toFixed(2)}€</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-medium text-base">
            <span>Total net:</span>
            <span>
              {(
                parseNumber(paymentForm.cash_amount) +
                parseNumber(paymentForm.card_amount) +
                parseNumber(paymentForm.amount_transfer) +
                totalCheques -
                parseNumber(refund)
              ).toFixed(2)}
              €
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleSavePayment} className="flex-1">
          Enregistrer le paiement
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Retour
        </Button>
      </div>
    </div>
  );
}
