import { Search, Edit, Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import NewCourseModal from "./components/NewCourseModal";
import supabase from "@/lib/supabase";
import Link from "next/link";
import CoursesClientTable from "./components/CoursesClientTable";

export default async function CoursesPage() {
  // Fetch all courses, teachers, rooms, enrollments côté serveur
  const { data, error } = await supabase.from("courses").select(`
    id, name, type, status, price, capacity,
    teachers(full_name), rooms(name), enrollments(id)
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
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          {/* La recherche sera gérée côté client dans le composant enfant */}
        </div>
        <NewCourseModal />
      </div>
      <CoursesClientTable courses={courses} />
    </div>
  );
}
