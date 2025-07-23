"use client";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const deleteFormRef = useRef<HTMLFormElement>(null);

  // Écouter les changements de l'input de recherche de la page parent
  useEffect(() => {
    const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
    if (searchInput) {
      const handleSearch = (e: Event) => {
        setSearchTerm((e.target as HTMLInputElement).value);
      };
      searchInput.addEventListener("input", handleSearch);
      return () => searchInput.removeEventListener("input", handleSearch);
    }
  }, []);

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        } catch (e) {
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

  if (courses.length === 0) {
    return <div className="text-center py-8 text-gray-500">Aucun cours trouvé</div>;
  }

  return (
    <>
      {/* Version mobile - Cartes */}
      <div className="block lg:hidden space-y-4">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun cours trouvé pour cette recherche
          </div>
        ) : (
          filteredCourses.map(course => (
            <Card key={course.id} className="w-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                      {course.name}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant={course.status === "active" ? "default" : "secondary"}>
                        {course.status === "active" ? "Actif" : "Inactif"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {course.type === "enfants" ? "Enfants" : "Adultes"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-800"
                      title="Éditer le cours"
                      onClick={() => handleEdit(course)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer le cours"
                      onClick={() => setDeleteCourseId(course.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Prof:</span>
                    <p className="font-medium">{course.teacher_name ?? "—"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Salle:</span>
                    <p className="font-medium">{course.room_name ?? "—"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Prix:</span>
                    <p className="font-medium">{course.price} €</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Capacité:</span>
                    <p className="font-medium">{course.capacity ?? "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Inscrits:</span>
                    <p className="font-medium">{course.enrolled_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Version desktop - Table */}
      <div className="hidden lg:block bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Prof</th>
                <th className="px-4 py-3 text-left">Salle</th>
                <th className="px-4 py-3 text-left">Prix</th>
                <th className="px-4 py-3 text-left">Capacité</th>
                <th className="px-4 py-3 text-left">Inscrits</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">
                    Aucun cours trouvé pour cette recherche
                  </td>
                </tr>
              ) : (
                filteredCourses.map(course => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{course.name}</td>
                    <td className="px-4 py-3 text-gray-700">{course.type}</td>
                    <td className="px-4 py-3 text-gray-700">{course.teacher_name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-700">{course.room_name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-700">{course.price} €</td>
                    <td className="px-4 py-3 text-gray-700">{course.capacity ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-700">{course.enrolled_count}</td>
                    <td className="px-4 py-3">
                      <Badge variant={course.status === "active" ? "default" : "secondary"}>
                        {course.status === "active" ? "Actif" : "Inactif"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600"
                          title="Éditer le cours"
                          onClick={() => handleEdit(course)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          title="Supprimer le cours"
                          onClick={() => setDeleteCourseId(course.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'édition */}
      {editCourse && (
        <EditCourseModal
          course={editCourse}
          open={!!editCourse}
          onClose={handleEditModalClose}
          onSaved={router.refresh}
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
    </>
  );
}
