import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;
const sb = createClient(supabaseUrl, supabaseServiceKey);

async function testGradesLoading() {
  console.log("🧪 Test du chargement des notes...");

  // 1. Récupérer les données de test
  const { data: schoolYears } = await sb.from("school_years").select("id, label").limit(1);

  const { data: subjects } = await sb.from("subjects").select("id, name, course_id").limit(1);

  const { data: students } = await sb.from("students").select("id, first_name, last_name").limit(3);

  if (!schoolYears?.[0] || !subjects?.[0]) {
    console.log("❌ Données de test insuffisantes");
    return;
  }

  const testSchoolYear = schoolYears[0];
  const testSubject = subjects[0];

  console.log(`\n📋 Données de test:`);
  console.log(`   Année scolaire: ${testSchoolYear.label} (${testSchoolYear.id})`);
  console.log(`   Matière: ${testSubject.name} (${testSubject.id})`);
  console.log(`   Étudiants: ${students?.length || 0}`);

  // 2. Tester la récupération des notes
  console.log(`\n🔍 Test de récupération des notes pour:`);
  console.log(`   Matière: ${testSubject.name}`);
  console.log(`   Période: semaine - Semaine 1`);
  console.log(`   Année: ${testSchoolYear.label}`);

  const { data: grades, error } = await sb
    .from("grades")
    .select("id, student_id, score, comments, evaluation_date")
    .eq("subject_id", testSubject.id)
    .eq("period_type", "semaine")
    .eq("period_value", "Semaine 1")
    .eq("school_year_id", testSchoolYear.id);

  if (error) {
    console.error("❌ Erreur lors de la récupération:", error);
    return;
  }

  console.log(`\n✅ Résultats:`);
  console.log(`   ${grades?.length || 0} note(s) trouvée(s)`);

  if (grades && grades.length > 0) {
    grades.forEach((grade, index) => {
      const student = students?.find(s => s.id === grade.student_id);
      console.log(`\n   ${index + 1}. ${student?.first_name} ${student?.last_name}:`);
      console.log(`      Score: ${grade.score}/20`);
      console.log(`      Commentaire: ${grade.comments || "Aucun"}`);
      console.log(`      Date: ${grade.evaluation_date}`);
    });
  } else {
    console.log("   ⚠️  Aucune note trouvée pour cette combinaison");
  }

  // 3. Tester avec les données de Mohammed Cherkaoui
  console.log(`\n🔍 Test spécifique pour Mohammed Cherkaoui:`);

  const { data: mohammedGrades } = await sb
    .from("grades")
    .select("id, score, comments, evaluation_date, period_type, period_value")
    .eq("student_id", "3f21d7f4-c048-47a7-b39b-14a6cffa48fc")
    .eq("subject_id", "6d10804c-4b8d-419b-99df-39bad09d79ab")
    .eq("period_type", "semaine")
    .eq("period_value", "Semaine 1");

  if (mohammedGrades && mohammedGrades.length > 0) {
    console.log("✅ Note trouvée pour Mohammed:");
    mohammedGrades.forEach(grade => {
      console.log(`   Score: ${grade.score}/20`);
      console.log(`   Commentaire: ${grade.comments || "Aucun"}`);
      console.log(`   Période: ${grade.period_type} - ${grade.period_value}`);
      console.log(`   Date: ${grade.evaluation_date}`);
    });
  } else {
    console.log("❌ Aucune note trouvée pour Mohammed avec ces critères");
  }

  console.log(`\n🎯 URLs de test:`);
  console.log(`   Page grades: http://localhost:3001/grades`);
  console.log(`   Sélectionner: 2025-2026, Arabe 1, Semaine, Semaine 1`);
  console.log(`   Ouvrir la matière "Lecture"`);

  console.log(`\n✅ Test terminé !`);
}

testGradesLoading().catch(e => {
  console.error("❌ Erreur lors du test:", e);
  process.exit(1);
});
