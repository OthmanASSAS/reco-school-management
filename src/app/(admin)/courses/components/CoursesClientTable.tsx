"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
}

export default function CoursesClientTable({ courses }: { courses: Course[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="relative w-full max-w-md mb-4">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
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
                        <Link href={`/courses/${course.id}`}>
                          <Button variant="ghost" size="icon" className="text-blue-600">
                            <Eye size={16} />
                          </Button>
                        </Link>
                        <Link href={`/courses/${course.id}/edit`}>
                          <Button variant="ghost" size="icon" className="text-green-600">
                            <Edit size={16} />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="text-red-600">
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
    </>
  );
}
