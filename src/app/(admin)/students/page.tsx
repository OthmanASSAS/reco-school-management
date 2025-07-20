"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Edit, Eye, Trash2, History, Plus, Calendar, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function StudentsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [students, setStudents] = useState<any[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCourseForEdit, setSelectedCourseForEdit] = useState<string>("");
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  // Fonction pour calculer l'âge
  const calculateAge = (birthDate: string | null): number | null => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Fonction pour récupérer toutes les données
  const fetchData = async () => {
    setLoading(true);

    try {
      // Récupérer les familles et étudiants avec enrollments
      const { data, error } = await supabase.from("families").select(`
          *,
          students(
            *,
            enrollments(
              id,
              start_date,
              end_date,
              status,
              created_at,
              courses(
                id,
                name,
                type,
                category,
                label
              )
            )
          )
        `);

      if (error) {
        console.error("Erreur Supabase :", error);
        setLoading(false);
        return;
      }

      // Récupérer tous les cours disponibles pour l'attribution
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("id, name, type, category, label, status")
        .eq("status", "active")
        .order("name");

      if (coursesError) {
        console.error("Erreur récupération cours :", coursesError);
      } else {
        setAvailableCourses(coursesData || []);
      }

      // Transformer les données avec gestion historique
      const allStudents = (data || []).flatMap((family: any) =>
        (family.students || []).map((student: any) => {
          const enrollments = student.enrollments || [];

          // Séparer les cours actifs et terminés
          const activeEnrollments = enrollments.filter((e: any) => e.status === "active");
          const finishedEnrollments = enrollments.filter((e: any) => e.status === "finished");

          // Cours principal (le plus récent actif, ou le premier actif)
          const primaryEnrollment = activeEnrollments.sort(
            (a: any, b: any) =>
              new Date(b.start_date || b.created_at).getTime() -
              new Date(a.start_date || a.created_at).getTime()
          )[0];

          const primaryCourse = primaryEnrollment?.courses;

          // Statistiques
          const totalEnrollments = enrollments.length;
          const activeCount = activeEnrollments.length;
          const finishedCount = finishedEnrollments.length;

          return {
            id: student.id,
            name: `${student.first_name} ${student.last_name}`,
            firstName: student.first_name,
            lastName: student.last_name,
            age: calculateAge(student.birth_date),
            birthDate: student.birth_date,

            // Cours principal
            course: primaryCourse?.name || "Non assigné",
            courseName: primaryCourse?.label || primaryCourse?.name || "Non assigné",
            courseType: primaryCourse?.type || null,
            courseId: primaryCourse?.id || null,

            // Informations sur les inscriptions
            type: student.registration_type || "child",
            level: student.level || null,
            notes: student.notes || null,

            // Famille
            family: `${family.last_name} ${family.first_name}`,
            familyEmail: family.email,
            familyPhone: family.phone,

            // Statistiques des cours
            activeCoursesCount: activeCount,
            totalCoursesCount: totalEnrollments,
            hasHistory: finishedCount > 0,
            hasMultipleCourses: activeCount > 1,

            // Listes détaillées
            activeCourses: activeEnrollments.map((e: any) => ({
              id: e.id,
              name: e.courses?.name,
              label: e.courses?.label || e.courses?.name,
              startDate: e.start_date,
              enrollmentId: e.id,
            })),

            courseHistory: finishedEnrollments
              .map((e: any) => ({
                id: e.id,
                name: e.courses?.name,
                label: e.courses?.label || e.courses?.name,
                startDate: e.start_date,
                endDate: e.end_date,
                enrollmentId: e.id,
              }))
              .sort(
                (a: any, b: any) =>
                  new Date(b.endDate || b.startDate).getTime() -
                  new Date(a.endDate || a.startDate).getTime()
              ),

            // Dates importantes
            firstEnrollment:
              enrollments.length > 0
                ? enrollments.sort(
                    (a: any, b: any) =>
                      new Date(a.start_date || a.created_at).getTime() -
                      new Date(b.start_date || b.created_at).getTime()
                  )[0].start_date || enrollments[0].created_at
                : student.created_at,

            latestEnrollment: primaryEnrollment?.start_date || primaryEnrollment?.created_at,

            // Données brutes pour les actions
            rawStudent: student,
            rawFamily: family,
            rawEnrollments: enrollments,
          };
        })
      );

      setStudents(allStudents);
    } catch (error) {
      console.error("Erreur générale :", error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour attribuer un cours à un étudiant
  const assignCourseToStudent = async () => {
    if (!selectedStudent || !selectedCourseForEdit) return;

    setEnrollmentLoading(true);

    try {
      // Créer le nouvel enrollment
      const { data, error } = await supabase
        .from("enrollments")
        .insert([
          {
            student_id: selectedStudent.id,
            course_id: selectedCourseForEdit,
            start_date: new Date().toISOString().split("T")[0],
            status: "active",
          },
        ])
        .select("*")
        .single();

      if (error) {
        console.error("Erreur création enrollment:", error);
        toast({
          variant: "destructive",
          title: "Erreur d'attribution",
          description: "Erreur lors de l'attribution du cours",
        });
        return;
      }

      // Recharger les données
      await fetchData();

      // Fermer la modal et reset
      setEditModalOpen(false);
      setSelectedCourseForEdit("");
      setSelectedStudent(null);

      toast({
        title: "Cours attribué",
        description: "Le cours a été attribué avec succès !",
      });
    } catch (error) {
      console.error("Erreur inattendue:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
      });
    } finally {
      setEnrollmentLoading(false);
    }
  };

  // Fonction pour terminer un cours (mettre end_date)
  const finishCourse = async (enrollmentId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir terminer ce cours ?")) return;

    try {
      const { error } = await supabase
        .from("enrollments")
        .update({
          end_date: new Date().toISOString().split("T")[0],
          status: "finished",
        })
        .eq("id", enrollmentId);

      if (error) {
        console.error("Erreur fin de cours:", error);
        toast({
          variant: "destructive",
          title: "Erreur de fin de cours",
          description: "Erreur lors de la fin du cours",
        });
        return;
      }

      // Recharger les données
      await fetchData();
      toast({
        title: "Cours terminé",
        description: "Le cours a été terminé avec succès !",
      });
    } catch (error) {
      console.error("Erreur inattendue:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtres
  const allCourses = Array.from(new Set(students.map(s => s.course))).filter(Boolean);

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.family?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse = selectedCourse === "all" || student.course === selectedCourse;

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && student.activeCoursesCount > 0) ||
      (selectedStatus === "no_course" && student.activeCoursesCount === 0) ||
      (selectedStatus === "multiple" && student.hasMultipleCourses) ||
      (selectedStatus === "history" && student.hasHistory);

    return matchesSearch && matchesCourse && matchesStatus;
  });

  const getTypeDisplay = (type: string, age: number | null) => {
    if (type === "adult") return "Adulte";
    if (type === "child" && age) return `${age} ans`;
    if (type === "child") return "Enfant";
    return "Non défini";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Modal d'attribution de cours
  const CourseAssignmentModal = () => (
    <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus size={20} />
            Attribuer un cours
          </DialogTitle>
        </DialogHeader>

        {selectedStudent && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800">{selectedStudent.name}</h4>
              <p className="text-sm text-blue-600">
                {getTypeDisplay(selectedStudent.type, selectedStudent.age)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-select">Sélectionner un cours</Label>
              <Select value={selectedCourseForEdit} onValueChange={setSelectedCourseForEdit}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un cours..." />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses.map(course => {
                    // Vérifier si l'étudiant suit déjà ce cours
                    const alreadyEnrolled = selectedStudent.activeCourses.some(
                      (ac: any) => ac.name === course.name
                    );

                    return (
                      <SelectItem key={course.id} value={course.id} disabled={alreadyEnrolled}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {course.label || course.name}
                            {alreadyEnrolled && " (déjà inscrit)"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {course.type} • {course.category}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedStudent.activeCourses.length > 0 && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <h5 className="text-sm font-medium text-yellow-800 mb-2">Cours actuels :</h5>
                <div className="space-y-1">
                  {selectedStudent.activeCourses.map((course: any) => (
                    <div key={course.id} className="flex items-center justify-between text-sm">
                      <span className="text-yellow-700">{course.label}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => finishCourse(course.enrollmentId)}
                        className="text-red-600 hover:text-red-800 h-6 px-2"
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedCourseForEdit("");
                  setSelectedStudent(null);
                }}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={assignCourseToStudent}
                disabled={!selectedCourseForEdit || enrollmentLoading}
                className="flex-1"
              >
                {enrollmentLoading ? "Attribution..." : "Attribuer"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  const StudentDetailsModal = ({ student }: { student: any }) => (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <span>{student.name}</span>
          <Badge variant="outline">{getTypeDisplay(student.type, student.age)}</Badge>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Informations générales */}
        <div>
          <h3 className="font-semibold mb-2">Informations générales</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Nom :</span> {student.lastName}
            </div>
            <div>
              <span className="text-gray-600">Prénom :</span> {student.firstName}
            </div>
            <div>
              <span className="text-gray-600">Âge :</span>{" "}
              {student.age ? `${student.age} ans` : "-"}
            </div>
            <div>
              <span className="text-gray-600">Date de naissance :</span>{" "}
              {formatDate(student.birthDate)}
            </div>
            <div>
              <span className="text-gray-600">Niveau :</span> {student.level || "-"}
            </div>
            <div>
              <span className="text-gray-600">Type :</span> {student.type}
            </div>
          </div>
          {student.notes && (
            <div className="mt-2">
              <span className="text-gray-600">Notes :</span>
              <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{student.notes}</p>
            </div>
          )}
        </div>

        {/* Famille */}
        <div>
          <h3 className="font-semibold mb-2">Famille</h3>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-gray-600">Nom :</span> {student.family}
            </div>
            <div>
              <span className="text-gray-600">Email :</span> {student.familyEmail || "-"}
            </div>
            <div>
              <span className="text-gray-600">Téléphone :</span> {student.familyPhone || "-"}
            </div>
          </div>
        </div>

        {/* Cours actifs */}
        {student.activeCourses.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span>Cours actifs ({student.activeCourses.length})</span>
            </h3>
            <div className="space-y-2">
              {student.activeCourses.map((course: any, index: number) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-green-800">{course.label}</div>
                    <div className="text-sm text-green-600">
                      Depuis le {formatDate(course.startDate)}
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Actif</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historique */}
        {student.courseHistory.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <History size={16} />
              <span>Historique des cours ({student.courseHistory.length})</span>
            </h3>
            <div className="space-y-2">
              {student.courseHistory.map((course: any) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-800">{course.label}</div>
                    <div className="text-sm text-gray-600">
                      Du {formatDate(course.startDate)} au {formatDate(course.endDate)}
                    </div>
                  </div>
                  <Badge variant="secondary">Terminé</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dates importantes */}
        <div>
          <h3 className="font-semibold mb-2">Dates importantes</h3>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-gray-600">Première inscription :</span>{" "}
              {formatDate(student.firstEnrollment)}
            </div>
            {student.latestEnrollment && (
              <div>
                <span className="text-gray-600">Dernière inscription :</span>{" "}
                {formatDate(student.latestEnrollment)}
              </div>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  );

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:flex-1 lg:max-w-4xl">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <Input
              placeholder="Rechercher un élève, famille ou cours..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Cours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les cours</SelectItem>
                {allCourses.map(course => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
                <SelectItem value="Non assigné">Non assigné</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Cours actifs</SelectItem>
                <SelectItem value="no_course">Sans cours</SelectItem>
                <SelectItem value="multiple">Cours multiples</SelectItem>
                <SelectItem value="history">Avec historique</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <UserPlus size={16} className="mr-2" />
          Nouvel élève
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{students.length}</div>
          <div className="text-sm text-gray-600">Total élèves</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {students.filter(s => s.activeCoursesCount > 0).length}
          </div>
          <div className="text-sm text-gray-600">Avec cours actifs</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {students.filter(s => s.hasMultipleCourses).length}
          </div>
          <div className="text-sm text-gray-600">Cours multiples</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">
            {students.filter(s => s.hasHistory).length}
          </div>
          <div className="text-sm text-gray-600">Avec historique</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-600">
            {students.filter(s => s.activeCoursesCount === 0).length}
          </div>
          <div className="text-sm text-gray-600">Sans cours</div>
        </div>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Chargement des élèves...</div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500 mb-2">Aucun élève trouvé</p>
          {searchTerm && (
            <p className="text-sm text-gray-400">
              Essayez de modifier votre recherche ou vos filtres
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Élève</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Cours</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Statut</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Famille</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Première inscription
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">
                          {getTypeDisplay(student.type, student.age)}
                          {student.level && ` • ${student.level}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div
                          className={
                            student.course === "Non assigné"
                              ? "text-gray-400 italic"
                              : "text-gray-900"
                          }
                        >
                          {student.course}
                        </div>

                        {/* Badges pour cours multiples et historique */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {student.hasMultipleCourses && (
                            <Badge variant="outline" className="text-xs">
                              +{student.activeCoursesCount - 1} autre
                              {student.activeCoursesCount > 2 ? "s" : ""}
                            </Badge>
                          )}
                          {student.hasHistory && (
                            <Badge variant="secondary" className="text-xs">
                              <History size={10} className="mr-1" />
                              Historique
                            </Badge>
                          )}
                          {student.activeCoursesCount === 0 && student.totalCoursesCount > 0 && (
                            <Badge variant="outline" className="text-xs text-orange-600">
                              Cours terminés
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {student.activeCoursesCount > 0 ? (
                          <Badge className="bg-green-100 text-green-800">
                            {student.activeCoursesCount} actif
                            {student.activeCoursesCount > 1 ? "s" : ""}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Sans cours</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-gray-900">{student.family}</div>
                        <div className="text-xs text-gray-500">{student.familyEmail}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDate(student.firstEnrollment)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                              title="Voir les détails"
                              onClick={() => setSelectedStudent(student)}
                            >
                              <Eye size={16} />
                            </button>
                          </DialogTrigger>
                          {selectedStudent && <StudentDetailsModal student={selectedStudent} />}
                        </Dialog>

                        <button
                          className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                          title="Attribuer/Modifier cours"
                          onClick={() => {
                            setSelectedStudent(student);
                            setEditModalOpen(true);
                          }}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-600">
            {filteredStudents.length} élève{filteredStudents.length > 1 ? "s" : ""} affiché
            {filteredStudents.length > 1 ? "s" : ""}
            {students.length !== filteredStudents.length && ` sur ${students.length} total`}
          </div>
        </div>
      )}

      {/* Modals */}
      <CourseAssignmentModal />
    </div>
  );
}
