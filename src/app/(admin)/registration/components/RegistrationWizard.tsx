"use client";

import React, { useMemo, useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSchoolYear } from "../../SchoolYearProvider";
import { createOnsiteRegistration, OnsiteRegistrationPayload } from "../actions/actions.server";
import { Users, User, BookOpen, CreditCard, Trash2, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export default function RegistrationWizard({
  families,
  courses,
}: {
  families: { id: string; name: string }[];
  courses: { id: string; label: string; type?: string; price?: number }[];
}) {
  const { currentSchoolYearId } = useSchoolYear();
  const [isPending, startTransition] = useTransition();

  // Étape 1: Famille
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [newFamily, setNewFamily] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    postal_code: "",
    city: "",
  });

  // Étape 2: Élèves
  type NewStudent = {
    isNew: true;
    first_name: string;
    last_name: string;
    birth_date: string;
    registration_type: "child" | "adult";
    notes?: string | null;
  };
  type ExistingStudent = { id: string; isNew?: false };
  const [students, setStudents] = useState<Array<NewStudent | ExistingStudent>>([
    { isNew: true, first_name: "", last_name: "", birth_date: "", registration_type: "child" },
  ]);

  // Étape 3: Cours
  const [studentCourses, setStudentCourses] = useState<
    { studentRefIndex: number; courseIds: string[] }[]
  >([]);

  // Étape 4: Paiement (optionnel)
  const [payment, setPayment] = useState({
    amount_cash: 0,
    amount_card: 0,
    amount_transfer: 0,
    refund_amount: 0,
    books: false,
    remarks: "",
  });

  // Gestion des chèques
  type ChequeLot = { count: number; amount: number; banque: string; nom: string };
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
    { count: 1, amount: 0, banque: BANKS[0], nom: "" },
  ]);
  const totalCheques = useMemo(
    () =>
      chequeLots.reduce(
        (sum, lot) => sum + (Number(lot.count) || 0) * (Number(lot.amount) || 0),
        0
      ),
    [chequeLots]
  );

  const canSubmit = useMemo(
    () => !!currentSchoolYearId && (familyId || newFamily.email),
    [currentSchoolYearId, familyId, newFamily.email]
  );

  const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-100 rounded-lg">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <CardTitle className="text-lg md:text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        {title}
      </CardTitle>
    </div>
  );

  const submit = () => {
    if (!currentSchoolYearId) return;
    const payload: OnsiteRegistrationPayload = {
      schoolYearId: currentSchoolYearId,
      familyId: familyId || null,
      newFamily: familyId
        ? null
        : {
            first_name: newFamily.first_name,
            last_name: newFamily.last_name,
            email: newFamily.email,
            phone: newFamily.phone || null,
            address: newFamily.address || null,
            postal_code: newFamily.postal_code || null,
            city: newFamily.city || null,
          },
      students,
      enrollments: studentCourses,
      payment: {
        ...payment,
        cheques: chequeLots,
      },
    };

    const form = new FormData();
    form.set("payload", JSON.stringify(payload));

    startTransition(async () => {
      await createOnsiteRegistration({} as any, form);
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-4">
          <SectionHeader icon={Users} title="Étape 1 — Famille" />
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 p-6">
          <div className="space-y-2">
            <Label className="text-sm text-gray-700">Famille existante</Label>
            <Select value={familyId || undefined} onValueChange={v => setFamilyId(v)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {families.map(f => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label className="text-sm text-gray-700">Ou créer une nouvelle</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Nom"
                value={newFamily.last_name}
                onChange={e => setNewFamily(s => ({ ...s, last_name: e.target.value }))}
                className="h-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              />
              <Input
                placeholder="Prénom"
                value={newFamily.first_name}
                onChange={e => setNewFamily(s => ({ ...s, first_name: e.target.value }))}
                className="h-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              />
              <Input
                placeholder="Email"
                value={newFamily.email}
                onChange={e => setNewFamily(s => ({ ...s, email: e.target.value }))}
                className="h-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              />
              <Input
                placeholder="Téléphone"
                value={newFamily.phone}
                onChange={e => setNewFamily(s => ({ ...s, phone: e.target.value }))}
                className="h-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              />
              <Input
                placeholder="Adresse"
                value={newFamily.address}
                onChange={e => setNewFamily(s => ({ ...s, address: e.target.value }))}
                className="h-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              />
              <Input
                placeholder="Code postal"
                value={newFamily.postal_code}
                onChange={e => setNewFamily(s => ({ ...s, postal_code: e.target.value }))}
                className="h-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              />
              <Input
                placeholder="Ville"
                value={newFamily.city}
                onChange={e => setNewFamily(s => ({ ...s, city: e.target.value }))}
                className="h-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-4">
          <SectionHeader icon={User} title="Étape 2 — Élèves" />
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {students.map((s, idx) => (
            <div key={idx} className="grid md:grid-cols-4 gap-3">
              {"isNew" in s ? (
                <>
                  <Input
                    placeholder="Nom"
                    value={s.last_name}
                    onChange={e =>
                      setStudents(cur =>
                        cur.map((c, i) =>
                          i === idx ? { ...(c as any), last_name: e.target.value } : c
                        )
                      )
                    }
                    className="h-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                  />
                  <Input
                    placeholder="Prénom"
                    value={s.first_name}
                    onChange={e =>
                      setStudents(cur =>
                        cur.map((c, i) =>
                          i === idx ? { ...(c as any), first_name: e.target.value } : c
                        )
                      )
                    }
                    className="h-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                  />
                  <Input
                    type="date"
                    value={s.birth_date}
                    onChange={e =>
                      setStudents(cur =>
                        cur.map((c, i) =>
                          i === idx ? { ...(c as any), birth_date: e.target.value } : c
                        )
                      )
                    }
                    className="h-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                  />
                  <Select
                    value={s.registration_type}
                    onValueChange={v =>
                      setStudents(cur =>
                        cur.map((c, i) =>
                          i === idx ? { ...(c as any), registration_type: v as any } : c
                        )
                      )
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="child">Enfant</SelectItem>
                      <SelectItem value="adult">Adulte</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <Input value={s.id} readOnly className="h-10" />
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setStudents(cur => [
                  ...cur,
                  {
                    isNew: true,
                    first_name: "",
                    last_name: "",
                    birth_date: "",
                    registration_type: "child",
                  },
                ])
              }
            >
              + Ajouter un élève
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-4">
          <SectionHeader icon={BookOpen} title="Étape 3 — Cours" />
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {students.map((_, idx) => (
            <div key={idx} className="space-y-2">
              <Label className="text-sm text-gray-700">Élève {idx + 1}</Label>
              <Select
                multiple={false as any}
                onValueChange={courseId =>
                  setStudentCourses(cur => {
                    const existing = cur.find(e => e.studentRefIndex === idx);
                    if (existing) {
                      return cur.map(e =>
                        e.studentRefIndex === idx ? { ...e, courseIds: [courseId] } : e
                      );
                    }
                    return [...cur, { studentRefIndex: idx, courseIds: [courseId] }];
                  })
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Sélectionner un cours" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-4">
          <SectionHeader icon={CreditCard} title="Étape 4 — Paiement (optionnel)" />
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm text-gray-700">Espèces (€)</Label>
              <Input
                type="number"
                placeholder="0"
                value={payment.amount_cash}
                onChange={e =>
                  setPayment(p => ({ ...p, amount_cash: parseFloat(e.target.value) || 0 }))
                }
                className="h-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              />
            </div>
            <div>
              <Label className="text-sm text-gray-700">Carte (€)</Label>
              <Input
                type="number"
                placeholder="0"
                value={payment.amount_card}
                onChange={e =>
                  setPayment(p => ({ ...p, amount_card: parseFloat(e.target.value) || 0 }))
                }
                className="h-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              />
            </div>
            <div>
              <Label className="text-sm text-gray-700">Virement (€)</Label>
              <Input
                type="number"
                placeholder="0"
                value={payment.amount_transfer}
                onChange={e =>
                  setPayment(p => ({ ...p, amount_transfer: parseFloat(e.target.value) || 0 }))
                }
                className="h-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              />
            </div>
            <div>
              <Label className="text-sm text-gray-700">Remboursement (€)</Label>
              <Input
                type="number"
                placeholder="0"
                value={payment.refund_amount}
                onChange={e =>
                  setPayment(p => ({ ...p, refund_amount: parseFloat(e.target.value) || 0 }))
                }
                className="h-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Chèques */}
          <div className="bg-gray-50 rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium text-gray-800">Chèques</div>
              <div className="text-sm text-gray-600">Total: {totalCheques}€</div>
            </div>

            {chequeLots.map((lot, idx) => (
              <div key={idx} className="space-y-2 border rounded p-4 mb-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Trash2 className="h-4 w-4 mr-1" /> Supprimer
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
                  { count: 1, amount: 0, banque: BANKS[0], nom: "" },
                ])
              }
            >
              <Plus className="h-4 w-4 mr-1" /> Ajouter un lot de chèques
            </Button>
          </div>

          <div>
            <Label className="text-sm text-gray-700">Remarques</Label>
            <Textarea
              placeholder="Informations complémentaires (optionnel)"
              value={payment.remarks}
              onChange={e => setPayment(p => ({ ...p, remarks: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled={isPending} onClick={() => location.reload()}>
          Annuler
        </Button>
        <Button disabled={!canSubmit || isPending} onClick={submit}>
          {isPending ? "Enregistrement..." : "Valider l’inscription"}
        </Button>
      </div>
    </div>
  );
}
