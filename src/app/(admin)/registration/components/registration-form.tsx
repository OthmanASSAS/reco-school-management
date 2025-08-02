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
    <div className="space-y-4 md:space-y-6">
      <form ref={formRef} action={dispatch} className="space-y-4 md:space-y-6">
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
            <CardTitle className="text-lg md:text-xl">Informations sur l'étudiant</CardTitle>
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

            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="alreadyRegistered" name="alreadyRegistered" />
                <Label htmlFor="alreadyRegistered" className="text-sm">
                  Déjà inscrit l'année précédente
                </Label>
              </div>
              {state.errors?.student?.alreadyRegistered && (
                <p className="text-sm text-red-500">{state.errors.student.alreadyRegistered[0]}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Informations supplémentaires..."
                className="min-h-[80px]"
              />
              {state.errors?.student?.notes && (
                <p className="text-sm text-red-500">{state.errors.student.notes[0]}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Informations d'inscription</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="familyId">Famille *</Label>
              <Select value={selectedFamily} onValueChange={setSelectedFamily} required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une famille" />
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
                  <SelectValue placeholder="Sélectionner l'année" />
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
              <Label htmlFor="courseInstanceId">Cours *</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse} required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un cours" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCourses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.course.label} - {course.price}€
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

            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="isWaitingList" name="isWaitingList" />
                <Label htmlFor="isWaitingList" className="text-sm">
                  Mettre sur liste d'attente
                </Label>
              </div>
              {state.errors?.registration?.isWaitingList && (
                <p className="text-sm text-red-500">{state.errors.registration.isWaitingList[0]}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="appointmentDay">Jour de rendez-vous</Label>
              <Input type="date" id="appointmentDay" name="appointmentDay" />
              {state.errors?.registration?.appointmentDay && (
                <p className="text-sm text-red-500">
                  {state.errors.registration.appointmentDay[0]}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-6 w-full md:w-auto"
          >
            <Send size={16} className="mr-2" />
            Créer l'inscription
          </Button>
        </div>
      </form>
    </div>
  );
}
