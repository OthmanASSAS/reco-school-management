// /Users/oassas/Projets/inscription-app/src/app/(admin)/grades/page.tsx
import { GradesPageWrapper } from "./components/GradesPageWrapper";
import { saveGrades } from "./actions/save-grades.server";
import { getGradesInitialData } from "@/lib/dal/grades";

export default async function GradesPage() {
  // Chargement ultra-rapide et typé via Prisma DAL
  // Remplace les multiples appels supabase.from().select()
  const { schoolYears, courses, students, subjects, enrollments } = await getGradesInitialData();

  return (
    <div className="w-full p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Notes</h1>
          <p className="text-gray-600 mt-2">
            Saisissez les notes par matière avec une interface optimisée pour les professeurs.
          </p>
        </div>

        <GradesPageWrapper
          courses={courses}
          subjects={subjects}
          students={students}
          schoolYears={schoolYears as any}
          enrollments={enrollments}
          onSaveGrades={async (subjectId, grades, periodType, periodValue, schoolYearId) => {
            "use server";
            if (!schoolYearId) {
              throw new Error("Aucune année scolaire sélectionnée");
            }
            return await saveGrades(subjectId, grades, periodType, periodValue, schoolYearId);
          }}
        />
      </div>
    </div>
  );
}
