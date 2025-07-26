import { CreditCard } from "lucide-react";
import { Family } from "@/types/families";
import { filterPaymentsBySchoolYear } from "@/lib/utils/payment-calculations";

interface PaymentHistoryCardProps {
  family: Family;
  schoolYear: any;
}

export default function PaymentHistoryCard({ family, schoolYear }: PaymentHistoryCardProps) {
  const filteredPayments = filterPaymentsBySchoolYear(family.payments || [], schoolYear);

  const renderPaymentMethods = (payment: any) => {
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
                🏪 {lot.count} chèque{lot.count > 1 ? "s" : ""} de {lot.amount}€ ({lot.banque})
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

    return paymentMethods;
  };

  return (
    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <h5 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
        <CreditCard size={18} />
        Historique des paiements famille
      </h5>

      <div className="space-y-3">
        {filteredPayments.length === 0 ? (
          <div className="text-gray-500">Aucun paiement enregistré pour cette année scolaire.</div>
        ) : (
          filteredPayments.map(payment => (
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
              <div className="flex flex-wrap gap-1">{renderPaymentMethods(payment)}</div>
              {payment.remarks && (
                <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  💬 {payment.remarks}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
