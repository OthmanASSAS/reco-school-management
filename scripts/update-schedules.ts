// scripts/update-schedules.ts - Mise à jour des horaires pour le planning
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;
const sb = createClient(supabaseUrl, supabaseServiceKey);

// Horaires réalistes pour une école arabe/coran
const SCHEDULES = [
  "Lundi 09:00-11:00",
  "Lundi 14:00-16:00",
  "Lundi 16:00-18:00",
  "Mardi 09:00-11:00",
  "Mardi 14:00-16:00",
  "Mardi 16:00-18:00",
  "Mercredi 09:00-11:00",
  "Mercredi 14:00-16:00",
  "Mercredi 16:00-18:00",
  "Jeudi 09:00-11:00",
  "Jeudi 14:00-16:00",
  "Jeudi 16:00-18:00",
  "Vendredi 09:00-11:00",
  "Vendredi 14:00-16:00",
  "Vendredi 16:00-18:00",
  "Samedi 09:00-11:00",
  "Samedi 14:00-16:00",
  "Samedi 16:00-18:00",
];

async function updateSchedules() {
  console.log("🔄 Mise à jour des horaires pour le planning...");

  try {
    // Récupérer tous les cours actifs
    const { data: courses, error } = await sb
      .from("courses")
      .select("id, name, type")
      .eq("status", "active");

    if (error) {
      console.error("❌ Erreur lors de la récupération des cours:", error);
      return;
    }

    console.log(`📚 ${courses?.length} cours trouvés`);

    // Mettre à jour chaque cours avec un horaire aléatoire
    for (const course of courses || []) {
      const randomSchedule = SCHEDULES[Math.floor(Math.random() * SCHEDULES.length)];

      const { error: updateError } = await sb
        .from("courses")
        .update({ schedule: randomSchedule })
        .eq("id", course.id);

      if (updateError) {
        console.error(`❌ Erreur lors de la mise à jour du cours ${course.name}:`, updateError);
      } else {
        console.log(`✅ ${course.name} (${course.type}) → ${randomSchedule}`);
      }
    }

    console.log("🎉 Mise à jour des horaires terminée !");
    console.log("📅 Vous pouvez maintenant voir le planning sur /planning");
  } catch (error) {
    console.error("💥 Erreur critique:", error);
  }
}

updateSchedules().catch(e => {
  console.error(e);
  process.exit(1);
});
