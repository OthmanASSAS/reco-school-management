// scripts/fix-course-status.ts - Vérifier et corriger les statuts des cours
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;
const sb = createClient(supabaseUrl, supabaseServiceKey);

async function fixCourseStatus() {
  console.log("🔍 Vérification des statuts des cours...");

  try {
    // Récupérer tous les cours
    const { data: courses, error } = await sb.from("courses").select("id, name, status, schedule");

    if (error) {
      console.error("❌ Erreur lors de la récupération des cours:", error);
      return;
    }

    console.log(`📚 ${courses?.length} cours trouvés`);
    console.log("\n📋 Détails des cours :");

    courses?.forEach((course, index) => {
      console.log(`\n${index + 1}. ${course.name}`);
      console.log(`   Status: ${course.status}`);
      console.log(`   Schedule: "${course.schedule}"`);
    });

    // Compter les cours par statut
    const statusCounts = courses?.reduce(
      (acc, course) => {
        acc[course.status] = (acc[course.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log(`\n📊 Répartition par statut :`);
    Object.entries(statusCounts || {}).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count} cours`);
    });

    // Mettre à jour les cours qui n'ont pas le statut "active"
    const coursesToUpdate = courses?.filter(course => course.status !== "active");

    if (coursesToUpdate && coursesToUpdate.length > 0) {
      console.log(`\n🔄 Mise à jour de ${coursesToUpdate.length} cours vers le statut "active"...`);

      for (const course of coursesToUpdate) {
        const { error: updateError } = await sb
          .from("courses")
          .update({ status: "active" })
          .eq("id", course.id);

        if (updateError) {
          console.error(`❌ Erreur lors de la mise à jour de ${course.name}:`, updateError);
        } else {
          console.log(`✅ ${course.name} → active`);
        }
      }

      console.log("🎉 Mise à jour terminée !");
    } else {
      console.log("✅ Tous les cours sont déjà au statut 'active'");
    }
  } catch (error) {
    console.error("💥 Erreur critique:", error);
  }
}

fixCourseStatus().catch(e => {
  console.error(e);
  process.exit(1);
});
