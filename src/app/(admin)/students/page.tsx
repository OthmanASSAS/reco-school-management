import supabase from "@/lib/supabase";
import StudentsList from "./components/StudentsList";
import { mapFamiliesToStudents } from "@/lib/students";
import { Course } from "@/types/families";

export default async function StudentsPage() {
  // Récupérer les données de base des étudiants côté serveur
  const { data: families, error: familiesError } = await supabase
    .from("families")
    .select(
      `
      id,
      last_name,
      first_name,
      email,
      phone,
      students!inner (
        id,
        first_name,
        last_name,
        birth_date,
        registration_type,
        level,
        notes,
        created_at,
        enrollments (
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
        )
      )
    `
    )
    .order("last_name");

  if (familiesError) {
    console.error("Error fetching families:", familiesError);
    return null;
  }

  // Récupérer les cours disponibles
  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("id, name, type, category, label, status, price")
    .eq("status", "active")
    .order("name");

  if (coursesError) {
    console.error("Error fetching courses:", coursesError);
    return null;
  }

  const students = mapFamiliesToStudents(families);
  const typedCourses: Course[] = courses || [];

  return (
    <div className="w-full p-4 md:p-6">
      <div className="w-full md:max-w-7xl md:mx-auto">
        <StudentsList initialStudents={students} availableCourses={typedCourses} />
      </div>
    </div>
  );
}
