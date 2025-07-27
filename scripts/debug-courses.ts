// scripts/debug-courses.ts - Debug des cours et horaires
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;
const sb = createClient(supabaseUrl, supabaseServiceKey);

async function debugCourses() {
  console.log("🔍 Debug des cours et horaires...");

  try {
    // Récupérer tous les cours avec leurs détails
    const { data: courses, error } = await sb.from("courses").select(`
        id, name, type, status, schedule, teacher_id, room_id,
        teachers(full_name), rooms(name)
      `);

    if (error) {
      console.error("❌ Erreur lors de la récupération des cours:", error);
      return;
    }

    console.log(`📚 ${courses?.length} cours trouvés`);
    console.log("\n📋 Détails des cours :");

    courses?.forEach((course, index) => {
      console.log(`\n${index + 1}. ${course.name} (${course.type})`);
      console.log(`   Status: ${course.status}`);
      console.log(`   Schedule: "${course.schedule}"`);
      console.log(`   Teacher: ${course.teachers?.[0]?.full_name || "Non assigné"}`);
      console.log(`   Room: ${course.rooms?.[0]?.name || "Non assignée"}`);

      // Tester le parsing du schedule
      if (course.schedule) {
        const scheduleMatch = course.schedule.match(/(\w+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
        if (scheduleMatch) {
          console.log(
            `   ✅ Schedule parsé: ${scheduleMatch[1]} ${scheduleMatch[2]}-${scheduleMatch[3]}`
          );
        } else {
          console.log(`   ❌ Schedule non parsé: "${course.schedule}"`);
        }
      } else {
        console.log(`   ❌ Pas de schedule`);
      }
    });

    // Compter les cours avec schedule et status active
    const activeCoursesWithSchedule = courses?.filter(
      c =>
        c.status === "active" &&
        c.schedule &&
        c.schedule.match(/(\w+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/)
    );

    console.log(`\n📊 Résumé :`);
    console.log(`   - Total cours: ${courses?.length}`);
    console.log(`   - Cours actifs: ${courses?.filter(c => c.status === "active").length}`);
    console.log(`   - Cours avec schedule: ${courses?.filter(c => c.schedule).length}`);
    console.log(`   - Cours actifs avec schedule parsé: ${activeCoursesWithSchedule?.length}`);
  } catch (error) {
    console.error("💥 Erreur critique:", error);
  }
}

debugCourses().catch(e => {
  console.error(e);
  process.exit(1);
});
