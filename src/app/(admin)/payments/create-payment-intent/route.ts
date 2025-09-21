import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Vérifier si la clé Stripe est disponible
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.warn("STRIPE_SECRET_KEY non définie - les paiements Stripe ne fonctionneront pas");
}

const stripe = stripeKey ? new Stripe(stripeKey) : null;

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Service de paiement non configuré" }, { status: 503 });
    }

    const body = await request.json();
    const { amount } = body;

    if (!amount) {
      return NextResponse.json({ error: "Montant manquant" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      payment_method_types: ["card"],
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("Erreur Stripe:", err);
    return NextResponse.json({ error: "Erreur lors de la création du paiement" }, { status: 500 });
  }
}
