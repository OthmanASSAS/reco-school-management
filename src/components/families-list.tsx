"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { Edit, Trash2, Eye, AlertCircle, CreditCard } from "lucide-react";
import { deleteFamily } from "@/lib/actions/families";
import FamilyFormModal from "./family-form-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Family {
  id: string;
  last_name: string;
  first_name: string;
  email: string;
  phone: string;
  address: string;
  postal_code: string;
  city: string;
  students: Student[];
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  registration_type: string;
  enrollments: Enrollment[];
  payments: Payment[];
}

interface Payment {
  id: string;
  student_id?: string;
  amount_cash?: number;
  amount_card?: number;
  amount_transfer?: number;
  refund_amount?: number;
  books?: boolean;
  remarks?: string;
  cheques?: ChequeLot[] | string;
  created_at: string;
}

interface Enrollment {
  id: string;
  status: string;
  start_date: string;
  courses: {
    id: string;
    name: string;
    price: number;
    type: string;
  };
}

// Nouvelle structure pour un lot de chèques
interface ChequeLot {
  count: number;
  amount: number;
  banque: string;
  nom: string;
}

export default function FamiliesTable() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [search, setSearch] = useState("");
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [currentSchoolYear, setCurrentSchoolYear] = useState<string | null>(null);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [paymentInputModalOpen, setPaymentInputModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    cash_amount: 0,
    cheque_amount: 0,
    card_amount: 0,
    cheque_count: 0,
    bank_transfer: false,
    bank_transfer_amount: 0,
    books: false,
  });
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    fetchSchoolYears();
  }, []);

  useEffect(() => {
    if (currentSchoolYear) {
      fetchFamilies();
    }
  }, [currentSchoolYear]);

  // Récupérer les années scolaires
  async function fetchSchoolYears() {
    const { data, error } = await supabase
      .from("school_years")
      .select("id, label, start_date")
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Erreur récupération années scolaires:", error);
    } else {
      setSchoolYears(data || []);
      // Sélectionner automatiquement l'année la plus récente
      if (data && data.length > 0) {
        setCurrentSchoolYear(data[0].id);
      }
    }
  }

  async function fetchFamilies() {
    if (!currentSchoolYear) return;

    const { data, error } = await supabase
      .from("families")
      .select(
        `
        id, 
        last_name, 
        first_name, 
        email, 
        phone, 
        address, 
        postal_code, 
        city, 
        students(
          id,
          first_name,
          last_name,
          birth_date,
          registration_type,
          enrollments(
            id,
            status,
            start_date,
            courses(
              id,
              name,
              price,
              type
            )
          ),
          payments(
            id,
            student_id,
            amount_cash,
            amount_card,
            amount_transfer,
            refund_amount,
            books,
            remarks,
            cheques,
            created_at
          )
        )
      `
      )
      .order("last_name", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      // Filtrer pour ne garder que les enrollments de l'année courante
      const filteredData = ((data as any[]) || []).map(family => ({
        ...family,
        students: family.students.map((student: any) => ({
          ...student,
          enrollments: student.enrollments.filter((enrollment: any) => {
            // Garder les enrollments actifs de l'année courante
            const enrollmentYear = new Date(enrollment.start_date).getFullYear();
            const currentYear = new Date().getFullYear();
            return enrollment.status === "active" && enrollmentYear === currentYear;
          }),
        })),
      }));

      setFamilies(filteredData);
    }
  }

  async function handleDelete(family: Family) {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer la famille ${family.first_name} ${family.last_name} ?`
      )
    ) {
      const result = await deleteFamily(family.id);
      setDeleteMessage(result.message);

      if (result.success) {
        fetchFamilies(); // Rafraîchir la liste
      }

      // Effacer le message après 5 secondes
      setTimeout(() => setDeleteMessage(null), 5000);
    }
  }

  const handlePaymentManagement = (family: Family) => {
    setSelectedFamily(family);
    setPaymentModalOpen(true);
    setPaymentSuccess(false);
  };

  // Calculer le montant total pour une famille
  const calculateTotalAmount = (family: Family) => {
    let total = 0;
    family.students.forEach(student => {
      student.enrollments.forEach(enrollment => {
        if (enrollment.courses?.price) {
          total += enrollment.courses.price;
        }
      });
    });
    return total;
  };

  // Calculer le montant déjà payé (basé sur les paiements)
  const calculatePaidAmount = (family: Family) => {
    let paid = 0;
    family.students.forEach(student => {
      student.payments.forEach(payment => {
        paid += payment.amount_cash || 0;
        paid += payment.amount_card || 0;
        paid += payment.amount_transfer || 0;
        // Chèques (jsonb ou string)
        let cheques = payment.cheques;
        if (typeof cheques === "string") {
          try {
            cheques = JSON.parse(cheques);
          } catch {
            cheques = [];
          }
        }
        if (Array.isArray(cheques)) {
          paid += cheques.reduce((sum, lot) => sum + (lot.count || 0) * (lot.amount || 0), 0);
        }
        if (payment.refund_amount) {
          paid -= payment.refund_amount;
        }
      });
    });
    return paid;
  };

  // Ouvrir la modal de saisie de paiement
  const handlePaymentInput = () => {
    setPaymentInputModalOpen(true);
    // Réinitialiser le formulaire
    setPaymentForm({
      cash_amount: 0,
      cheque_amount: 0,
      card_amount: 0,
      cheque_count: 0,
      bank_transfer: false,
      bank_transfer_amount: 0,
      books: false,
    });
  };

  // Enregistrer le paiement saisi
  const handleSavePayment = async () => {
    if (!selectedFamily) return;

    try {
      if (
        paymentForm.cash_amount <= 0 &&
        paymentForm.card_amount <= 0 &&
        paymentForm.bank_transfer_amount <= 0 &&
        totalCheques <= 0
      ) {
        alert("Veuillez saisir un montant à payer");
        return;
      }

      // Créer un paiement pour chaque étudiant qui a des cours
      const paymentsToCreate = selectedFamily.students
        .filter(student => student.enrollments.length > 0)
        .map(student => ({
          student_id: student.id,
          amount_cash: paymentForm.cash_amount,
          amount_card: paymentForm.card_amount,
          amount_transfer: paymentForm.bank_transfer_amount,
          refund_amount: refund,
          books: paymentForm.books,
          remarks: remarques,
          cheques: chequeLots,
        }));

      console.log("Paiements à créer:", paymentsToCreate);

      // Insérer les paiements
      const { data, error } = await supabase.from("payments").insert(paymentsToCreate).select();

      if (error) {
        console.error("Erreur lors de la création des paiements:", error);
        alert("Erreur lors de la création des paiements: " + error.message);
      } else {
        console.log("Paiements créés avec succès:", data);
        alert("Paiement enregistré avec succès !");
        setPaymentSuccess(true);
        setShowPaymentForm(false);
        setPaymentModalOpen(false);
        // Rafraîchir les données
        fetchFamilies();
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors du traitement du paiement");
    }
  };

  const filtered = families.filter(f => {
    const fullName = `${f?.first_name || ""} ${f?.last_name || ""}`.trim().toLowerCase();
    const email = (f?.email || "").toLowerCase();
    const phone = f?.phone || "";

    return (
      fullName.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase()) ||
      phone.includes(search)
    );
  });

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

  const [chequeLots, setChequeLots] = useState<ChequeLot[]>([
    { count: 0, amount: 0, banque: BANKS[0], nom: selectedFamily ? selectedFamily.last_name : "" },
  ]);
  const [refund, setRefund] = useState(0);
  const [remarques, setRemarques] = useState("");

  // Ajout/suppression de chèques
  const addChequeLot = () =>
    setChequeLots([
      ...chequeLots,
      {
        count: 1,
        amount: 0,
        banque: BANKS[0],
        nom: selectedFamily ? selectedFamily.last_name : "",
      },
    ]);
  const removeChequeLot = (idx: number) => setChequeLots(chequeLots.filter((_, i) => i !== idx));
  const updateChequeLot = (idx: number, field: keyof ChequeLot, value: any) =>
    setChequeLots(chequeLots.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));

  // Calcul du total des chèques
  const totalCheques = chequeLots.reduce((sum, lot) => sum + lot.count * lot.amount, 0);

  // Fonction pour calculer le montant payé par étudiant
  const calculateStudentPaidAmount = (student: Student) => {
    let paid = 0;
    student.payments.forEach(payment => {
      paid += payment.amount_cash || 0;
      paid += payment.amount_card || 0;
      paid += payment.amount_transfer || 0;
      // Chèques (jsonb ou string)
      let cheques = payment.cheques;
      if (typeof cheques === "string") {
        try {
          cheques = JSON.parse(cheques);
        } catch {
          cheques = [];
        }
      }
      if (Array.isArray(cheques)) {
        paid += cheques.reduce((sum, lot) => sum + (lot.count || 0) * (lot.amount || 0), 0);
      }
      if (payment.refund_amount) {
        paid -= payment.refund_amount;
      }
    });
    return paid;
  };

  // Fonction pour calculer le montant total des cours par étudiant
  const calculateStudentTotalAmount = (student: Student) => {
    let total = 0;
    student.enrollments.forEach(enrollment => {
      if (enrollment.courses?.price) {
        total += enrollment.courses.price;
      }
    });
    return total;
  };

  // Fonction pour déterminer le statut de paiement
  const getPaymentStatus = (student: Student) => {
    const paidAmount = calculateStudentPaidAmount(student);
    const totalAmount = calculateStudentTotalAmount(student);

    if (paidAmount >= totalAmount && totalAmount > 0) {
      return { status: "Payé", className: "bg-green-100 text-green-800" };
    } else if (paidAmount > 0) {
      return { status: "Partiel", className: "bg-orange-100 text-orange-800" };
    } else {
      return { status: "En attente", className: "bg-yellow-100 text-yellow-800" };
    }
  };

  // Fonction pour réinitialiser le formulaire de paiement
  const resetPaymentForm = () => {
    setPaymentForm({
      cash_amount: 0,
      cheque_amount: 0,
      card_amount: 0,
      cheque_count: 0,
      bank_transfer: false,
      bank_transfer_amount: 0,
      books: false,
    });
    setChequeLots([
      {
        count: 0,
        amount: 0,
        banque: BANKS[0],
        nom: selectedFamily ? selectedFamily.last_name : "",
      },
    ]);
    setRefund(0);
    setRemarques("");
  };

  return (
    <div className="space-y-6">
      {/* Messages de feedback */}
      {deleteMessage && (
        <Alert className={deleteMessage.includes("succès") ? "border-green-500" : "border-red-500"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{deleteMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Familles ({families.length})</CardTitle>
          <div className="flex gap-3 items-center">
            <Select value={currentSchoolYear || ""} onValueChange={setCurrentSchoolYear}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sélectionner l'année" />
              </SelectTrigger>
              <SelectContent>
                {schoolYears.map(year => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.label ||
                      `${new Date(year.start_date).getFullYear()}-${new Date(year.start_date).getFullYear() + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <FamilyFormModal onFamilyCreated={fetchFamilies} />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left font-medium">Nom</th>
                  <th className="p-3 text-left font-medium">Email</th>
                  <th className="p-3 text-left font-medium">Téléphone</th>
                  <th className="p-3 text-left font-medium"># Étudiants</th>
                  <th className="p-3 text-left font-medium">Adresse</th>
                  <th className="p-3 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">
                          {f.first_name} {f.last_name.toUpperCase()}
                        </p>
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">{f.email}</td>
                    <td className="p-3 text-gray-600">{f.phone || "-"}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {f.students.length}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 text-sm">
                      {f.address
                        ? `${f.address}, ${f.postal_code || ""} ${f.city || ""}`.trim()
                        : "-"}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center space-x-1">
                        <Button variant="outline" size="sm" title="Voir les détails">
                          <Eye size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          title="Gérer les paiements"
                          onClick={() => handlePaymentManagement(f)}
                        >
                          <CreditCard size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          title="Modifier"
                          onClick={() => {
                            // TODO: Implémenter la modification
                            alert("Fonction de modification à implémenter");
                          }}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          title="Supprimer"
                          onClick={() => handleDelete(f)}
                          disabled={f.students.length > 0}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      {search
                        ? "Aucune famille trouvée pour cette recherche."
                        : "Aucune famille enregistrée."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de gestion des paiements (fusionnée avec saisie) */}
      {selectedFamily && (
        <Dialog
          open={paymentModalOpen}
          onOpenChange={open => {
            setPaymentModalOpen(open);
            setShowPaymentForm(false);
          }}
        >
          <DialogContent className="w-full max-w-[40vw] max-h-[95vh] overflow-auto p-4 sm:p-8">
            <DialogHeader>
              <DialogTitle>
                {showPaymentForm
                  ? `Saisir un paiement - Famille ${selectedFamily.last_name}`
                  : `Gestion des paiements - Famille ${selectedFamily.last_name}`}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {showPaymentForm ? (
                <>
                  {/* Formulaire de paiement (reprendre la version harmonisée) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="cash_amount">Espèces (€)</Label>
                      <Input
                        id="cash_amount"
                        type="number"
                        min={0}
                        value={paymentForm.cash_amount}
                        onChange={e =>
                          setPaymentForm(prev => ({
                            ...prev,
                            cash_amount: parseFloat(e.target.value) || 0,
                          }))
                        }
                        placeholder="0.00"
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
                          setPaymentForm(prev => ({
                            ...prev,
                            card_amount: parseFloat(e.target.value) || 0,
                          }))
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bank_transfer_amount">Virement bancaire (€)</Label>
                      <Input
                        id="bank_transfer_amount"
                        type="number"
                        min={0}
                        value={
                          paymentForm.bank_transfer ? paymentForm.bank_transfer_amount || 0 : 0
                        }
                        onChange={e =>
                          setPaymentForm(prev => ({
                            ...prev,
                            bank_transfer: true,
                            bank_transfer_amount: parseFloat(e.target.value) || 0,
                          }))
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  {/* Chèques */}
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
                              type="number"
                              min={1}
                              value={lot.count}
                              onChange={e =>
                                updateChequeLot(idx, "count", parseInt(e.target.value) || 1)
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
                                updateChequeLot(idx, "amount", parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>
                          <div>
                            <Label>Banque</Label>
                            <Select
                              value={lot.banque}
                              onValueChange={val => updateChequeLot(idx, "banque", val)}
                            >
                              <SelectTrigger className="w-full" />
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
                        <div className="flex justify-end mt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeChequeLot(idx)}
                            title="Supprimer"
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      className="mt-2 w-full"
                      size="sm"
                      variant="outline"
                      onClick={addChequeLot}
                    >
                      Ajouter un lot de chèques
                    </Button>
                    <div className="mt-2 text-right text-sm text-gray-700 font-medium">
                      Total chèques saisis : {totalCheques} €
                    </div>
                  </div>
                  {/* Remboursement */}
                  <div>
                    <Label htmlFor="refund">Montant remboursé (€)</Label>
                    <Input
                      id="refund"
                      type="number"
                      min={0}
                      value={refund}
                      onChange={e => setRefund(parseFloat(e.target.value) || 0)}
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
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button onClick={handleSavePayment} className="flex-1">
                      Enregistrer le paiement
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowPaymentForm(false)}
                      className="flex-1"
                    >
                      Retour
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Récapitulatif famille et paiements (comme avant) */}
                  {/* Récapitulatif famille */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">
                      Famille {selectedFamily.first_name} {selectedFamily.last_name}
                    </h4>
                    <p className="text-sm text-blue-600">{selectedFamily.email}</p>
                    <p className="text-sm text-blue-600">{selectedFamily.phone}</p>
                  </div>

                  {/* Informations sur les élèves et cours */}
                  <div>
                    <h4 className="font-medium mb-3">
                      Cours de l'année{" "}
                      {currentSchoolYear
                        ? schoolYears.find(y => y.id === currentSchoolYear)?.label ||
                          `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
                        : "courante"}
                    </h4>
                    <div className="space-y-3">
                      {selectedFamily.students.map((student, index) => (
                        <div key={student.id} className="p-3 bg-gray-50 rounded-lg">
                          <h5 className="font-medium text-sm">
                            {student.first_name} {student.last_name}
                            <span className="text-xs text-gray-500 ml-2">
                              ({student.registration_type === "child" ? "Enfant" : "Adulte"})
                            </span>
                          </h5>
                          {student.enrollments.length > 0 ? (
                            <div className="mt-2 space-y-1">
                              {student.enrollments.map(enrollment => (
                                <div
                                  key={enrollment.id}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                >
                                  <div>
                                    <span className="font-medium">{enrollment.courses?.name}</span>
                                    <div className="text-sm text-gray-600">
                                      {enrollment.courses?.type}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-lg">
                                      {enrollment.courses?.price || 0}€
                                    </span>
                                    {(() => {
                                      const paymentStatus = getPaymentStatus(student);
                                      return (
                                        <span
                                          className={`px-2 py-1 rounded text-xs font-medium ${paymentStatus.className}`}
                                        >
                                          {paymentStatus.status}
                                        </span>
                                      );
                                    })()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                              <p className="text-xs text-yellow-700">
                                ⚠️ Aucun cours inscrit pour cette année scolaire
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Résumé des paiements */}
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium mb-3 text-yellow-800">
                      Résumé des paiements - Année{" "}
                      {currentSchoolYear
                        ? schoolYears.find(y => y.id === currentSchoolYear)?.label ||
                          `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
                        : "courante"}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total des cours :</span>
                        <span className="font-bold text-lg">
                          {calculateTotalAmount(selectedFamily)}€
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Cours payés :</span>
                        <span className="text-sm text-green-600 font-medium">
                          {calculatePaidAmount(selectedFamily)}€
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="font-medium">Reste à payer :</span>
                        <span className="font-bold text-lg text-red-600">
                          {calculateTotalAmount(selectedFamily) -
                            calculatePaidAmount(selectedFamily)}
                          €
                        </span>
                      </div>
                    </div>
                    {calculateTotalAmount(selectedFamily) - calculatePaidAmount(selectedFamily) ===
                      0 && (
                      <div className="mt-3 p-2 bg-green-100 rounded border border-green-200">
                        <p className="text-sm text-green-700 font-medium">
                          ✅ Tous les cours de cette année sont payés !
                        </p>
                      </div>
                    )}

                    {/* Détails des paiements existants - Refait et stylé */}
                    {selectedFamily.students.some(student => student.payments.length > 0) && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <h5 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <CreditCard size={18} />
                          Détails des paiements (
                          {currentSchoolYear
                            ? schoolYears.find(y => y.id === currentSchoolYear)?.label ||
                              currentSchoolYear
                            : "Année en cours"}
                          )
                        </h5>
                        <div className="space-y-3">
                          {selectedFamily.students.map(student => {
                            // Filtrer les paiements par année scolaire
                            const studentPayments = student.payments.filter(payment => {
                              const paymentDate = new Date(payment.created_at);
                              const currentYear = new Date().getFullYear();
                              return paymentDate.getFullYear() === currentYear;
                            });

                            if (studentPayments.length === 0) return null;

                            return (
                              <div
                                key={student.id}
                                className="bg-white rounded-lg p-3 shadow-sm border border-blue-100"
                              >
                                <div className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  {student.first_name} {student.last_name}
                                </div>
                                <div className="space-y-2">
                                  {studentPayments.map(payment => {
                                    const paymentMethods = [];

                                    // Espèces
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

                                    // Carte
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

                                    // Virement
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

                                    // Chèques
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
                                        cheques.forEach((lot, idx) => {
                                          if (lot.count && lot.amount) {
                                            paymentMethods.push(
                                              <span
                                                key={`cheque-${idx}`}
                                                className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium"
                                              >
                                                �� {lot.count} chèque{lot.count > 1 ? "s" : ""} de{" "}
                                                {lot.amount}€ ({lot.banque})
                                              </span>
                                            );
                                          }
                                        });
                                      }
                                    }

                                    // Remboursement
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

                                    // Livres
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

                                    return (
                                      <div
                                        key={payment.id}
                                        className="border-l-2 border-blue-200 pl-3"
                                      >
                                        <div className="text-xs text-gray-500 mb-1">
                                          {new Date(payment.created_at).toLocaleDateString(
                                            "fr-FR",
                                            {
                                              day: "2-digit",
                                              month: "2-digit",
                                              year: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            }
                                          )}
                                        </div>
                                        <div className="flex flex-wrap gap-1">{paymentMethods}</div>
                                        {payment.remarks && (
                                          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                            💬 {payment.remarks}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        resetPaymentForm();
                        setShowPaymentForm(true);
                      }}
                      className="flex-1"
                      disabled={
                        calculateTotalAmount(selectedFamily) -
                          calculatePaidAmount(selectedFamily) ===
                        0
                      }
                    >
                      Saisir un paiement
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPaymentModalOpen(false)}
                      className="flex-1"
                    >
                      Fermer
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
