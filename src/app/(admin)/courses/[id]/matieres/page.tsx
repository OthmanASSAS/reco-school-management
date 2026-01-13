// /Users/oassas/Projets/inscription-app/src/app/(admin)/courses/[id]/matieres/page.tsx
import { SubjectsManager } from "../../components/SubjectsManager";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Settings } from "lucide-react";
import Link from "next/link";
import { getCourseForSubjects, getCourseSubjects, getAllCoursesMini } from "@/lib/dal/subjects";

export const dynamic = "force-dynamic";

export default async function CourseSubjectsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Charger les données via Prisma DAL
  const course = await getCourseForSubjects(id);
  const subjects = await getCourseSubjects(id);
  const allCourses = await getAllCoursesMini();

  if (!course) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          <h1 className="text-2xl font-bold mb-4">Cours non trouvé</h1>
          <p>Le cours demandé n&apos;existe pas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/courses" className="hover:text-gray-700 transition-colors">
            Cours
          </Link>
          <ChevronLeft className="h-4 w-4" />
          <Link href={`/courses/${id}`} className="hover:text-gray-700 transition-colors">
            {course.name}
          </Link>
          <ChevronLeft className="h-4 w-4" />
          <span className="text-gray-900 font-medium">Matières</span>
        </nav>

        {/* Header avec actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des matières</h1>
              <p className="text-gray-600 mt-2">
                Configurez les matières enseignées dans le cours &quot;{course.name}&quot;
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span>Type: {course.type}</span>
                <span>•</span>
                <span>Catégorie: {course.category}</span>
                <span>•</span>
                <span>{subjects?.length || 0} matière(s) configurée(s)</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/courses/${id}`}>
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Modifier le cours</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Gestionnaire de matières */}
        <SubjectsManager courseId={id} subjects={subjects || []} allCourses={allCourses || []} />
      </div>
    </div>
  );
}
