import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;
const sb = createClient(supabaseUrl, supabaseServiceKey);

async function checkData() {
  console.log("🔍 Vérification des données dans la base...");

  // Vérifier les matières
  const { data: subjects, error: subjectsError } = await sb
    .from("subjects")
    .select("id, name, course_id");

  if (subjectsError) {
    console.error("❌ Erreur lors de la récupération des matières:", subjectsError);
  } else {
    console.log(`✅ ${subjects?.length || 0} matières trouvées`);
    if (subjects && subjects.length > 0) {
      console.log("📋 Exemples de matières:");
      subjects.slice(0, 5).forEach(subject => {
        console.log(`   - ${subject.name} (course_id: ${subject.course_id})`);
      });
    }
  }

  // Vérifier les cours
  const { data: courses, error: coursesError } = await sb.from("courses").select("id, name");

  if (coursesError) {
    console.error("❌ Erreur lors de la récupération des cours:", coursesError);
  } else {
    console.log(`✅ ${courses?.length || 0} cours trouvés`);
    if (courses && courses.length > 0) {
      console.log("📋 Exemples de cours:");
      courses.slice(0, 5).forEach(course => {
        console.log(`   - ${course.name} (id: ${course.id})`);
      });
    }
  }

  // Vérifier les étudiants
  const { data: students, error: studentsError } = await sb
    .from("students")
    .select("id, first_name, last_name");

  if (studentsError) {
    console.error("❌ Erreur lors de la récupération des étudiants:", studentsError);
  } else {
    console.log(`✅ ${students?.length || 0} étudiants trouvés`);
  }

  // Vérifier les années scolaires
  const { data: schoolYears, error: schoolYearsError } = await sb
    .from("school_years")
    .select("id, label");

  if (schoolYearsError) {
    console.error("❌ Erreur lors de la récupération des années scolaires:", schoolYearsError);
  } else {
    console.log(`✅ ${schoolYears?.length || 0} années scolaires trouvées`);
  }

  // Vérifier les notes
  const { data: grades, error: gradesError } = await sb
    .from("grades")
    .select("id, score, student_id, subject_id");

  if (gradesError) {
    console.error("❌ Erreur lors de la récupération des notes:", gradesError);
  } else {
    console.log(`✅ ${grades?.length || 0} notes trouvées`);
  }

  // Test de liaison matières-cours
  if (subjects && courses) {
    console.log("\n🔗 Test de liaison matières-cours:");
    const courseIds = courses.map(c => c.id);
    const subjectsWithValidCourse = subjects.filter(s => courseIds.includes(s.course_id));
    console.log(
      `   ${subjectsWithValidCourse.length}/${subjects.length} matières ont un cours valide`
    );
  }
}

checkData().catch(e => {
  console.error(e);
  process.exit(1);
});
