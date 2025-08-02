<<<<<<< HEAD
// app/courses/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Eye, Trash2, Plus } from "lucide-react";
import supabase from "@/lib/supabase";
import Link from "next/link";

interface Course {
  id: string;
  name: string;
  type: string;
  teacher_name: string | null;
  room_name: string | null;
  status: string;
  price: number;
  capacity: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("courses")
      .select(`id, name, type, status, price, capacity, 
        teachers(full_name), rooms(name)`);

    if (error) {
      console.error("Erreur récupération cours:", error);
    } else {
      const formatted = data.map((c: any) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        teacher_name: c.teachers?.full_name ?? null,
        room_name: c.rooms?.name ?? null,
        status: c.status,
        price: c.price,
        capacity: c.capacity,
      }));
      setCourses(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <Input
            placeholder="Rechercher un cours..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Link href="/courses/new">
          <Button className="ml-4">
            <Plus size={16} className="mr-2" /> Nouveau cours
          </Button>
        </Link>
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
                {/* TODO ADD horaires */}
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-500">
                    Chargement des cours...
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-500">
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
=======
import supabase from "@/lib/supabase";
import CoursesClientTable from "./components/CoursesClientTable";
import { deleteCourse } from "./actions/actions.server";

export default async function CoursesPage() {
  // Fetch all courses, teachers, rooms, enrollments côté serveur
  const { data } = await supabase.from("courses").select(`
    id, name, type, status, price, capacity,
    teachers(full_name), rooms(name), enrollments(id), teacher_id, room_id, schedule
  `);

  const courses = (data || [])
    .map((c: any) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      teacher_name: c.teachers?.full_name ?? null,
      room_name: c.rooms?.name ?? null,
      status: c.status,
      price: c.price,
      capacity: c.capacity,
      enrolled_count: c.enrollments ? c.enrollments.length : 0,
      teacher_id: c.teacher_id,
      room_id: c.room_id,
      schedule: c.schedule,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Handler pour la suppression (Server Action)
  async function handleDeleteCourse(formData: FormData) {
    "use server";
    await deleteCourse(formData);
  }

  return (
    <div className="w-full p-4 md:p-6">
      <div className="w-full md:max-w-7xl md:mx-auto space-y-6">
        {/* Formulaire caché pour la suppression */}
        <form id="delete-course-form" action={handleDeleteCourse} className="hidden">
          <input type="hidden" name="id" />
        </form>

        <CoursesClientTable courses={courses} />
>>>>>>> main
      </div>
    </div>
  );
}
