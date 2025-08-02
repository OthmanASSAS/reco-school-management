import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;
const sb = createClient(supabaseUrl, supabaseServiceKey);

async function checkGrades() {
  console.log("📊 Vérification des notes dans la base...");

  // 1. Vérifier le nombre total de notes
  const { data: allGrades, error: gradesError } = await sb
    .from("grades")
    .select(
      "id, score, student_id, subject_id, period_type, period_value, comments, evaluation_date"
    );

  if (gradesError) {
    console.error("❌ Erreur lors de la récupération des notes:", gradesError);
    return;
  }

  console.log(`✅ ${allGrades?.length || 0} notes trouvées dans la base`);

  if (allGrades && allGrades.length > 0) {
    console.log("\n📋 Dernières notes ajoutées:");

    // Trier par date de création (les plus récentes en premier)
    const recentGrades = allGrades
      .sort((a, b) => new Date(b.evaluation_date).getTime() - new Date(a.evaluation_date).getTime())
      .slice(0, 5);

    recentGrades.forEach((grade, index) => {
      console.log(`\n${index + 1}. Note ID: ${grade.id}`);
      console.log(`   Score: ${grade.score}/20`);
      console.log(`   Période: ${grade.period_type} - ${grade.period_value}`);
      console.log(`   Date: ${grade.evaluation_date}`);
      console.log(`   Commentaire: ${grade.comments || "Aucun"}`);
      console.log(`   Student ID: ${grade.student_id}`);
      console.log(`   Subject ID: ${grade.subject_id}`);
    });

    // 2. Vérifier les matières avec des notes
    const { data: subjectsWithGrades } = await sb.from("subjects").select(`
        id, name, course_id,
        grades(id, score, student_id, period_type, period_value)
      `);

    if (subjectsWithGrades) {
      console.log("\n📚 Matières avec des notes:");
      subjectsWithGrades.forEach(subject => {
        if (subject.grades && subject.grades.length > 0) {
          console.log(`\n   ${subject.name}:`);
          console.log(`     ${subject.grades.length} note(s)`);
          subject.grades.forEach((grade: any) => {
            console.log(`     - ${grade.score}/20 (${grade.period_type} ${grade.period_value})`);
          });
        }
      });
    }

    // 3. Vérifier les étudiants avec des notes
    const { data: studentsWithGrades } = await sb.from("students").select(`
        id, first_name, last_name,
        grades(id, score, subject_id, period_type, period_value)
      `);

    if (studentsWithGrades) {
      console.log("\n👥 Étudiants avec des notes:");
      studentsWithGrades.forEach(student => {
        if (student.grades && student.grades.length > 0) {
          console.log(`\n   ${student.first_name} ${student.last_name}:`);
          console.log(`     ${student.grades.length} note(s)`);
          student.grades.forEach((grade: any) => {
            console.log(`     - ${grade.score}/20 (${grade.period_type} ${grade.period_value})`);
          });
        }
      });
    }
  } else {
    console.log("⚠️  Aucune note trouvée dans la base");
  }

  // 4. Vérifier la structure de la table grades
  console.log("\n🔍 Structure de la table grades:");
  console.log("   - id: UUID (clé primaire)");
  console.log("   - student_id: UUID (référence vers students)");
  console.log("   - subject_id: UUID (référence vers subjects)");
  console.log("   - score: INTEGER (0-20)");
  console.log("   - coefficient: INTEGER (défaut: 1)");
  console.log("   - period_type: TEXT (semaine, mois, etc.)");
  console.log("   - period_value: TEXT (Semaine 1, Janvier, etc.)");
  console.log("   - school_year_id: UUID (référence vers school_years)");
  console.log("   - comments: TEXT (optionnel)");
  console.log("   - evaluation_date: DATE");

  console.log("\n✅ Vérification terminée !");
}

checkGrades().catch(e => {
  console.error("❌ Erreur lors de la vérification:", e);
  process.exit(1);
});
