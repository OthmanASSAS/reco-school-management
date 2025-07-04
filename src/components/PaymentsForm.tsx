"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

const MOCK_STUDENTS = [
  { id: "1", name: "Sophie Martin" },
  { id: "2", name: "Lucas Dubois" },
  { id: "3", name: "Emma Rousseau" },
];

export default function PaymentsForm() {
  const [student, setStudent] = useState("");
  const [amount, setAmount] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Envoyer les données au backend
    alert("Paiement enregistré !");
    setStudent("");
    setAmount("");
    setCardHolder("");
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setDate("");
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
            <Label htmlFor="student">Élève concerné *</Label>
            <select
              id="student"
              value={student}
              onChange={e => setStudent(e.target.value)}
              required
              className="w-full border rounded h-12 px-3"
            >
              <option value="">Sélectionner un élève</option>
              {MOCK_STUDENTS.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="amount">Montant (€) *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ex: 120.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              className="h-12"
            />
          </div>
          <div>
            <Label htmlFor="cardHolder">Titulaire de la carte *</Label>
            <Input
              id="cardHolder"
              type="text"
              placeholder="Nom Prénom"
              value={cardHolder}
              onChange={e => setCardHolder(e.target.value)}
              required
              className="h-12"
            />
          </div>
          <div>
            <Label htmlFor="cardNumber">Numéro de carte *</Label>
            <Input
              id="cardNumber"
              type="text"
              inputMode="numeric"
              pattern="[0-9\s]{13,19}"
              maxLength={19}
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={e => setCardNumber(e.target.value.replace(/[^\d\s]/g, ""))}
              required
              className="h-12"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Date d'expiration *</Label>
              <Input
                id="expiry"
                type="text"
                placeholder="MM/AA"
                value={expiry}
                onChange={e => setExpiry(e.target.value)}
                required
                className="h-12"
                maxLength={5}
              />
            </div>
            <div>
              <Label htmlFor="cvv">CVV *</Label>
              <Input
                id="cvv"
                type="password"
                inputMode="numeric"
                pattern="[0-9]{3,4}"
                maxLength={4}
                placeholder="123"
                value={cvv}
                onChange={e => setCvv(e.target.value.replace(/\D/, ""))}
                required
                className="h-12"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="date">Date du paiement *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              className="h-12"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white h-12"
          >
            Valider le paiement
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
