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
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { preRegister } from "@/lib/actions/pre-registration";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state first
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Validate if user can access a specific step
  const canAccessStep = (targetStep: number, currentFamily?: FamilyInfo, currentStudents?: StudentInfo[], isSuccessful?: boolean) => {
    const familyData = currentFamily || family;
    const studentsData = currentStudents || students;
    const successState = isSuccessful !== undefined ? isSuccessful : registrationSuccess;

    if (targetStep === 1) return true;
    if (targetStep === 4 && successState) return true;

    // For steps 2 and 3, check if previous steps have required data
    if (targetStep === 2) {
      return (
        familyData.parentFirstName.trim() !== "" &&
        familyData.familyName.trim() !== "" &&
        familyData.contactEmail.trim() !== "" &&
        familyData.contactPhone.trim() !== ""
      );
    }

    if (targetStep === 3) {
      const hasValidFamily = canAccessStep(2, familyData, studentsData, successState);
      const hasValidStudents = studentsData.some(
        student =>
          student.firstName.trim() !== "" &&
          student.lastName.trim() !== "" &&
          student.birthDate.trim() !== ""
      );
      return hasValidFamily && hasValidStudents;
    }

    return false;
  };

  // Initialize step from URL or default to 1
  const getInitialStep = () => {
    const stepParam = searchParams.get('step');
    if (stepParam) {
      const parsedStep = parseInt(stepParam);
      if (parsedStep >= 1 && parsedStep <= 4) {
        // Only validate for steps > 1 since initial state is empty
        if (parsedStep === 1) return parsedStep;
        // For other steps, return 1 initially and let useEffect handle validation
        return 1;
      }
    }
    return 1;
  };

  const [step, setStep] = useState(getInitialStep);

  // Sync step with URL changes and validate access
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam) {
      const requestedStep = parseInt(stepParam);
      if (requestedStep >= 1 && requestedStep <= 4) {
        if (canAccessStep(requestedStep)) {
          if (requestedStep !== step) {
            setStep(requestedStep);
          }
        } else {
          // Redirect to step 1 if user can't access requested step
          const params = new URLSearchParams(searchParams);
          params.set('step', '1');
          router.replace(`?${params.toString()}`, { scroll: false });
          if (step !== 1) {
            setStep(1);
          }
        }
      }
    }
  }, [searchParams, family, students, registrationSuccess]);

  // Function to update both step state and URL with validation
  const updateStep = (newStep: number) => {
    if (canAccessStep(newStep)) {
      setStep(newStep);
      const params = new URLSearchParams(searchParams);
      params.set('step', newStep.toString());
      router.replace(`?${params.toString()}`, { scroll: false });
    } else {
      // Show error if trying to access unavailable step
      toast({
        variant: "destructive",
        title: "Étape non accessible",
        description: "Veuillez compléter les étapes précédentes.",
      });
    }
  };

  const handleNext = () => updateStep(step + 1);
  const handleBack = () => updateStep(step - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("family", JSON.stringify(family));
    formData.append("students", JSON.stringify(students));
    formData.append("appointmentDay", appointmentDay?.toISOString().split("T")[0] || "");

    try {
      const result = await preRegister(formData);

      if (result.success) {
        setRegistrationSuccess(true);
        updateStep(4); // Aller directement à la page de confirmation
      } else {
        toast({
          variant: "destructive",
          title: "Erreur d'envoi",
          description: result.error || "Erreur lors de l'envoi.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'envoi",
        description: "Une erreur inattendue s'est produite.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour recommencer une nouvelle inscription
  const handleNewRegistration = () => {
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
    setRegistrationSuccess(false);
    updateStep(1);
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
      <div className="w-full">
        <div className="w-full md:max-w-4xl md:mx-auto">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Préinscription en ligne
            </h1>
            <p className="text-gray-600 text-base md:text-lg">
              Commencez votre parcours avec nous en quelques étapes simples
            </p>
          </div>

          {/* Progress Steps - Responsive */}
          <div className="mb-6 md:mb-8">
            {/* Version mobile - Étapes simplifiées */}
            <div className="block md:hidden mb-4">
              <div className="flex items-center justify-center space-x-2">
                {steps.map((stepInfo, index) => (
                  <div key={stepInfo.id} className="flex items-center">
                    <div
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 text-xs",
                        step >= stepInfo.id
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 border-blue-600 text-white"
                          : "border-gray-300 text-gray-400"
                      )}
                    >
                      {stepInfo.id}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          "w-6 h-1 mx-1 transition-all duration-300",
                          step > stepInfo.id
                            ? "bg-gradient-to-r from-blue-600 to-purple-600"
                            : "bg-gray-200"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Version desktop - Étapes complètes */}
            <div className="hidden md:block">
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
            </div>

            <div className="text-center">
              <Badge variant="outline" className="text-sm">
                Étape {step} sur {steps.length}: {steps[step - 1]?.title}
              </Badge>
            </div>
          </div>

          {/* Main Card */}

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="flex items-center justify-center gap-2 text-xl md:text-2xl">
                {React.createElement(steps[step - 1]?.icon, { size: 20 })}
                {steps[step - 1]?.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Step 1: Family Information */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                    <Card key={index} className="p-4 md:p-6 border-2 border-dashed border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
                          <User size={18} />
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
                      className="border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 h-12 px-4 md:px-6 w-full md:w-auto"
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
                      <span className="text-sm md:text-base">Samedi 28 juin 2025</span>
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
                      <span className="text-sm md:text-base">Dimanche 29 juin 2025</span>
                    </label>
                  </div>
                  {appointmentDay && (
                    <div className="text-center">
                      <Badge className="bg-green-100 text-green-800 text-sm md:text-base px-4 py-2">
                        Jour sélectionné :{" "}
                        {format(appointmentDay, "EEEE d MMMM yyyy", { locale: fr })}
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Success Confirmation */}
              {step === 4 && registrationSuccess && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center mb-8">
                    <CheckCircle size={60} className="mx-auto text-green-600 mb-6" />
                    <h3 className="text-xl md:text-2xl font-bold text-green-800 mb-4">
                      Préinscription envoyée avec succès !
                    </h3>
                    <p className="text-gray-600 text-base md:text-lg mb-6">
                      Votre demande de préinscription a bien été enregistrée. Nous vous contacterons prochainement.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Family Info */}
                    <Card className="p-4 md:p-6 bg-blue-50 border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                        <Users size={18} />
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
                    <Card className="p-4 md:p-6 bg-purple-50 border-purple-200">
                      <h4 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                        <User size={18} />
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
                  <Card className="p-4 md:p-6 bg-green-50 border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <CalendarIcon size={18} />
                      Rendez-vous
                    </h4>
                    <p className="text-sm">
                      {appointmentDay
                        ? format(appointmentDay, "EEEE d MMMM yyyy", { locale: fr })
                        : "Aucun jour sélectionné"}
                    </p>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
                    <Button
                      onClick={handleNewRegistration}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-6 w-full sm:w-auto"
                    >
                      <Plus size={16} className="mr-2" />
                      Nouvelle préinscription
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/'}
                      className="h-12 px-6 w-full sm:w-auto border-2 hover:bg-gray-50"
                    >
                      Retour à l'accueil
                    </Button>
                  </div>
                </div>
              )}

              {/* Navigation Buttons - Responsive (Hidden on success page) */}
              {step !== 4 && (
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8 mt-8 border-t">
                  {step > 1 ? (
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="h-12 px-4 md:px-6 w-full sm:w-auto"
                    >
                      <ArrowLeft size={16} className="mr-2" />
                      Retour
                    </Button>
                  ) : (
                    <div />
                  )}
                  {step < 3 ? (
                    <Button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-4 md:px-6 w-full sm:w-auto"
                    >
                      Suivant
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  ) : step === 3 ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !appointmentDay}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-12 px-4 md:px-6 w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send size={16} className="mr-2" />
                          Envoyer la demande
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 md:mt-8 text-gray-600">
            <p className="text-xs md:text-sm">
              Une question ? Contactez-nous au <strong>01 23 45 67 89</strong> ou à{" "}
              <strong>contact@ecole.fr</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
