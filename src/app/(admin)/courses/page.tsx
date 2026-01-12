import CoursesClientTable from "./components/CoursesClientTable";
import { deleteCourse } from "./actions/actions.server";
import { getCoursesWithDetails } from "@/lib/dal/courses";

export default async function CoursesPage() {
  // Fetch via Prisma DAL (Architecture DDD)
  const courses = await getCoursesWithDetails();

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
      </div>
    </div>
  );
}
