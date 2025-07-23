import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import NewCourseModal from "./components/NewCourseModal";
import supabase from "@/lib/supabase";
import CoursesClientTable from "./components/CoursesClientTable";
import { deleteCourse } from "./actions/actions.server";

export default async function CoursesPage() {
  // Fetch all courses, teachers, rooms, enrollments côté serveur
  const { data, error } = await supabase.from("courses").select(`
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          {/* La recherche sera gérée côté client dans le composant enfant */}
        </div>
        <NewCourseModal />
      </div>
      {/* Formulaire caché pour la suppression */}
      <form id="delete-course-form" action={handleDeleteCourse} className="hidden">
        <input type="hidden" name="id" />
      </form>
      <CoursesClientTable courses={courses} />
    </div>
  );
}
