"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import {
  CardElement,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";

export default function PaymentsForm() {
  const [amount, setAmount] = useState("350");
  const [cardHolder, setCardHolder] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!stripe || !elements) return;

    setLoading(true);

    const res = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round(Number(amount) * 100), // Stripe attend les montants en centimes
        cardHolder,
      }),
    });

    const { clientSecret, error } = await res.json();

    if (error || !clientSecret) {
      setMessage("Erreur lors de la création du paiement.");
      setLoading(false);
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardNumberElement!,
        billing_details: { name: cardHolder },
      },
    });

    if (result.error) {
      setMessage(result.error.message || "Erreur lors du paiement.");
      setLoading(false);
    } else if (result.paymentIntent?.status === "succeeded") {
      setMessage("Paiement réussi !");
      setAmount("350");
      setCardHolder("");
      elements.getElement(CardElement)?.clear();
    }
    setLoading(false);
  };

  return (
    <Card className="max-w-xl mx-auto bg-white/80 shadow-lg border-blue-100">
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center gap-2">
          <CreditCard size={20} />
          Paiement par carte bancaire
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label>Numéro de carte</Label>
            <CardNumberElement className="border rounded p-3" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date d'expiration</Label>
              <CardExpiryElement className="border rounded p-3" />
            </div>
            <div>
              <Label>CVV</Label>
              <CardCvcElement className="border rounded p-3" />
            </div>
          </div>
          {message && (
            <div
              className={`text-center text-sm ${message.includes("réussi") ? "text-green-600" : "text-red-600"}`}
            >
              {message}
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white h-12 text-base font-bold"
            disabled={loading || !stripe}
          >
            {loading ? "Paiement en cours..." : `payer ${amount}€`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
