"use client";

import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Student, Course, Enrollment } from "@/types/families";

interface StudentWithFamily extends Omit<Student, "enrollments"> {
  family: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  enrollments: any[];
  created_at: string;
  activeEnrollments: any[];
  finishedEnrollments: any[];
  activeCoursesCount: number;
  hasHistory: boolean;
  hasMultipleCourses: boolean;
  course: string;
}

interface EnrichedEnrollment extends Omit<Enrollment, "courses"> {
  courses: Course;
}

interface EnrichedStudent extends Omit<Student, "enrollments"> {
  family: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  enrollments: EnrichedEnrollment[];
  activeEnrollments: EnrichedEnrollment[];
  finishedEnrollments: EnrichedEnrollment[];
  activeCoursesCount: number;
  hasHistory: boolean;
  hasMultipleCourses: boolean;
  course: string;
  created_at: string;
}

interface StudentsListProps {
  initialStudents: StudentWithFamily[];
  availableCourses: Course[];
}

export default function StudentsList({ initialStudents, availableCourses }: StudentsListProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [students, setStudents] = useState<StudentWithFamily[]>(initialStudents);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithFamily | null>(null);
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

  // Fonction pour attribuer un cours à un étudiant
  const assignCourseToStudent = async () => {
    if (!selectedStudent || !selectedCourseForEdit) return;

    setEnrollmentLoading(true);

    try {
      const { data, error } = await supabase.from("enrollments").insert([
        {
          student_id: selectedStudent.id,
          course_id: selectedCourseForEdit,
          start_date: new Date().toISOString().split("T")[0],
          status: "active",
        },
      ]).select(`
          id,
          status,
          start_date,
          end_date,
          created_at,
          courses:course_id (
            id,
            name,
            type,
            category,
            label,
            status
          )
        `);

      if (error) {
        console.error("Erreur création enrollment:", error);
        toast({
          variant: "destructive",
          title: "Erreur d'attribution",
          description: "Erreur lors de l'attribution du cours",
        });
        return;
      }

      // Mettre à jour l'étudiant avec le nouveau cours
      const newEnrollment = data[0];
      setStudents(currentStudents =>
        currentStudents.map(student => {
          if (student.id === selectedStudent.id) {
            const updatedEnrollments = [...student.enrollments, newEnrollment];
            const updatedActiveEnrollments = [...student.activeEnrollments, newEnrollment];
            return {
              ...student,
              enrollments: updatedEnrollments,
              activeEnrollments: updatedActiveEnrollments,
              activeCoursesCount: updatedActiveEnrollments.length,
              hasMultipleCourses: updatedActiveEnrollments.length > 1,
              course: newEnrollment.courses?.[0]?.name || "Non assigné",
            };
          }
          return student;
        })
      );

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

  // Fonction pour terminer un cours
  const finishCourse = async (enrollmentId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir terminer ce cours ?")) return;

    try {
      // 1. Met à jour dans Supabase
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

      // 2. Met à jour la liste globale des étudiants
      setStudents(currentStudents =>
        currentStudents.map(student => {
          if (student.enrollments.some(e => e.id === enrollmentId)) {
            const updatedEnrollments = student.enrollments.map(e =>
              e.id === enrollmentId ? { ...e, status: "finished" } : e
            );

            const updatedActiveEnrollments = updatedEnrollments.filter(e => e.status === "active");
            const updatedFinishedEnrollments = updatedEnrollments.filter(
              e => e.status === "finished"
            );

            return {
              ...student,
              enrollments: updatedEnrollments,
              activeEnrollments: updatedActiveEnrollments,
              finishedEnrollments: updatedFinishedEnrollments,
              activeCoursesCount: updatedActiveEnrollments.length,
              hasMultipleCourses: updatedActiveEnrollments.length > 1,
              hasHistory: updatedFinishedEnrollments.length > 0,
              course: updatedActiveEnrollments[0]?.courses?.name || "Non assigné",
            };
          }
          return student;
        })
      );

      // 3. Met à jour l'étudiant affiché dans la modale
      if (selectedStudent?.enrollments.some(e => e.id === enrollmentId)) {
        const updatedEnrollments = selectedStudent.enrollments.map(e =>
          e.id === enrollmentId ? { ...e, status: "finished" } : e
        );

        const updatedActiveEnrollments = updatedEnrollments.filter(e => e.status === "active");
        const updatedFinishedEnrollments = updatedEnrollments.filter(e => e.status === "finished");

        setSelectedStudent({
          ...selectedStudent,
          enrollments: updatedEnrollments,
          activeEnrollments: updatedActiveEnrollments,
          finishedEnrollments: updatedFinishedEnrollments,
          activeCoursesCount: updatedActiveEnrollments.length,
          hasMultipleCourses: updatedActiveEnrollments.length > 1,
          hasHistory: updatedFinishedEnrollments.length > 0,
          course: updatedActiveEnrollments[0]?.courses?.name || "Non assigné",
        });
      }

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

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      `${student.first_name} ${student.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.family.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const getTypeDisplay = (type: string, birthDate: string | null) => {
    const age = calculateAge(birthDate);
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

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">É</span>
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Élèves</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredStudents.length} sur {students.length} élèves
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Input
                  placeholder="Rechercher un élève..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full sm:w-80 pl-10 bg-white border-gray-200 focus:border-green-300 focus:ring-green-200"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full sm:w-48 bg-white border-gray-200 focus:border-green-300 focus:ring-green-200">
                  <SelectValue placeholder="Tous les cours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="all" value="all">
                    Tous les cours
                  </SelectItem>
                  {Array.from(new Set(students.map(s => s.course)))
                    .filter(course => course !== "Non assigné")
                    .sort()
                    .map(course => (
                      <SelectItem key={`course-${course}`} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-48 bg-white border-gray-200 focus:border-green-300 focus:ring-green-200">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="status-all" value="all">
                    Tous
                  </SelectItem>
                  <SelectItem key="status-active" value="active">
                    Cours actifs
                  </SelectItem>
                  <SelectItem key="status-no_course" value="no_course">
                    Sans cours
                  </SelectItem>
                  <SelectItem key="status-multiple" value="multiple">
                    Cours multiples
                  </SelectItem>
                  <SelectItem key="status-history" value="history">
                    Avec historique
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="w-full sm:w-auto">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg">
                  <UserPlus size={16} className="mr-2" />
                  Nouvel élève
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Statistiques */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{students.length}</div>
              <div className="text-sm text-blue-700 font-medium">Total élèves</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {students.filter(s => s.activeCoursesCount > 0).length}
              </div>
              <div className="text-sm text-green-700 font-medium">Avec cours actifs</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                {students.filter(s => s.hasMultipleCourses).length}
              </div>
              <div className="text-sm text-purple-700 font-medium">Cours multiples</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">
                {students.filter(s => s.hasHistory).length}
              </div>
              <div className="text-sm text-orange-700 font-medium">Avec historique</div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-600">
                {students.filter(s => s.activeCoursesCount === 0).length}
              </div>
              <div className="text-sm text-gray-700 font-medium">Sans cours</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des étudiants */}
      {students.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">Aucun élève trouvé</p>
        </div>
      ) : (
        <>
          {/* Version mobile - Cartes */}
          <div className="block lg:hidden space-y-4">
            {filteredStudents.map(student => (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                        {student.first_name} {student.last_name}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {getTypeDisplay(student.registration_type, student.birth_date)}
                        </Badge>
                        {student.level && (
                          <Badge variant="secondary" className="text-xs">
                            {student.level}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800"
                            title="Voir les détails"
                            onClick={() => setSelectedStudent(student)}
                          >
                            <Eye size={16} />
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-800"
                        title="Attribuer/Modifier cours"
                        onClick={() => {
                          setSelectedStudent(student);
                          setEditModalOpen(true);
                        }}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Cours:</span>
                      <p
                        className={`font-medium ${
                          student.course === "Non assigné"
                            ? "text-gray-400 italic"
                            : "text-gray-900"
                        }`}
                      >
                        {student.course}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Famille:</span>
                      <p className="font-medium">{student.family.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Première inscription:</span>
                      <p className="font-medium">{formatDate(student.created_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Version desktop - Table */}
          <div className="hidden lg:block bg-white rounded-lg border">
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
                          <div className="font-medium text-gray-900">
                            {student.first_name} {student.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getTypeDisplay(student.registration_type, student.birth_date)}
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
                          <div className="flex gap-1 mt-1">
                            {student.hasMultipleCourses && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                              >
                                Multiples
                              </Badge>
                            )}
                            {student.hasHistory && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                              >
                                Historique
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              student.activeCoursesCount > 0 ? "bg-green-500" : "bg-gray-300"
                            }`}
                          />
                          <span className="text-sm text-gray-600">
                            {student.activeCoursesCount > 0 ? "Actif" : "Inactif"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{student.family.name}</td>
                      <td className="px-4 py-3 text-gray-700">{formatDate(student.created_at)}</td>
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
          </div>
        </>
      )}

      {/* Modal d'attribution de cours */}
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
                <h4 className="font-medium text-blue-800">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </h4>
                <p className="text-sm text-blue-600">
                  {getTypeDisplay(selectedStudent.registration_type, selectedStudent.birth_date)}
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
                      const alreadyEnrolled = selectedStudent.activeEnrollments?.some(
                        e => e.courses?.id === course.id
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

              {selectedStudent.activeEnrollments?.length > 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <h5 className="text-sm font-medium text-yellow-800 mb-2">Cours actuels :</h5>
                  <div className="space-y-1">
                    {selectedStudent.activeEnrollments.map(enrollment => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-yellow-700">
                          {enrollment.courses?.label || enrollment.courses?.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => finishCourse(enrollment.id)}
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
    </div>
  );
}
