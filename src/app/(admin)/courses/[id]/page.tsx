// [id]/page.tsx
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { getCoursesWithDetail } from "../actions/actions";
import CourseFormWrapper from "../components/CourseFormWrapper";

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const courses = await getCoursesWithDetail();
  const course = courses.find(c => c.id === id);

  if (!course) {
    return (
      <main className="p-6">
        <div className="text-center text-gray-500">
          <h1 className="text-2xl font-bold mb-4">Cours non trouvé</h1>
          <p>Le cours demandé n&apos;existe pas.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header avec navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Modifier le cours</h1>
              <p className="text-gray-600 mt-2">{course.name}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href={`/admin/courses/${id}/matieres`}>
                <Button variant="outline" className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Gérer les matières</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Formulaire de modification */}
        <CourseFormWrapper course={course} />
      </div>
    </main>
  );
}
