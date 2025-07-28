// scripts/check-rooms.ts - Vérifier l'état des salles et cours
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;
const sb = createClient(supabaseUrl, supabaseServiceKey);

async function checkRooms() {
  console.log("🔍 Vérification des salles et cours...");

  try {
    // Récupérer toutes les salles
    const { data: rooms, error: roomsError } = await sb.from("rooms").select("id, name");

    if (roomsError) {
      console.error("❌ Erreur lors de la récupération des salles:", roomsError);
      return;
    }

    console.log(`🏫 ${rooms?.length} salles trouvées:`);
    rooms?.forEach(room => {
      console.log(`   - ${room.name} (${room.id})`);
    });

    // Récupérer tous les cours avec leurs salles
    const { data: courses, error: coursesError } = await sb.from("courses").select(`
        id, name, status, schedule, room_id,
        rooms(id, name)
      `);

    if (coursesError) {
      console.error("❌ Erreur lors de la récupération des cours:", coursesError);
      return;
    }

    console.log(`\n📚 ${courses?.length} cours trouvés:`);
    courses?.forEach(course => {
      console.log(`   - ${course.name}:`);
      console.log(`     Status: ${course.status}`);
      console.log(`     Schedule: "${course.schedule}"`);
      console.log(`     Room ID: ${course.room_id || "null"}`);
      console.log(`     Room Name: ${(course.rooms as any)?.name || "Non assignée"}`);
    });

    // Compter les cours par salle
    const roomCounts = courses?.reduce(
      (acc, course) => {
        const roomName = (course.rooms as any)?.name || "Non assignée";
        acc[roomName] = (acc[roomName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log(`\n📊 Répartition par salle:`);
    Object.entries(roomCounts || {}).forEach(([room, count]) => {
      console.log(`   - ${room}: ${count} cours`);
    });
  } catch (error) {
    console.error("💥 Erreur critique:", error);
  }
}

checkRooms().catch(e => {
  console.error(e);
  process.exit(1);
});
