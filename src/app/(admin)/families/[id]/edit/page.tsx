"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { updateFamily, type FamilyState } from "@/lib/actions/families";

import supabase from "@/lib/supabase";
import { Check, ChevronsUpDown, X, Edit, Trash2, UserPlus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useActionState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Course, Family, Student, Enrollment } from "@/types/families";
import {
  addStudent,
  AddStudentState,
  deleteStudent,
  DeleteStudentState,
  updateStudent,
  UpdateStudentState,
} from "@/lib/actions/students-actions";

export default function EditFamilyPage() {
  const id = String(useParams().id);
  const router = useRouter();

  const [family, setFamily] = React.useState<Family | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Charger la famille côté client avec les cours des étudiants
  const fetchFamily = React.useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("families")
      .select(
        `
        *,
        students(
          *,
          enrollments(
            course_id,
            status,
            courses(
              id,
              name,
              label,
              category
            )
          )
        )
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("❌ [CLIENT] Erreur lors du fetch:", error);
      setError("Famille introuvable");
      setLoading(false);
    } else {
      setFamily(data);
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchFamily();
  }, [fetchFamily]);

  // Server Action pour update famille
  const initialState: FamilyState = { message: null, errors: {}, success: false };
  const [state, formAction] = useActionState(async (prevState: FamilyState, formData: FormData) => {
    return await updateFamily(id, prevState, formData);
  }, initialState);

  // Actions pour les membres
  const [addState, addAction] = useActionState(addStudent, {} as AddStudentState);
  const [updateState, updateAction] = useActionState(updateStudent, {} as UpdateStudentState);
  const [deleteState, deleteAction] = useActionState(deleteStudent, {} as DeleteStudentState);

  // Rafraîchir les données après succès
  React.useEffect(() => {
    if (state.success || addState.success || updateState.success || deleteState.success) {
      fetchFamily();
    }
  }, [state.success, addState.success, updateState.success, deleteState.success, fetchFamily]);

  // State contrôlé pour le formulaire famille
  const [form, setForm] = React.useState({
    lastName: "",
    firstName: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
  });

  // Synchroniser form avec family
  React.useEffect(() => {
    if (family) {
      setForm({
        lastName: family.last_name || "",
        firstName: family.first_name || "",
        email: family.email || "",
        phone: family.phone || "",
        address: family.address || "",
        postalCode: family.postal_code || "",
        city: family.city || "",
      });
    }
  }, [family]);

  // Handler de soumission pour injecter les valeurs dans le FormData
  const handleSubmit = (formData: FormData) => {
    formData.set("lastName", form.lastName);
    formData.set("firstName", form.firstName);
    formData.set("email", form.email);
    formData.set("phone", form.phone);
    formData.set("address", form.address);
    formData.set("postalCode", form.postalCode);
    formData.set("city", form.city);
    formAction(formData);
  };

  // States pour les modales
  const [addMemberOpen, setAddMemberOpen] = React.useState(false);
  const [editMemberOpen, setEditMemberOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);

  // Liste des cours depuis la BDD
  const [availableCourses, setAvailableCourses] = React.useState<Course[]>([]);
  React.useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from("courses")
        .select("id, name, label, type, category, price");
      if (!error && data) {
        setAvailableCourses(data);
      }
    }
    fetchCourses();
  }, []);

  const [selectedCourses, setSelectedCourses] = React.useState<string[]>([]);
  const [courseSearch, setCourseSearch] = React.useState("");
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [memberType, setMemberType] = React.useState<MemberFormFieldsProps["memberType"]>("child");

  // State contrôlé pour le formulaire d'ajout/modification de membre
  const [memberForm, setMemberForm] = React.useState<{
    firstName: string;
    lastName: string;
    birthDate: string;
  }>({
    firstName: "",
    lastName: "",
    birthDate: "",
  });

  const [adding, setAdding] = React.useState(false);
  const [updating, setUpdating] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const params = useParams();
  const familyId = String(params.id);

  React.useEffect(() => {
    if (addState.success) {
      setAddMemberOpen(false);
      resetMemberForm();
      setAdding(false);
    }
  }, [addState.success]);

  React.useEffect(() => {
    if (updateState.success) {
      setEditMemberOpen(false);
      resetMemberForm();
      setUpdating(false);
    }
  }, [updateState.success]);

  React.useEffect(() => {
    if (deleteState.success) {
      setDeleteConfirmOpen(false);
      setSelectedStudent(null);
      setDeleting(false);
    }
  }, [deleteState.success]);

  const resetMemberForm = () => {
    setMemberForm({ firstName: "", lastName: "", birthDate: "" });
    setSelectedCourses([]);
    setMemberType("child");
    setCourseSearch("");
    setPopoverOpen(false);
  };

  // Handlers pour les actions des membres
  const handleAddMember = () => {
    resetMemberForm();
    setAddMemberOpen(true);
  };

  const handleEditMember = (student: Student) => {
    setSelectedStudent(student);
    setMemberForm({
      firstName: student.first_name,
      lastName: student.last_name,
      birthDate: student.birth_date || "",
    });
    setMemberType(student.registration_type || "child");

    // Charger les cours actuels de l'étudiant
    const currentCourses = student.enrollments?.map((e: any) => e.course_id) || [];
    setSelectedCourses(currentCourses);

    setEditMemberOpen(true);
  };

  const handleDeleteMember = (student: Student) => {
    setSelectedStudent(student);
    setDeleteConfirmOpen(true);
  };

  // Fermer le dropdown des cours quand on clique à l'extérieur
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (popoverOpen && !target.closest("[data-course-selector]")) {
        setPopoverOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popoverOpen]);

  if (loading) return <div className="p-8 text-center">Chargement…</div>;
  if (error || !family)
    return <div className="p-8 text-center text-red-600">Famille introuvable</div>;

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-8 space-y-8">
      {/* Formulaire famille */}

      <Card>
        <CardContent className="p-6 space-y-4">
          <h1 className="text-2xl font-bold mb-4">Éditer la famille</h1>
          {state.message && (
            <div className={`mb-2 text-sm ${state.success ? "text-green-600" : "text-red-600"}`}>
              {state.message}
            </div>
          )}
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" action={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <Input
                name="lastName"
                value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
              />
              {state.errors?.lastName && (
                <p className="text-xs text-red-600">{state.errors.lastName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prénom</label>
              <Input
                name="firstName"
                value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
              />
              {state.errors?.firstName && (
                <p className="text-xs text-red-600">{state.errors.firstName}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                name="email"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
              {state.errors?.email && <p className="text-xs text-red-600">{state.errors.email}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Téléphone</label>
              <Input
                name="phone"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
              {state.errors?.phone && <p className="text-xs text-red-600">{state.errors.phone}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Adresse</label>
              <Input
                name="address"
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              />
              {state.errors?.address && (
                <p className="text-xs text-red-600">{state.errors.address}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Code postal</label>
              <Input
                name="postalCode"
                value={form.postalCode}
                onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))}
              />
              {state.errors?.postalCode && (
                <p className="text-xs text-red-600">{state.errors.postalCode}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ville</label>
              <Input
                name="city"
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              />
              {state.errors?.city && <p className="text-xs text-red-600">{state.errors.city}</p>}
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Liste des membres */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Membres</h2>
            <Button variant="outline" onClick={handleAddMember}>
              <UserPlus className="w-4 h-4 mr-2" />
              Ajouter un membre
            </Button>
          </div>

          {/* Messages pour les actions sur les membres */}
          {(addState.message || updateState.message || deleteState.message) && (
            <div
              className={`mb-4 text-sm ${
                addState.success || updateState.success || deleteState.success
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {addState.message || updateState.message || deleteState.message}
            </div>
          )}

          {/* Liste des étudiants existants */}
          {family.students && family.students.length > 0 ? (
            <div className="space-y-2">
              {family.students.map((student: Student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {student.first_name} {student.last_name}
                      </span>
                      <Badge
                        className="text-xs"
                        variant={student.registration_type === "child" ? "default" : "secondary"}
                      >
                        {student.registration_type === "child" ? "Enfant" : "Adulte"}
                      </Badge>
                    </div>
                    {student.birth_date && (
                      <p className="text-sm text-gray-500">
                        Né(e) le {new Date(student.birth_date).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                    {student.enrollments && student.enrollments.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {student.enrollments.map((enrollment: Enrollment) => {
                          if (enrollment.status === "active") {
                            return (
                              <Badge
                                key={enrollment.course_id}
                                variant="outline"
                                className="text-xs"
                              >
                                {enrollment.courses?.label || enrollment.courses?.name}
                              </Badge>
                            );
                          }
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditMember(student)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMember(student)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucun membre dans cette famille</p>
          )}

          {/* Modale d'ajout de membre */}
          <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
            <DialogContent className="max-w-md w-full" aria-describedby="add-member-desc">
              <DialogHeader>
                <DialogTitle>Ajouter un membre</DialogTitle>
              </DialogHeader>
              <div id="add-member-desc" className="sr-only">
                Remplissez les informations du membre et sélectionnez un ou plusieurs cours à
                attribuer.
              </div>
              <form
                className="space-y-4"
                onSubmit={e => {
                  e.preventDefault();
                  setAdding(true);
                  const formData = new FormData();
                  formData.set("familyId", familyId);
                  formData.set("firstName", memberForm.firstName);
                  formData.set("lastName", memberForm.lastName);
                  formData.set("birthDate", memberForm.birthDate);
                  formData.set("studentType", memberType);
                  selectedCourses.forEach(courseId => {
                    formData.append("selectedCourses", courseId);
                  });
                  React.startTransition(() => {
                    addAction(formData);
                  });
                }}
              >
                <MemberFormFields
                  memberForm={memberForm}
                  setMemberForm={setMemberForm}
                  memberType={memberType}
                  setMemberType={setMemberType}
                  selectedCourses={selectedCourses}
                  setSelectedCourses={setSelectedCourses}
                  availableCourses={availableCourses}
                  courseSearch={courseSearch}
                  setCourseSearch={setCourseSearch}
                  popoverOpen={popoverOpen}
                  setPopoverOpen={setPopoverOpen}
                />
                <div className="flex justify-end mt-4">
                  <Button type="submit" disabled={adding}>
                    {adding ? "Ajout en cours..." : "Ajouter"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Modale de modification de membre */}
          <Dialog open={editMemberOpen} onOpenChange={setEditMemberOpen}>
            <DialogContent className="max-w-md w-full">
              <DialogHeader>
                <DialogTitle>Modifier le membre</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={e => {
                  e.preventDefault();
                  setUpdating(true);
                  const formData = new FormData();
                  formData.set("studentId", selectedStudent?.id || "");
                  formData.set("firstName", memberForm.firstName);
                  formData.set("lastName", memberForm.lastName);
                  formData.set("birthDate", memberForm.birthDate);
                  formData.set("registrationType", memberType);
                  selectedCourses.forEach(courseId => {
                    formData.append("selectedCourses", courseId);
                  });
                  React.startTransition(() => {
                    updateAction(formData);
                  });
                }}
              >
                <MemberFormFields
                  memberForm={memberForm}
                  setMemberForm={setMemberForm}
                  memberType={memberType}
                  setMemberType={setMemberType}
                  selectedCourses={selectedCourses}
                  setSelectedCourses={setSelectedCourses}
                  availableCourses={availableCourses}
                  courseSearch={courseSearch}
                  setCourseSearch={setCourseSearch}
                  popoverOpen={popoverOpen}
                  setPopoverOpen={setPopoverOpen}
                />
                <div className="flex justify-end mt-4">
                  <Button type="submit" disabled={updating}>
                    {updating ? "Modification en cours..." : "Modifier"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialogue de confirmation de suppression */}
          <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Supprimer le membre</DialogTitle>
                <DialogDescription>
                  Êtes-vous sûr de vouloir supprimer {selectedStudent?.first_name}{" "}
                  {selectedStudent?.last_name} ? Cette action est irréversible et supprimera
                  également toutes ses inscriptions aux cours.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button>Annuler</Button>
                <Button
                  onClick={() => {
                    setDeleting(true);
                    const formData = new FormData();
                    formData.set("studentId", selectedStudent?.id || "");
                    React.startTransition(() => {
                      deleteAction(formData);
                    });
                  }}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleting}
                >
                  {deleting ? "Suppression..." : "Supprimer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

interface MemberForm {
  firstName: string;
  lastName: string;
  birthDate: string;
}

export interface MemberFormFieldsProps {
  memberForm: MemberForm;
  setMemberForm: React.Dispatch<React.SetStateAction<MemberForm>>;
  memberType: "child" | "adult";
  setMemberType: React.Dispatch<React.SetStateAction<"child" | "adult">>;
  selectedCourses: string[];
  setSelectedCourses: React.Dispatch<React.SetStateAction<string[]>>;
  availableCourses: Course[];
  courseSearch: string;
  setCourseSearch: React.Dispatch<React.SetStateAction<string>>;
  popoverOpen: boolean;
  setPopoverOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Composant réutilisable pour les champs du formulaire membre
function MemberFormFields({
  memberForm,
  setMemberForm,
  memberType,
  setMemberType,
  selectedCourses,
  setSelectedCourses,
  availableCourses,
  courseSearch,
  setCourseSearch,
  popoverOpen,
  setPopoverOpen,
}: MemberFormFieldsProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium mb-1">Prénom</label>
      <Input
        name="firstName"
        value={memberForm.firstName}
        onChange={e => setMemberForm(f => ({ ...f, firstName: e.target.value }))}
      />
      <label className="block text-sm font-medium mb-1">Nom</label>
      <Input
        name="lastName"
        value={memberForm.lastName}
        onChange={e => setMemberForm(f => ({ ...f, lastName: e.target.value }))}
      />
      <label className="block text-sm font-medium mb-1">Date de naissance</label>
      <Input
        name="birthDate"
        type="date"
        value={memberForm.birthDate}
        onChange={e => setMemberForm(f => ({ ...f, birthDate: e.target.value }))}
      />
      <label className="block text-sm font-medium mb-1">Type</label>
      <Select onValueChange={setMemberType} value={memberType}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Type de membre" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="child">Enfant</SelectItem>
          <SelectItem value="adult">Adulte</SelectItem>
        </SelectContent>
      </Select>

      <label className="block text-sm font-medium mb-1">Cours (optionnel)</label>
      <div className="space-y-2" data-course-selector>
        <Button
          variant="outline"
          className="w-full justify-between"
          type="button"
          onClick={() => setPopoverOpen(!popoverOpen)}
        >
          {selectedCourses.length === 0
            ? "Sélectionner des cours"
            : `${selectedCourses.length} cours sélectionné(s)`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {popoverOpen && (
          <div className="border rounded-md bg-white shadow-lg max-h-60 overflow-y-auto z-50 relative">
            <div className="p-2 border-b">
              <Input
                placeholder="Chercher un cours..."
                value={courseSearch}
                onChange={e => setCourseSearch(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="p-1">
              {availableCourses.length === 0 ? (
                <div className="p-2 text-sm text-gray-500">Aucun cours disponible</div>
              ) : (
                availableCourses
                  .filter((course: any) =>
                    (course.label || course.name || "")
                      ?.toLowerCase()
                      .includes(courseSearch.toLowerCase())
                  )
                  .map((course: any) => (
                    <div
                      key={course.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded"
                      onClick={() => {
                        setSelectedCourses((prev: string[]) =>
                          prev.includes(course.id)
                            ? prev.filter((id: string) => id !== course.id)
                            : [...prev, course.id]
                        );
                      }}
                    >
                      <Check
                        className={`h-4 w-4 ${
                          selectedCourses.includes(course.id) ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      <span className="flex-1">{course.label || course.name}</span>
                      {course.category && (
                        <Badge variant="outline" className="text-xs">
                          {course.category}
                        </Badge>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Affichage des cours sélectionnés */}
      {selectedCourses.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedCourses.map((courseId: string) => {
            const course = availableCourses.find((c: any) => c.id === courseId);
            return (
              <Badge key={courseId} variant="secondary" className="text-xs">
                {course?.label}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() =>
                    setSelectedCourses((prev: string[]) =>
                      prev.filter((id: string) => id !== courseId)
                    )
                  }
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
