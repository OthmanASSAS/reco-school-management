import supabase from "@/lib/supabase";
import { Student, Course } from "@/types/families";
import StudentsList from "./components/StudentsList";

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

  // Transformer les données pour le composant client
  const students: StudentWithFamily[] =
    families?.flatMap(family =>
      family.students.map(student => {
        const enrollments = student.enrollments || [];
        const activeEnrollments = enrollments.filter(e => e.status === "active");
        const finishedEnrollments = enrollments.filter(e => e.status === "finished");
        const primaryCourse = activeEnrollments[0]?.courses;

        return {
          id: student.id,
          first_name: student.first_name,
          last_name: student.last_name,
          birth_date: student.birth_date,
          registration_type: student.registration_type,
          level: student.level,
          notes: student.notes,
          created_at: student.created_at,
          enrollments,
          activeEnrollments,
          finishedEnrollments,
          activeCoursesCount: activeEnrollments.length,
          hasHistory: finishedEnrollments.length > 0,
          hasMultipleCourses: activeEnrollments.length > 1,
          course: primaryCourse?.name || "Non assigné",
          family: {
            id: family.id,
            name: `${family.last_name} ${family.first_name}`,
            email: family.email,
            phone: family.phone,
          },
        };
      })
    ) || [];

  return (
    <div className="w-full p-4 md:p-6">
      <div className="w-full md:max-w-7xl md:mx-auto">
        <StudentsList initialStudents={students} availableCourses={courses || []} />
      </div>
    </div>
  );
}
