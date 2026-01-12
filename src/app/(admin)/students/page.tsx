import StudentsList from "./components/StudentsList";
import { getStudents } from "@/lib/dal/students";
import { getActiveCourses } from "@/lib/dal/courses";

export const dynamic = 'force-dynamic';

export default async function StudentsPage() {
  // Récupérer les données via le DAL Prisma (Architecture DDD)
  const [students, typedCourses] = await Promise.all([
    getStudents(),
    getActiveCourses(),
  ]);

  return (
    <div className="w-full p-4 md:p-6">
      <div className="w-full md:max-w-7xl md:mx-auto">
        <StudentsList initialStudents={students} availableCourses={typedCourses} />
      </div>
    </div>
  );
}
