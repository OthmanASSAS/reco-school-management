"use client";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";

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

  const EditCourseModal = dynamic(() => import("./EditCourseModal"), { ssr: false });

  return (
    <>
      <div className="relative w-full max-w-md mb-4">
        <Input
          placeholder="Rechercher un cours..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
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
                  <td colSpan={9} className="text-center py-6 text-gray-500">
                    Aucun cours trouvé
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
        <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-600">
          {filteredCourses.length} cours affiché{filteredCourses.length > 1 ? "s" : ""}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
            <p className="mb-6">
              Voulez-vous vraiment supprimer ce cours ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteCourseId(null)} disabled={deleting}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteCourseId)}
                disabled={deleting}
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
