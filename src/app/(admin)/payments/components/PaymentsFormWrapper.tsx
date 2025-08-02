"use client";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentsForm from "./PaymentsForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// wrapper définit côté client  permettant d'initialiser stripe. On ne peut pas le faire côté serveur
export default function PaymentsFormClientWrapper() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentsForm />
    </Elements>
  );
}
