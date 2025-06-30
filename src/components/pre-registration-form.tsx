"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  CheckCircle,
  Mail,
  Phone,
  Plus,
  Send,
  Trash2,
  User,
  Users,
} from "lucide-react";
import React, { useState } from "react";

type FamilyInfo = {
  familyName: string;
  parentFirstName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  postalCode: string;
  city: string;
};

type StudentInfo = {
  firstName: string;
  lastName: string;
  birthDate: string;
};

export default function PreRegistrationForm() {
  const [step, setStep] = useState(1);
  const [family, setFamily] = useState<FamilyInfo>({
    familyName: "",
    parentFirstName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    postalCode: "",
    city: "",
  });

  const [students, setStudents] = useState<StudentInfo[]>([
    { firstName: "", lastName: "", birthDate: "" },
  ]);

  const [appointmentDay, setAppointmentDay] = useState<Date | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    const response = await fetch("/api/pre-registration", {
      method: "POST",
      body: JSON.stringify({
        family,
        students,
        appointmentDay: appointmentDay?.toISOString().split("T")[0],
      }),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (response.ok) {
      setSuccessMessage(result.message || "Votre demande a bien été enregistrée.");
      // Réinitialise le formulaire
      setFamily({
        familyName: "",
        parentFirstName: "",
        contactEmail: "",
        contactPhone: "",
        address: "",
        postalCode: "",
        city: "",
      });
      setStudents([{ firstName: "", lastName: "", birthDate: "" }]);
      setAppointmentDay(null);
      setStep(1);
    } else {
      alert(result.error || "Erreur lors de l'envoi.");
    }
  };

  const removeStudent = (index: number) => {
    if (students.length > 1) {
      setStudents(prev => prev.filter((_, i) => i !== index));
    }
  };

  const steps = [
    { id: 1, title: "Informations famille", icon: Users },
    { id: 2, title: "Élèves", icon: User },
    { id: 3, title: "Rendez-vous", icon: CalendarIcon },
    { id: 4, title: "Confirmation", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Préinscription en ligne
            </h1>
            <p className="text-gray-600 text-lg">
              Commencez votre parcours avec nous en quelques étapes simples
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 mb-6">
              {steps.map((stepInfo, index) => (
                <div key={stepInfo.id} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
                      step >= stepInfo.id
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 border-blue-600 text-white"
                        : "border-gray-300 text-gray-400"
                    )}
                  >
                    <stepInfo.icon size={20} />
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-12 h-1 mx-2 transition-all duration-300",
                        step > stepInfo.id
                          ? "bg-gradient-to-r from-blue-600 to-purple-600"
                          : "bg-gray-200"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <Badge variant="outline" className="text-sm">
                Étape {step} sur {steps.length}: {steps[step - 1]?.title}
              </Badge>
            </div>
          </div>

          {/* Main Card */}
          {successMessage && (
            <div className="mb-6 text-center text-green-600 font-semibold">{successMessage}</div>
          )}

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                {React.createElement(steps[step - 1]?.icon, { size: 24 })}
                {steps[step - 1]?.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Step 1: Family Information */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="parentFirstName">Prénom du parent *</Label>
                      <Input
                        id="parentFirstName"
                        placeholder="Entrez le prénom du parent"
                        value={family.parentFirstName}
                        onChange={e => setFamily({ ...family, parentFirstName: e.target.value })}
                        className="mt-2 h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="familyName">Nom de famille *</Label>
                      <Input
                        id="familyName"
                        placeholder="Entrez le nom de famille"
                        value={family.familyName}
                        onChange={e => setFamily({ ...family, familyName: e.target.value })}
                        className="mt-2 h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactEmail">Email de contact *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="votre@email.com"
                        value={family.contactEmail}
                        onChange={e => setFamily({ ...family, contactEmail: e.target.value })}
                        className="mt-2 h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPhone">Téléphone *</Label>
                      <Input
                        id="contactPhone"
                        placeholder="06 12 34 56 78"
                        value={family.contactPhone}
                        onChange={e => setFamily({ ...family, contactPhone: e.target.value })}
                        className="mt-2 h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Adresse *</Label>
                      <Input
                        id="address"
                        placeholder="10 rue des écoles"
                        value={family.address}
                        onChange={e => setFamily({ ...family, address: e.target.value })}
                        className="mt-2 h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Code postal *</Label>
                      <Input
                        id="postalCode"
                        placeholder="75000"
                        value={family.postalCode}
                        onChange={e => setFamily({ ...family, postalCode: e.target.value })}
                        className="mt-2 h-12"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="city">Ville *</Label>
                      <Input
                        id="city"
                        placeholder="Paris"
                        value={family.city}
                        onChange={e => setFamily({ ...family, city: e.target.value })}
                        className="mt-2 h-12"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Students */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  {students.map((student, index) => (
                    <Card key={index} className="p-6 border-2 border-dashed border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <User size={20} />
                          Élève {index + 1}
                        </h3>
                        {students.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStudent(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-base font-medium">Prénom *</Label>
                          <Input
                            placeholder="Prénom de l'élève"
                            value={student.firstName}
                            onChange={e =>
                              setStudents(prev =>
                                prev.map((s, i) =>
                                  i === index ? { ...s, firstName: e.target.value } : s
                                )
                              )
                            }
                            className="mt-2 h-12"
                          />
                        </div>
                        <div>
                          <Label className="text-base font-medium">Nom *</Label>
                          <Input
                            placeholder="Nom de l'élève"
                            value={student.lastName}
                            onChange={e =>
                              setStudents(prev =>
                                prev.map((s, i) =>
                                  i === index ? { ...s, lastName: e.target.value } : s
                                )
                              )
                            }
                            className="mt-2 h-12"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-base font-medium">Date de naissance *</Label>
                          <Input
                            type="date"
                            value={student.birthDate}
                            onChange={e =>
                              setStudents(prev =>
                                prev.map((s, i) =>
                                  i === index ? { ...s, birthDate: e.target.value } : s
                                )
                              )
                            }
                            className="mt-2 h-12"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setStudents(prev => [
                          ...prev,
                          { firstName: "", lastName: "", birthDate: "" },
                        ])
                      }
                      className="border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 h-12 px-6"
                    >
                      <Plus size={20} className="mr-2" />
                      Ajouter un enfant
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Appointment */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center">
                    <p className="text-gray-600 mb-6">
                      Choisissez votre jour de rendez-vous. Un seul choix possible.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 border rounded-lg px-4 py-3 bg-white shadow-sm">
                      <input
                        type="radio"
                        name="appointment"
                        value="2025-06-28"
                        checked={
                          appointmentDay?.toDateString() === new Date("2025-06-28").toDateString()
                        }
                        onChange={() => setAppointmentDay(new Date("2025-06-28"))}
                      />
                      Samedi 28 juin 2025
                    </label>
                    <label className="flex items-center gap-3 border rounded-lg px-4 py-3 bg-white shadow-sm">
                      <input
                        type="radio"
                        name="appointment"
                        value="2025-06-29"
                        checked={
                          appointmentDay?.toDateString() === new Date("2025-06-29").toDateString()
                        }
                        onChange={() => setAppointmentDay(new Date("2025-06-29"))}
                      />
                      Dimanche 29 juin 2025
                    </label>
                  </div>
                  {appointmentDay && (
                    <div className="text-center">
                      <Badge className="bg-green-100 text-green-800 text-base px-4 py-2">
                        Jour sélectionné :{" "}
                        {format(appointmentDay, "EEEE d MMMM yyyy", { locale: fr })}
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center mb-6">
                    <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Vérification des informations</h3>
                    <p className="text-gray-600">
                      Merci de vérifier vos informations avant de soumettre votre demande.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Family Info */}
                    <Card className="p-6 bg-blue-50 border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                        <Users size={20} />
                        Informations famille
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Nom :</strong> {family.familyName}
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail size={14} />
                          {family.contactEmail}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone size={14} />
                          {family.contactPhone}
                        </p>
                      </div>
                    </Card>

                    {/* Students Info */}
                    <Card className="p-6 bg-purple-50 border-purple-200">
                      <h4 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                        <User size={20} />
                        Élèves ({students.length})
                      </h4>
                      <div className="space-y-2 text-sm">
                        {students.map((student, index) => (
                          <div key={index} className="flex justify-between">
                            <span>
                              {student.firstName} {student.lastName}
                            </span>
                            <span className="text-gray-600">
                              {student.birthDate
                                ? format(new Date(student.birthDate), "dd/MM/yyyy")
                                : "Non défini"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* Appointment Info */}
                  <Card className="p-6 bg-green-50 border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <CalendarIcon size={20} />
                      Rendez-vous
                    </h4>
                    <p className="text-sm">
                      {appointmentDay
                        ? format(appointmentDay, "dd/MM/yyyy")
                        : "Aucun jour sélectionné"}
                    </p>
                  </Card>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 mt-8 border-t">
                {step > 1 ? (
                  <Button variant="outline" onClick={handleBack} className="h-12 px-6">
                    <ArrowLeft size={16} className="mr-2" />
                    Retour
                  </Button>
                ) : (
                  <div />
                )}
                {step < 4 ? (
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-6"
                  >
                    Suivant
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-12 px-6"
                  >
                    <Send size={16} className="mr-2" />
                    Envoyer la demande
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-600">
            <p className="text-sm">
              Une question ? Contactez-nous au <strong>01 23 45 67 89</strong> ou à{" "}
              <strong>contact@ecole.fr</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
