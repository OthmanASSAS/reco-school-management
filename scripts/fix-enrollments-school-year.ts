import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function fixEnrollmentsSchoolYear() {
  console.log("🔧 FIX - Assignation d'année scolaire aux enrollments");
  console.log("=".repeat(60));

  try {
    // 1. Récupérer l'année scolaire courante (2025-2026)
    const { data: schoolYears, error: schoolYearsError } = await supabase
      .from("school_years")
      .select("*")
      .order("start_date", { ascending: false })
      .limit(1);

    if (schoolYearsError || !schoolYears || schoolYears.length === 0) {
      console.error("❌ Erreur lors de la récupération des années scolaires:", schoolYearsError);
      return;
    }

    const currentSchoolYear = schoolYears[0];
    console.log(
      `📅 Année scolaire courante: ${currentSchoolYear.label || `${new Date(currentSchoolYear.start_date).getFullYear()}-${new Date(currentSchoolYear.end_date).getFullYear()}`}`
    );
    console.log(`🆔 ID: ${currentSchoolYear.id}`);
    console.log("");

    // 2. Récupérer tous les enrollments sans school_year_id
    const { data: enrollmentsWithoutYear, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("id, course_id, student_id, status, school_year_id")
      .is("school_year_id", null);

    if (enrollmentsError) {
      console.error("❌ Erreur lors de la récupération des enrollments:", enrollmentsError);
      return;
    }

    console.log(
      `📋 ${enrollmentsWithoutYear?.length || 0} enrollment(s) sans année scolaire trouvé(s)`
    );
    console.log("");

    if (!enrollmentsWithoutYear || enrollmentsWithoutYear.length === 0) {
      console.log("✅ Tous les enrollments ont déjà une année scolaire assignée !");
      return;
    }

    // 3. Afficher les enrollments à corriger
    console.log("🔧 Enrollments à corriger :");
    for (const enrollment of enrollmentsWithoutYear) {
      console.log(`   📚 Enrollment ID: ${enrollment.id}`);
      console.log(`      🎓 Course ID: ${enrollment.course_id}`);
      console.log(`      👤 Student ID: ${enrollment.student_id}`);
      console.log(`      📊 Statut: ${enrollment.status}`);
      console.log("");
    }

    // 4. Demander confirmation
    console.log("⚠️  Voulez-vous assigner l'année scolaire courante à ces enrollments ?");
    console.log("   Cela affectera les données affichées dans les modales de paiement.");
    console.log("");
    console.log('   Pour continuer, relancez le script avec l\'argument "confirm"');
    console.log("   npm run fix-enrollments confirm");
    console.log("");

    const args = process.argv.slice(2);
    if (args[0] === "confirm") {
      console.log("🔄 Mise à jour des enrollments...");

      let updatedCount = 0;
      let errorCount = 0;

      for (const enrollment of enrollmentsWithoutYear) {
        const { error: updateError } = await supabase
          .from("enrollments")
          .update({ school_year_id: currentSchoolYear.id })
          .eq("id", enrollment.id);

        if (updateError) {
          console.error(
            `❌ Erreur lors de la mise à jour de l'enrollment ${enrollment.id}:`,
            updateError
          );
          errorCount++;
        } else {
          console.log(`✅ Enrollment ${enrollment.id} mis à jour`);
          updatedCount++;
        }
      }

      console.log("");
      console.log("📊 Résumé :");
      console.log(`   ✅ ${updatedCount} enrollment(s) mis à jour`);
      console.log(`   ❌ ${errorCount} erreur(s)`);
      console.log("");
      console.log("🎉 Correction terminée !");
      console.log("   Les modales de paiement devraient maintenant afficher les mêmes données.");
    }
  } catch (error) {
    console.error("❌ Erreur générale:", error);
  }
}

// Fonction pour vérifier l'état actuel
async function checkEnrollmentsStatus() {
  console.log("🔍 VÉRIFICATION - État des enrollments");
  console.log("=".repeat(50));

  try {
    // Récupérer tous les enrollments avec leurs années scolaires
    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select(
        `
        id,
        course_id,
        student_id,
        status,
        school_year_id,
        courses(name, label),
        students(first_name, last_name),
        school_years(label, start_date, end_date)
      `
      )
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("❌ Erreur lors de la récupération des enrollments:", error);
      return;
    }

    console.log(`${enrollments?.length || 0} enrollment(s) trouvé(s) (limite: 20)`);
    console.log("");

    let withYear = 0;
    let withoutYear = 0;

    for (const enrollment of enrollments || []) {
      const course = enrollment.courses as any;
      const student = enrollment.students as any;
      const schoolYear = enrollment.school_years as any;

      console.log(`📚 ${course?.label || course?.name || "Cours inconnu"}`);
      console.log(`   👤 ${student?.first_name} ${student?.last_name}`);
      console.log(`   📅 Année: ${schoolYear?.label || "Non définie"}`);
      console.log(`   📊 Statut: ${enrollment.status}`);
      console.log(`   🆔 ID: ${enrollment.id}`);
      console.log("");

      if (enrollment.school_year_id) {
        withYear++;
      } else {
        withoutYear++;
      }
    }

    console.log("📊 Statistiques :");
    console.log(`   ✅ Avec année scolaire: ${withYear}`);
    console.log(`   ❌ Sans année scolaire: ${withoutYear}`);
    console.log(`   📊 Total: ${enrollments?.length || 0}`);
  } catch (error) {
    console.error("❌ Erreur générale:", error);
  }
}

// Fonction principale
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "check":
      await checkEnrollmentsStatus();
      break;
    case "fix":
    case "confirm":
      await fixEnrollmentsSchoolYear();
      break;
    default:
      console.log("Usage:");
      console.log("  npm run fix-enrollments check    - Vérifier l'état des enrollments");
      console.log("  npm run fix-enrollments fix      - Corriger les enrollments (mode preview)");
      console.log("  npm run fix-enrollments confirm  - Corriger les enrollments (mode exécution)");
      break;
  }
}

main().catch(console.error);
