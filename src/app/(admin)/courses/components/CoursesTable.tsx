import { Badge } from "@/components/ui/badge";
import { Course } from "@/types";
import { Edit, Euro, MapPin, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { deleteCourse } from "../actions/actions";

interface Props {
  courses: Course[];
}
// TODO
export function CoursesTable({ courses }: Props) {
  const handleDelete = async (courseId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) return;

    const formData = new FormData();
    formData.append("id", courseId);
    await deleteCourse(formData);
  };

  if (courses.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500 mb-2">Aucun cours trouvé</p>
        <p className="text-sm text-gray-400">Commencez par créer votre premier cours</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Cours</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Professeur</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Salle</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Horaires</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Type</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Capacité</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Prix</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {courses.map(course => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">{course.label}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {course.category} • {course.audience}
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-gray-400" />
                    <span
                      className={course.teacher_name ? "text-gray-900" : "text-gray-400 italic"}
                    >
                      {course.teacher_name || "Non assigné"}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span className={course.room_name ? "text-gray-900" : "text-gray-400 italic"}>
                      {course.room_name || "Non assignée"}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={course.schedule_label ? "text-gray-900" : "text-gray-400 italic"}
                    >
                      {course.schedule_label || "Non définis"}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={
                      course.type === "enfants"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : course.type === "adultes"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                    }
                  >
                    {course.type === "enfants"
                      ? "Enfants"
                      : course.type === "adultes"
                        ? "Adultes"
                        : course.type}
                  </Badge>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-gray-400" />
                    <span className="font-medium text-gray-900">{course.capacity}</span>
                    <span className="text-sm text-gray-500">places</span>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Euro size={14} className="text-gray-400" />
                    <span className="font-medium text-gray-900">{course.price}</span>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/courses/${course.id}`}>
                      <button
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                        title="Éditer le cours"
                      >
                        <Edit size={16} />
                      </button>
                    </Link>

                    <button
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                      title="Supprimer le cours"
                      onClick={() => handleDelete(course.id)}
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
        {courses.length} cours affiché{courses.length > 1 ? "s" : ""}
      </div>
    </div>
  );
}
