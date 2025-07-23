"use client";

import { useActionState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Send } from "lucide-react";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { createRegistration, RegistrationState } from "@/lib/actions/registrations";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "../../../../components/ui/textarea";

interface DataProps {
  families: { id: string; name: string }[];
  schoolYears: { id: string; year: string }[];
  courseInstances: {
    id: string;
    course: {
      name: string;
      type: string;
      label: string;
    };
    teacher?: {
      name: string;
    };
    room?: {
      name: string;
    };
    timeSlot?: {
      day: string;
      startTime: string;
      endTime: string;
    };
    capacity: number;
    price: number;
  }[];
}

export default function RegistrationForm({ families, schoolYears, courseInstances }: DataProps) {
  const initialState: RegistrationState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(createRegistration, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedType, setSelectedType] = useState<"Enfant" | "Adulte" | "">("");
  const [selectedFamily, setSelectedFamily] = useState<string>("");
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  useEffect(() => {
    if (state.message?.includes("succès")) {
      formRef.current?.reset();
      setSelectedType("");
      setSelectedFamily("");
      setSelectedSchoolYear("");
      setSelectedCourse("");
    }
  }, [state]);

  const typeMap = { Enfant: "enfants", Adulte: "adultes" };
  const filteredCourses = selectedType
    ? courseInstances.filter(instance => {
        return instance.course.type === typeMap[selectedType as "Enfant" | "Adulte"];
      })
    : [];

  return (
    <div className="space-y-6">
      <form ref={formRef} action={dispatch} className="space-y-6">
        {/* Champs cachés pour les valeurs des Select */}
        <input type="hidden" name="registrationType" value={selectedType} />
        <input type="hidden" name="familyId" value={selectedFamily} />
        <input type="hidden" name="schoolYearId" value={selectedSchoolYear} />
        <input type="hidden" name="courseInstanceId" value={selectedCourse} />

        {state.message && (
          <Alert
            className={
              state.errors &&
              Object.keys(state.errors).some(
                key =>
                  state.errors![key as keyof typeof state.errors] &&
                  Object.values(state.errors![key as keyof typeof state.errors]!).some(
                    v => v && v.length > 0
                  )
              )
                ? "border-red-500 text-red-500"
                : "border-green-500 text-green-500"
            }
          >
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Informations sur l'étudiant</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="registrationType">Type d'inscription *</Label>
              <Select
                value={selectedType}
                onValueChange={value => {
                  setSelectedType(value as "Enfant" | "Adulte" | "");
                  setSelectedCourse(""); // Reset course selection
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Enfant">Enfant</SelectItem>
                  <SelectItem value="Adulte">Adulte</SelectItem>
                </SelectContent>
              </Select>
              {state.errors?.student?.registrationType && (
                <p className="text-sm text-red-500">{state.errors.student.registrationType[0]}</p>
              )}
            </div>

            <div>
              <Label htmlFor="firstName">Prénom *</Label>
              <Input id="firstName" name="firstName" required />
              {state.errors?.student?.firstName && (
                <p className="text-sm text-red-500">{state.errors.student.firstName[0]}</p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName">Nom *</Label>
              <Input id="lastName" name="lastName" required />
              {state.errors?.student?.lastName && (
                <p className="text-sm text-red-500">{state.errors.student.lastName[0]}</p>
              )}
            </div>

            <div>
              <Label htmlFor="birthDate">Date de naissance *</Label>
              <Input type="date" id="birthDate" name="birthDate" required />
              {state.errors?.student?.birthDate && (
                <p className="text-sm text-red-500">{state.errors.student.birthDate[0]}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox id="alreadyRegistered" name="alreadyRegistered" />
              <Label htmlFor="alreadyRegistered">Déjà inscrit l'année dernière ?</Label>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Informations complémentaires..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Détails de l'inscription</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="familyId">Famille *</Label>
              <Select value={selectedFamily} onValueChange={setSelectedFamily} required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une famille..." />
                </SelectTrigger>
                <SelectContent>
                  {families.map(family => (
                    <SelectItem key={family.id} value={family.id}>
                      {family.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.registration?.familyId && (
                <p className="text-sm text-red-500">{state.errors.registration.familyId[0]}</p>
              )}
            </div>

            <div>
              <Label htmlFor="schoolYearId">Année scolaire *</Label>
              <Select value={selectedSchoolYear} onValueChange={setSelectedSchoolYear} required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une année..." />
                </SelectTrigger>
                <SelectContent>
                  {schoolYears.map(year => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.registration?.schoolYearId && (
                <p className="text-sm text-red-500">{state.errors.registration.schoolYearId[0]}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="courseInstanceId">Cours disponibles *</Label>
              <Select
                value={selectedCourse}
                onValueChange={setSelectedCourse}
                required
                disabled={!selectedType}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !selectedType
                        ? "Sélectionnez d'abord le type d'inscription..."
                        : filteredCourses.length === 0
                          ? "Aucun cours disponible pour ce type"
                          : "Sélectionner un cours..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredCourses.map(instance => (
                    <SelectItem key={instance.id} value={instance.id}>
                      <div className="flex flex-col text-left w-full">
                        <span className="font-medium text-base">
                          {instance.course.label || instance.course.name}
                        </span>
                        <span className="text-sm text-gray-600 mt-1">
                          {instance.timeSlot && (
                            <span className="inline-block mr-3">
                              📅 {instance.timeSlot.day} {instance.timeSlot.startTime.slice(0, 5)}-
                              {instance.timeSlot.endTime.slice(0, 5)}
                            </span>
                          )}
                          {instance.teacher && (
                            <span className="inline-block mr-3">👨‍🏫 {instance.teacher.name}</span>
                          )}
                          {instance.room && (
                            <span className="inline-block mr-3">🏠 {instance.room.name}</span>
                          )}
                          <span className="inline-block mr-3">💰 {instance.price}€</span>
                          <span className="inline-block">👥 {instance.capacity} places</span>
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.registration?.courseInstanceId && (
                <p className="text-sm text-red-500">
                  {state.errors.registration.courseInstanceId[0]}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="appointmentDay">Date de rendez-vous</Label>
              <Input type="date" id="appointmentDay" name="appointmentDay" />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox id="isWaitingList" name="isWaitingList" />
              <Label htmlFor="isWaitingList">Inscrire sur la liste d'attente</Label>
            </div>
          </CardContent>
        </Card>

        <div className="pt-6">
          <Button type="submit" className="w-full">
            <Send size={16} className="mr-2" />
            Valider l'inscription
          </Button>
        </div>
      </form>
    </div>
  );
}
