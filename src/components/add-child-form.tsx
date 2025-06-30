"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Search,
  Send,
  User,
  Users,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { searchFamily, SearchFamilyState } from "@/lib/actions/search-family";
import { addStudent, AddStudentState } from "@/lib/actions/add-student";
import React from "react";

type StudentInfo = {
  firstName: string;
  lastName: string;
  birthDate: string;
};

export default function AddChildForm() {
  const [step, setStep] = useState(1);
  const [foundFamily, setFoundFamily] = useState<any>(null);

  const [student, setStudent] = useState<StudentInfo & { type: string }>({
    firstName: "",
    lastName: "",
    birthDate: "",
    type: "child", // child ou adult
  });

  const [appointmentDay, setAppointmentDay] = useState<Date | null>(null);

  // Server Actions states
  const initialSearchState: SearchFamilyState = {};
  const [searchState, searchAction] = useActionState(searchFamily, initialSearchState);

  const initialAddState: AddStudentState = {};
  const [addState, addAction] = useActionState(addStudent, initialAddState);

  // Handle search success
  React.useEffect(() => {
    if (searchState.success && searchState.family) {
      setFoundFamily(searchState.family);
      // Note: On ne pré-remplit plus le nom pour des raisons de sécurité
      setStep(2);
    }
  }, [searchState]);

  // Handle add child success
  React.useEffect(() => {
    if (addState.success) {
      // Reset du formulaire après succès
      setStep(1);
      setFoundFamily(null);
      setStudent({ firstName: "", lastName: "", birthDate: "", type: "child" });
      setAppointmentDay(null);
    }
  }, [addState]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const steps = [
    { id: 1, title: "Identification famille", icon: Search },
    { id: 2, title: "Nouvel élève", icon: UserPlus },
    { id: 3, title: "Rendez-vous", icon: CalendarIcon },
    { id: 4, title: "Confirmation", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="container mx-auto py-8 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Link href="/" className="text-emerald-600 hover:text-emerald-700 transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <Badge className="bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-800 border-emerald-200">
                👨‍👩‍👧‍👦 Famille existante
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Ajouter une personne
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Ajoutez facilement un nouvel élève (enfant ou adulte) à votre dossier famille existant
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-4 sm:mb-6 overflow-x-auto pb-2">
              {steps.map((stepInfo, index) => (
                <div key={stepInfo.id} className="flex items-center shrink-0">
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300",
                      step >= stepInfo.id
                        ? "bg-gradient-to-r from-emerald-600 to-blue-600 border-emerald-600 text-white"
                        : "border-gray-300 text-gray-400"
                    )}
                  >
                    <stepInfo.icon size={18} />
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-8 sm:w-12 h-1 mx-1 sm:mx-2 transition-all duration-300",
                        step > stepInfo.id
                          ? "bg-gradient-to-r from-emerald-600 to-blue-600"
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

          {/* Messages */}
          {addState.message && (
            <div className="mb-6 text-center">
              <Alert
                className={
                  addState.success
                    ? "border-green-500 text-green-700 bg-green-50"
                    : "border-red-500 text-red-700 bg-red-50"
                }
              >
                {addState.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription className="font-medium">{addState.message}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Main Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="flex items-center justify-center gap-2 text-xl sm:text-2xl">
                {React.createElement(steps[step - 1]?.icon, { size: 24 })}
                {steps[step - 1]?.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Step 1: Family Search */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="text-emerald-600" size={28} />
                    </div>
                    <p className="text-gray-600">
                      Pour ajouter un élève, nous devons d'abord identifier votre famille dans notre
                      base de données.
                    </p>
                  </div>

                  <form action={searchAction} className="max-w-md mx-auto space-y-4">
                    <div>
                      <Label htmlFor="email">Email de la famille *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="votre@email.com"
                        required
                        className="mt-2 h-12"
                      />
                    </div>

                    <div>
                      <Label htmlFor="familyName">Nom de famille *</Label>
                      <Input
                        id="familyName"
                        name="familyName"
                        placeholder="Martin"
                        required
                        className="mt-2 h-12"
                      />
                    </div>

                    {searchState.error && (
                      <Alert className="border-red-500 text-red-700 bg-red-50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{searchState.error}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 h-12"
                    >
                      Vérifier ma famille
                      <Search size={16} className="ml-2" />
                    </Button>
                  </form>

                  <div className="text-center pt-6 border-t">
                    <p className="text-sm text-gray-500 mb-3">Vous n'êtes pas encore inscrit ?</p>
                    <Link href="/pre-registration">
                      <Button variant="outline" size="sm">
                        Faire une première inscription
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Step 2: Family Found + New Child */}
              {step === 2 && foundFamily && (
                <div className="space-y-6 animate-fade-in">
                  {/* Family Info Display */}
                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-emerald-800">
                        <Users size={20} />
                        Famille trouvée
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-emerald-700 font-medium">Famille :</span>{" "}
                          {foundFamily.familyName}
                        </div>
                        <div>
                          <span className="text-emerald-700 font-medium">Contact :</span>{" "}
                          {foundFamily.parentFirstName}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-emerald-600" />
                          <span>{foundFamily.contactEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-emerald-600" />
                          <span>{foundFamily.contactPhone || "Non renseigné"}</span>
                        </div>
                      </div>

                      {foundFamily.existingChildren && foundFamily.existingChildren.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-emerald-200">
                          <span className="text-emerald-700 font-medium text-sm">
                            Élèves déjà inscrits :
                          </span>
                          <div className="mt-2 space-y-1">
                            {foundFamily.existingChildren.map((child: any, index: any) => (
                              <div key={index} className="text-sm text-emerald-700">
                                • {child.firstName} {child.lastName} ({child.age} ans)
                                {child.courses.length > 0 && (
                                  <span className="text-emerald-600">
                                    {" "}
                                    - {child.courses.join(", ")}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* New Student Form */}
                  <Card className="border-2 border-dashed border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        <UserPlus size={20} />
                        Nouvel élève à ajouter
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Type selection */}
                      <div>
                        <Label className="text-base font-medium">Type d'inscription *</Label>
                        <div className="mt-2 grid grid-cols-2 gap-4">
                          <label className="flex items-center gap-3 border rounded-lg px-4 py-3 bg-white shadow-sm cursor-pointer hover:bg-blue-50 transition-colors">
                            <input
                              type="radio"
                              name="studentType"
                              value="child"
                              checked={student.type === "child"}
                              onChange={e => setStudent({ ...student, type: e.target.value })}
                            />
                            <span>Enfant</span>
                          </label>
                          <label className="flex items-center gap-3 border rounded-lg px-4 py-3 bg-white shadow-sm cursor-pointer hover:bg-blue-50 transition-colors">
                            <input
                              type="radio"
                              name="studentType"
                              value="adult"
                              checked={student.type === "adult"}
                              onChange={e => setStudent({ ...student, type: e.target.value })}
                            />
                            <span>Adulte</span>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-base font-medium">Prénom *</Label>
                          <Input
                            placeholder="Prénom de l'élève"
                            value={student.firstName}
                            onChange={e => setStudent({ ...student, firstName: e.target.value })}
                            className="mt-2 h-12"
                          />
                          {addState.errors?.firstName && (
                            <p className="text-sm text-red-500 mt-1">
                              {addState.errors.firstName[0]}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-base font-medium">Nom *</Label>
                          <Input
                            placeholder="Nom de l'élève"
                            value={student.lastName}
                            onChange={e => setStudent({ ...student, lastName: e.target.value })}
                            className="mt-2 h-12"
                          />
                          {addState.errors?.lastName && (
                            <p className="text-sm text-red-500 mt-1">
                              {addState.errors.lastName[0]}
                            </p>
                          )}
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-base font-medium">Date de naissance *</Label>
                          <Input
                            type="date"
                            value={student.birthDate}
                            onChange={e => setStudent({ ...student, birthDate: e.target.value })}
                            className="mt-2 h-12"
                          />
                          {addState.errors?.birthDate && (
                            <p className="text-sm text-red-500 mt-1">
                              {addState.errors.birthDate[0]}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 3: Appointment */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon className="text-blue-600" size={28} />
                    </div>
                    <p className="text-gray-600 mb-6">
                      Choisissez un créneau pour finaliser l'inscription de votre nouvel élève.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <label className="flex items-center gap-3 border rounded-lg px-4 py-3 bg-white shadow-sm cursor-pointer hover:bg-blue-50 transition-colors">
                      <input
                        type="radio"
                        name="appointment"
                        value="2025-07-05"
                        checked={
                          appointmentDay?.toDateString() === new Date("2025-07-05").toDateString()
                        }
                        onChange={() => setAppointmentDay(new Date("2025-07-05"))}
                      />
                      <span>Samedi 5 juillet 2025</span>
                    </label>
                    <label className="flex items-center gap-3 border rounded-lg px-4 py-3 bg-white shadow-sm cursor-pointer hover:bg-blue-50 transition-colors">
                      <input
                        type="radio"
                        name="appointment"
                        value="2025-07-06"
                        checked={
                          appointmentDay?.toDateString() === new Date("2025-07-06").toDateString()
                        }
                        onChange={() => setAppointmentDay(new Date("2025-07-06"))}
                      />
                      <span>Dimanche 6 juillet 2025</span>
                    </label>
                  </div>

                  {appointmentDay && (
                    <div className="text-center">
                      <Badge className="bg-blue-100 text-blue-800 text-base px-4 py-2">
                        Jour sélectionné :{" "}
                        {format(appointmentDay, "EEEE d MMMM yyyy", { locale: fr })}
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && foundFamily && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center mb-6">
                    <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Vérification des informations</h3>
                    <p className="text-gray-600">
                      Merci de vérifier les informations avant de confirmer l'ajout.
                    </p>
                  </div>

                  <form action={addAction}>
                    {/* Hidden fields */}
                    <input type="hidden" name="familyId" value={foundFamily?.id || ""} />
                    <input type="hidden" name="firstName" value={student.firstName} />
                    <input type="hidden" name="lastName" value={student.lastName} />
                    <input type="hidden" name="birthDate" value={student.birthDate} />
                    <input type="hidden" name="studentType" value={student.type} />
                    <input
                      type="hidden"
                      name="appointmentDay"
                      value={appointmentDay?.toISOString().split("T")[0] || ""}
                    />

                    {/* Student Info Only - No Family Details */}
                    <Card className="p-4 sm:p-6 bg-blue-50 border-blue-200 mb-6">
                      <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                        <UserPlus size={20} />
                        Nouvel élève à ajouter
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Type :</strong> {student.type === "child" ? "Enfant" : "Adulte"}
                        </p>
                        <p>
                          <strong>Prénom :</strong> {student.firstName}
                        </p>
                        <p>
                          <strong>Nom :</strong> {student.lastName}
                        </p>
                        <p>
                          <strong>Date de naissance :</strong>{" "}
                          {student.birthDate
                            ? format(new Date(student.birthDate), "dd/MM/yyyy")
                            : "Non définie"}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-blue-200">
                        <div className="flex items-center gap-2 text-blue-700">
                          <CheckCircle size={16} />
                          <span className="text-sm">Sera rattaché à votre dossier famille</span>
                        </div>
                      </div>
                    </Card>

                    {/* Appointment Info */}
                    {appointmentDay && (
                      <Card className="p-4 sm:p-6 bg-purple-50 border-purple-200 mb-6">
                        <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                          <CalendarIcon size={20} />
                          Rendez-vous
                        </h4>
                        <p className="text-sm">
                          {format(appointmentDay, "EEEE d MMMM yyyy", { locale: fr })}
                        </p>
                      </Card>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-11 sm:h-12 px-4 sm:px-6"
                    >
                      <Send size={16} className="mr-2" />
                      Confirmer l'ajout
                    </Button>
                  </form>
                </div>
              )}

              {/* Navigation Buttons (except step 4 which has form submission) */}
              {step !== 4 && (
                <div className="flex justify-between pt-6 sm:pt-8 mt-6 sm:mt-8 border-t">
                  {step > 1 ? (
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="h-11 sm:h-12 px-4 sm:px-6"
                    >
                      <ArrowLeft size={16} className="mr-2" />
                      Retour
                    </Button>
                  ) : (
                    <Link href="/">
                      <Button variant="outline" className="h-11 sm:h-12 px-4 sm:px-6">
                        <ArrowLeft size={16} className="mr-2" />
                        Accueil
                      </Button>
                    </Link>
                  )}

                  <Button
                    onClick={handleNext}
                    disabled={
                      (step === 2 &&
                        (!student.firstName || !student.lastName || !student.birthDate)) ||
                      (step === 3 && !appointmentDay)
                    }
                    className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 h-11 sm:h-12 px-4 sm:px-6"
                  >
                    Suivant
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 sm:mt-8 text-gray-600">
            <p className="text-sm">
              Une question ? Contactez-nous au <strong>01 23 45 67 89</strong> ou à{" "}
              <strong>contact@reconnaissance.fr</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
