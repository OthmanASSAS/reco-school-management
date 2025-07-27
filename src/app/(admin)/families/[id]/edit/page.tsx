"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { updateFamily, type FamilyState } from "@/lib/actions/families";

import supabase from "@/lib/supabase";
import {
  Check,
  ChevronsUpDown,
  X,
  Edit,
  Trash2,
  UserPlus,
  Users,
  Mail,
  Home,
  Phone,
  ArrowLeft,
  Save,
} from "lucide-react";
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

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );

  if (error || !family)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-3 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-red-600 text-lg font-medium">Famille introuvable</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header avec bouton retour */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:bg-white/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Éditer la famille</h1>
              <p className="text-sm text-gray-600">
                {family.first_name} {family.last_name}
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire famille */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              Informations de la famille
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {state.message && (
              <Alert
                className={
                  state.success
                    ? "border-green-500 bg-green-50 shadow-lg"
                    : "border-red-500 bg-red-50 shadow-lg"
                }
              >
                <AlertDescription className={state.success ? "text-green-800" : "text-red-800"}>
                  {state.message}
                </AlertDescription>
              </Alert>
            )}

            <form className="space-y-6" action={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Nom *
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                    required
                  />
                  {state.errors?.lastName && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {state.errors.lastName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    Prénom *
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                    required
                  />
                  {state.errors?.firstName && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {state.errors.firstName}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="h-11 border-gray-200 focus:border-green-300 focus:ring-green-200"
                  required
                />
                {state.errors?.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {state.errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Téléphone
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="h-11 pl-10 border-gray-200 focus:border-green-300 focus:ring-green-200"
                  />
                </div>
                {state.errors?.phone && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {state.errors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Adresse
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  className="h-11 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                />
                {state.errors?.address && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {state.errors.address}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
                    Code postal
                  </Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))}
                    className="h-11 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                  />
                  {state.errors?.postalCode && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {state.errors.postalCode}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                    Ville
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    className="h-11 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                  />
                  {state.errors?.city && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {state.errors.city}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Liste des membres */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserPlus className="h-5 w-5 text-green-600" />
                </div>
                Membres de la famille
              </CardTitle>
              <Button
                variant="outline"
                onClick={handleAddMember}
                className="bg-white/80 hover:bg-white border-green-200 hover:border-green-300"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Ajouter un membre
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Messages pour les actions sur les membres */}
            {(addState.message || updateState.message || deleteState.message) && (
              <Alert
                className={`mb-6 ${
                  addState.success || updateState.success || deleteState.success
                    ? "border-green-500 bg-green-50 shadow-lg"
                    : "border-red-500 bg-red-50 shadow-lg"
                }`}
              >
                <AlertDescription
                  className={
                    addState.success || updateState.success || deleteState.success
                      ? "text-green-800"
                      : "text-red-800"
                  }
                >
                  {addState.message || updateState.message || deleteState.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Liste des étudiants existants */}
            {family.students && family.students.length > 0 ? (
              <div className="space-y-4">
                {family.students.map((student: Student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white/50 hover:bg-white/80 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {student.first_name?.[0]}
                          {student.last_name?.[0]}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">
                            {student.first_name} {student.last_name}
                          </span>
                          <Badge
                            className="ml-2 text-xs"
                            variant={
                              student.registration_type === "child" ? "default" : "secondary"
                            }
                          >
                            {student.registration_type === "child" ? "Enfant" : "Adulte"}
                          </Badge>
                        </div>
                      </div>
                      {student.birth_date && (
                        <p className="text-sm text-gray-600 ml-12">
                          Né(e) le {new Date(student.birth_date).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                      {student.enrollments && student.enrollments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 ml-12">
                          {student.enrollments.map((enrollment: Enrollment, index: number) => {
                            if (enrollment.status === "active") {
                              return (
                                <Badge
                                  key={`${enrollment.id || "no-id"}-${enrollment.course_id || "no-course"}-${index}`}
                                  variant="outline"
                                  className="text-xs bg-blue-50 border-blue-200 text-blue-700"
                                >
                                  {enrollment.courses?.label || enrollment.courses?.name}
                                </Badge>
                              );
                            }
                            return null;
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditMember(student)}
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMember(student)}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">Aucun membre dans cette famille</p>
                <p className="text-gray-400 text-sm mt-1">
                  Ajoutez le premier membre pour commencer
                </p>
              </div>
            )}

            {/* Modale d'ajout de membre */}
            <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
              <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50">
                <DialogHeader className="text-center pb-4 sticky top-0 bg-gradient-to-br from-slate-50 to-blue-50 z-10">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg">
                      <UserPlus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Ajouter un membre
                      </DialogTitle>
                    </div>
                  </div>
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
                  <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 sticky bottom-0 bg-gradient-to-br from-slate-50 to-blue-50">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddMemberOpen(false)}
                      className="px-6 py-2 border-gray-300 hover:bg-gray-50"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={adding}
                      className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <UserPlus size={16} className="mr-2" />
                      {adding ? "Ajout en cours..." : "Ajouter le membre"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Modale de modification de membre */}
            <Dialog open={editMemberOpen} onOpenChange={setEditMemberOpen}>
              <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50">
                <DialogHeader className="text-center pb-4 sticky top-0 bg-gradient-to-br from-slate-50 to-blue-50 z-10">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                      <Edit className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Modifier le membre
                      </DialogTitle>
                    </div>
                  </div>
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
                  <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 sticky bottom-0 bg-gradient-to-br from-slate-50 to-blue-50">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditMemberOpen(false)}
                      className="px-6 py-2 border-gray-300 hover:bg-gray-50"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={updating}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Edit size={16} className="mr-2" />
                      {updating ? "Modification en cours..." : "Modifier le membre"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Dialogue de confirmation de suppression */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
              <DialogContent className="bg-white/95 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <Trash2 className="h-5 w-5" />
                    Supprimer le membre
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Êtes-vous sûr de vouloir supprimer{" "}
                    <strong>
                      {selectedStudent?.first_name} {selectedStudent?.last_name}
                    </strong>{" "}
                    ? Cette action est irréversible et supprimera également toutes ses inscriptions
                    aux cours.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirmOpen(false)}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => {
                      setDeleting(true);
                      const formData = new FormData();
                      formData.set("studentId", selectedStudent?.id || "");
                      React.startTransition(() => {
                        deleteAction(formData);
                      });
                    }}
                    className="bg-red-600 hover:bg-red-700 shadow-lg"
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
    <div className="space-y-4">
      {/* Informations personnelles */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-4">
          <CardTitle className="flex items-center gap-3 text-base font-semibold text-gray-900">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                Prénom *
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={memberForm.firstName}
                onChange={e => setMemberForm(f => ({ ...f, firstName: e.target.value }))}
                className="h-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                placeholder="Prénom"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                Nom *
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={memberForm.lastName}
                onChange={e => setMemberForm(f => ({ ...f, lastName: e.target.value }))}
                className="h-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                placeholder="Nom de famille"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700">
                Date de naissance *
              </Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={memberForm.birthDate}
                onChange={e => setMemberForm(f => ({ ...f, birthDate: e.target.value }))}
                className="h-10 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="studentType" className="text-sm font-medium text-gray-700">
                Type de membre *
              </Label>
              <Select
                onValueChange={value => setMemberType(value as "child" | "adult")}
                value={memberType}
                required
              >
                <SelectTrigger className="w-full h-10 border-gray-200 focus:border-purple-300 focus:ring-purple-200">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="child">Enfant</SelectItem>
                  <SelectItem value="adult">Adulte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sélection des cours */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 py-4">
          <CardTitle className="flex items-center gap-3 text-base font-semibold text-gray-900">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            Inscription aux cours (optionnel)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="courses" className="text-sm font-medium text-gray-700">
              Cours disponibles
            </Label>
            <div className="space-y-1.5" data-course-selector>
              <Button
                variant="outline"
                className="w-full justify-between h-10 border-gray-200 focus:border-green-300 focus:ring-green-200 bg-white"
                type="button"
                onClick={() => setPopoverOpen(!popoverOpen)}
              >
                {selectedCourses.length === 0
                  ? "Sélectionner des cours"
                  : `${selectedCourses.length} cours sélectionné(s)`}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>

              {popoverOpen && (
                <div className="border rounded-lg bg-white shadow-xl max-h-48 overflow-y-auto z-50 relative">
                  <div className="p-2 border-b bg-gray-50">
                    <Input
                      placeholder="Chercher un cours..."
                      value={courseSearch}
                      onChange={e => setCourseSearch(e.target.value)}
                      className="h-9 border-gray-200 focus:border-green-300 focus:ring-green-200"
                    />
                  </div>
                  <div className="p-1">
                    {availableCourses.length === 0 ? (
                      <div className="p-3 text-center text-gray-500">
                        <Users className="h-6 w-6 mx-auto mb-1 text-gray-300" />
                        <p className="text-xs">Aucun cours disponible</p>
                      </div>
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
                            className="flex items-center gap-2 p-2 hover:bg-green-50 cursor-pointer rounded transition-colors"
                            onClick={() => {
                              setSelectedCourses((prev: string[]) =>
                                prev.includes(course.id)
                                  ? prev.filter((id: string) => id !== course.id)
                                  : [...prev, course.id]
                              );
                            }}
                          >
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                selectedCourses.includes(course.id)
                                  ? "bg-green-600 border-green-600"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedCourses.includes(course.id) && (
                                <Check className="h-2.5 w-2.5 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <span className="font-medium text-gray-900 text-sm">
                                {course.label || course.name}
                              </span>
                              {course.category && (
                                <Badge
                                  variant="outline"
                                  className="ml-1 text-xs bg-blue-50 border-blue-200 text-blue-700"
                                >
                                  {course.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Affichage des cours sélectionnés */}
          {selectedCourses.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Cours sélectionnés ({selectedCourses.length})
              </Label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-green-50 rounded-lg border border-green-200">
                {selectedCourses.map((courseId: string) => {
                  const course = availableCourses.find((c: any) => c.id === courseId);
                  return (
                    <Badge
                      key={courseId}
                      variant="secondary"
                      className="text-xs bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                    >
                      {course?.label || course?.name}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer hover:text-green-900"
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
