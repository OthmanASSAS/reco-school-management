import { createClient } from "@/lib/supabase/server";
import { GradesPageWrapper } from "./components/GradesPageWrapper";
import { saveGrades } from "./actions/save-grades.server";

export default async function GradesPage() {
  const supabase = await createClient();

  // Fetch initial data for selectors (Server-side)
  const { data: schoolYears } = await supabase
    .from("school_years")
    .select("id, label, start_date, end_date");
  const { data: courses } = await supabase.from("courses").select("id, name");
  const { data: students } = await supabase.from("students").select("id, first_name, last_name");
  const { data: subjects } = await supabase.from("subjects").select("id, name, course_id");
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("student_id, course_id, school_year_id");

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
          courses={courses || []}
          subjects={subjects || []}
          students={students || []}
          schoolYears={schoolYears || []}
          enrollments={enrollments || []}
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
