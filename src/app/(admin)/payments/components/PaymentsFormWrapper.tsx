// /Users/oassas/Projets/inscription-app/src/app/(admin)/payments/components/PaymentsFormWrapper.tsx
"use client";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentsForm from "./PaymentsForm";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

// wrapper définit côté client  permettant d'initialiser stripe. On ne peut pas le faire côté serveur
export default function PaymentsFormClientWrapper() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentsForm />
    </Elements>
  );
}
