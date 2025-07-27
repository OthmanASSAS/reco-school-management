"use client";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Users, MapPin, Euro, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NewCourseModal from "./NewCourseModal";

const EditCourseModal = dynamic(() => import("./EditCourseModal"), { ssr: false });

interface Course {
  id: string;
  name: string;
  type: string;
  teacher_name: string | null;
  room_name: string | null;
  status: string;
  price: number;
  capacity: number;
  enrolled_count: number;
  teacher_id?: string;
  room_id?: string;
  schedule?: string;
}

interface CoursesClientTableProps {
  courses: Course[];
}

export default function CoursesClientTable({ courses }: CoursesClientTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  // const deleteFormRef = useRef<HTMLFormElement>(null);

  const filteredCourses = courses.filter(
    course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.teacher_name &&
        course.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.room_name && course.room_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Debug: afficher les informations de recherche
  console.log("Search term:", searchTerm);
  console.log("Total courses:", courses.length);
  console.log("Filtered courses:", filteredCourses.length);

  async function handleDelete(courseId: string) {
    setDeleting(true);
    const form = document.getElementById("delete-course-form") as HTMLFormElement | null;
    if (form) {
      const input = form.querySelector("input[name='id']") as HTMLInputElement | null;
      if (input) {
        input.value = courseId;
        try {
          await form.requestSubmit();
          toast({ title: "Cours supprimé", description: "Le cours a bien été supprimé." });
        } catch {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Une erreur est survenue lors de la suppression du cours.",
          });
        }
      }
    }
    setDeleting(false);
    setDeleteCourseId(null);
    router.refresh();
  }

  function handleEdit(course: Course) {
    setEditCourse(course);
  }

  function handleEditModalClose() {
    setEditCourse(null);
    router.refresh();
  }

  function handleCourseCreated() {
    router.refresh();
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        label: "Actif",
        className: "bg-green-100 text-green-800 text-xs px-1.5 py-0.5 h-5",
      },
      inactive: {
        label: "Inactif",
        className: "bg-gray-100 text-gray-800 text-xs px-1.5 py-0.5 h-5",
      },
      finished: {
        label: "Terminé",
        className: "bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 h-5",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;

    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      enfants: {
        label: "Enfants",
        className: "bg-orange-100 text-orange-800 text-xs px-1.5 py-0.5 h-5",
      },
      adultes: {
        label: "Adultes",
        className: "bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 h-5",
      },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.adultes;

    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">C</span>
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Cours</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredCourses.length} sur {courses.length} cours
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Input
                  placeholder="Rechercher un cours..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full sm:w-80 pl-10 bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200"
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
              <div className="w-full sm:w-auto">
                <NewCourseModal onCourseCreated={handleCourseCreated} />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Table pour Desktop */}
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900">Liste des cours</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredCourses.length} cours trouvé{filteredCourses.length > 1 ? "s" : ""}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="text-left py-4 px-3 font-semibold text-gray-700 text-sm uppercase tracking-wide w-64">
                        Cours
                      </th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700 text-sm uppercase tracking-wide w-24">
                        Type
                      </th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700 text-sm uppercase tracking-wide w-48">
                        Professeur
                      </th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700 text-sm uppercase tracking-wide w-48">
                        Salle
                      </th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700 text-sm uppercase tracking-wide w-32">
                        Prix
                      </th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700 text-sm uppercase tracking-wide w-20">
                        Capacité
                      </th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700 text-sm uppercase tracking-wide w-20">
                        Inscrits
                      </th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700 text-sm uppercase tracking-wide w-20">
                        Statut
                      </th>
                      <th className="text-right py-4 px-3 font-semibold text-gray-700 text-sm uppercase tracking-wide w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCourses.map(course => (
                      <tr
                        key={course.id}
                        className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200"
                      >
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-all duration-200">
                              {course.name
                                .split(" ")
                                .map(n => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {course.name}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                {course.schedule || "Horaires non définis"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-3">{getTypeBadge(course.type)}</td>
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2 p-1.5 bg-purple-50/50 rounded-lg group-hover:bg-purple-100/50 transition-colors">
                            <div className="p-1 bg-purple-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                              <Users size={12} className="text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {course.teacher_name || "Non assigné"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2 p-1.5 bg-green-50/50 rounded-lg group-hover:bg-green-100/50 transition-colors">
                            <div className="p-1 bg-green-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                              <MapPin size={12} className="text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {course.room_name || "Non assignée"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2 p-1.5 bg-yellow-50/50 rounded-lg group-hover:bg-yellow-100/50 transition-colors">
                            <div className="p-1 bg-yellow-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                              <Euro size={12} className="text-yellow-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {course.price} €
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2 p-1.5 bg-orange-50/50 rounded-lg group-hover:bg-orange-100/50 transition-colors">
                            <div className="p-1 bg-orange-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                              <Users size={12} className="text-orange-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {course.capacity || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2 p-1.5 bg-blue-50/50 rounded-lg group-hover:bg-blue-100/50 transition-colors">
                            <div className="p-1 bg-blue-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                              <BookOpen size={12} className="text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {course.enrolled_count}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-3">{getStatusBadge(course.status)}</td>
                        <td className="py-4 px-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-all duration-200"
                              onClick={() => handleEdit(course)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200"
                              onClick={() => setDeleteCourseId(course.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cartes pour Mobile/Tablette */}
          <div className="lg:hidden">
            <div className="grid gap-4 md:grid-cols-2">
              {filteredCourses.map(course => (
                <Card
                  key={course.id}
                  className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white overflow-hidden"
                >
                  <CardContent className="p-6">
                    {/* En-tête avec avatar et actions */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {course.name
                            .split(" ")
                            .map(n => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {course.name}
                          </h3>
                          <div className="flex gap-1 mt-1">
                            {getTypeBadge(course.type)}
                            {getStatusBadge(course.status)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Informations du cours */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg group/contact hover:bg-purple-100 transition-colors">
                        <div className="p-1 bg-purple-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                          <Users size={12} className="text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {course.teacher_name || "Non assigné"}
                          </div>
                          <div className="text-xs text-gray-500">Professeur</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg group/contact hover:bg-green-100 transition-colors">
                        <div className="p-1 bg-green-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                          <MapPin size={12} className="text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {course.room_name || "Non assignée"}
                          </div>
                          <div className="text-xs text-gray-500">Salle</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg group/contact hover:bg-yellow-100 transition-colors">
                          <div className="p-1 bg-yellow-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                            <Euro size={12} className="text-yellow-600" />
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="text-sm font-medium text-gray-900">
                              {course.price} €
                            </div>
                            <div className="text-xs text-gray-500">Prix</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg group/contact hover:bg-orange-100 transition-colors">
                          <div className="p-1 bg-orange-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                            <Users size={12} className="text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="text-sm font-medium text-gray-900">
                              {course.capacity || "—"}
                            </div>
                            <div className="text-xs text-gray-500">Capacité</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg group/contact hover:bg-blue-100 transition-colors">
                        <div className="p-1 bg-blue-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                          <BookOpen size={12} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="text-sm font-medium text-gray-900">
                            {course.enrolled_count} inscrit{course.enrolled_count > 1 ? "s" : ""}
                          </div>
                          <div className="text-xs text-gray-500">Élèves inscrits</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 pt-4 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all text-xs px-2"
                        onClick={() => handleEdit(course)}
                      >
                        <Edit size={12} className="mr-1" />
                        <span className="hidden sm:inline">Modifier</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all text-xs px-2 w-8 h-8 p-0"
                        onClick={() => setDeleteCourseId(course.id)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? "Aucun cours trouvé" : "Aucun cours enregistré"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {searchTerm
                  ? "Essayez de modifier vos critères de recherche ou ajoutez un nouveau cours."
                  : "Commencez par ajouter votre premier cours."}
              </p>
              {!searchTerm && <NewCourseModal />}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal d'édition */}
      {editCourse && (
        <EditCourseModal
          course={editCourse}
          open={!!editCourse}
          onClose={handleEditModalClose}
          onSaved={handleCourseCreated}
        />
      )}

      {/* Confirmation de suppression */}
      {deleteCourseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
            <p className="mb-6">
              Voulez-vous vraiment supprimer ce cours ? Cette action est irréversible.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteCourseId(null)}
                disabled={deleting}
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteCourseId)}
                disabled={deleting}
                className="w-full sm:w-auto"
              >
                {deleting ? "Suppression..." : "Supprimer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
