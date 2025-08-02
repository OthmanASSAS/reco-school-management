import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

interface PaymentSummaryCardProps {
  totalAmount: number;
  paidAmount: number;
  schoolYearLabel: string;
}

export default function PaymentSummaryCard({
  totalAmount,
  paidAmount,
  schoolYearLabel,
}: PaymentSummaryCardProps) {
  const remainingAmount = totalAmount - paidAmount;

  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-yellow-800 flex items-center gap-2">
          <CreditCard size={18} />
          Résumé des paiements - {schoolYearLabel}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
            className={`font-bold text-lg ${
              remainingAmount > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {remainingAmount}€
          </span>
        </div>

        {remainingAmount <= 0 && (
          <div className="mt-3 p-2 bg-green-100 rounded border border-green-200">
            <p className="text-sm text-green-700 font-medium">
              ✅ Tous les cours de cette année sont payés !
              {remainingAmount < 0 && ` (Crédit de ${Math.abs(remainingAmount)}€)`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
