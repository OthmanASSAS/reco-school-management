// scripts/assign-teachers-rooms.ts - Assignation des professeurs et salles
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;
const sb = createClient(supabaseUrl, supabaseServiceKey);

async function assignTeachersAndRooms() {
  console.log("🔄 Assignation des professeurs et salles...");

  try {
    // Récupérer tous les cours
    const { data: courses, error: coursesError } = await sb
      .from("courses")
      .select("id, name, type, teacher_id, room_id");

    if (coursesError) {
      console.error("❌ Erreur lors de la récupération des cours:", coursesError);
      return;
    }

    // Récupérer tous les professeurs
    const { data: teachers, error: teachersError } = await sb
      .from("teachers")
      .select("id, full_name");

    if (teachersError) {
      console.error("❌ Erreur lors de la récupération des professeurs:", teachersError);
      return;
    }

    // Récupérer toutes les salles
    const { data: rooms, error: roomsError } = await sb.from("rooms").select("id, name");

    if (roomsError) {
      console.error("❌ Erreur lors de la récupération des salles:", roomsError);
      return;
    }

    console.log(`📚 ${courses?.length} cours trouvés`);
    console.log(`👨‍🏫 ${teachers?.length} professeurs trouvés`);
    console.log(`🏫 ${rooms?.length} salles trouvées`);

    // Assigner professeurs et salles aux cours qui n'en ont pas
    for (const course of courses || []) {
      const updates: any = {};
      let hasUpdates = false;

      console.log(`\n🔍 Traitement de ${course.name}:`);
      console.log(`   - Teacher ID actuel: ${course.teacher_id || "null"}`);
      console.log(`   - Room ID actuel: ${course.room_id || "null"}`);

      // Assigner un professeur si pas déjà assigné
      if (!course.teacher_id && teachers && teachers.length > 0) {
        const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
        updates.teacher_id = randomTeacher.id;
        hasUpdates = true;
        console.log(
          `   👨‍🏫 Assignation: ${course.name} → ${randomTeacher.full_name} (${randomTeacher.id})`
        );
      } else if (course.teacher_id) {
        console.log(`   ✅ Professeur déjà assigné`);
      }

      // Assigner une salle si pas déjà assignée
      if (!course.room_id && rooms && rooms.length > 0) {
        const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
        updates.room_id = randomRoom.id;
        hasUpdates = true;
        console.log(`   🏫 Assignation: ${course.name} → ${randomRoom.name} (${randomRoom.id})`);
      } else if (course.room_id) {
        console.log(`   ✅ Salle déjà assignée`);
      }

      // Mettre à jour le cours si nécessaire
      if (hasUpdates) {
        console.log(`   📝 Mise à jour avec:`, updates);
        const { error: updateError } = await sb.from("courses").update(updates).eq("id", course.id);

        if (updateError) {
          console.error(`   ❌ Erreur lors de la mise à jour:`, updateError);
        } else {
          console.log(`   ✅ Mise à jour réussie`);
        }
      } else {
        console.log(`   ⏭️ Aucune mise à jour nécessaire`);
      }
    }

    console.log("🎉 Assignation terminée !");
    console.log("📅 Vous pouvez maintenant voir le planning complet sur /planning");
  } catch (error) {
    console.error("💥 Erreur critique:", error);
  }
}

assignTeachersAndRooms().catch(e => {
  console.error(e);
  process.exit(1);
});
