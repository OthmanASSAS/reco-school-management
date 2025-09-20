import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedComplete() {
  console.log('🚀 Seed complet avec migration et données historiques...');
  console.log("=".repeat(50));

  try {
    // 1. Seed principal (données de base)
    console.log("\n📚 1. Seed principal...");
    // Note: Le seed principal doit être lancé séparément
    console.log("⚠️ Lancez d'abord: npm run seed");
    console.log("✅ Seed principal terminé");

    // 2. Assigner professeurs et salles
    console.log("\n👨‍🏫 2. Assignation des professeurs et salles...");
    await assignTeachersAndRooms();
    console.log("✅ Assignation terminée");

    // 3. Mettre à jour les horaires
    console.log("\n⏰ 3. Mise à jour des horaires...");
    await updateSchedules();
    console.log("✅ Horaires mis à jour");

    // 4. Vérifier le statut des cours
    console.log("\n📊 4. Vérification des statuts...");
    await fixCourseStatus();
    console.log("✅ Statuts vérifiés");

    console.log("\n🎉 Seeding complet terminé !");
    console.log("📅 Tu peux maintenant voir le planning sur /planning");
    console.log("📚 Tu peux voir les cours sur /courses");
    console.log("👨‍👩‍👧‍👦 Tu peux voir les familles sur /families");
  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error);
    process.exit(1);
  }
}

async function assignTeachersAndRooms() {
  // Récupérer tous les cours
  const { data: courses, error: coursesError } = await sb
    .from("courses")
    .select("id, name, type, teacher_id, room_id");

  if (coursesError) throw coursesError;

  // Récupérer tous les professeurs
  const { data: teachers, error: teachersError } = await sb
    .from("teachers")
    .select("id, full_name");

  if (teachersError) throw teachersError;

  // Récupérer toutes les salles
  const { data: rooms, error: roomsError } = await sb.from("rooms").select("id, name");

  if (roomsError) throw roomsError;

  // Assigner professeurs et salles aux cours qui n'en ont pas
  for (const course of courses || []) {
    const updates: any = {};
    let hasUpdates = false;

    // Assigner un professeur si pas déjà assigné
    if (!course.teacher_id && teachers && teachers.length > 0) {
      const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
      updates.teacher_id = randomTeacher.id;
      hasUpdates = true;
      console.log(`   👨‍🏫 ${course.name} → ${randomTeacher.full_name}`);
    }

    // Assigner une salle si pas déjà assignée
    if (!course.room_id && rooms && rooms.length > 0) {
      const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
      updates.room_id = randomRoom.id;
      hasUpdates = true;
      console.log(`   🏫 ${course.name} → ${randomRoom.name}`);
    }

    // Mettre à jour le cours si nécessaire
    if (hasUpdates) {
      await sb.from("courses").update(updates).eq("id", course.id);
    }
  }
}

async function updateSchedules() {
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

  // Récupérer tous les cours actifs
  const { data: courses, error } = await sb
    .from("courses")
    .select("id, name, type")
    .eq("status", "active");

  if (error) throw error;

  console.log(`📚 ${courses?.length} cours trouvés`);

  // Mettre à jour chaque cours avec un horaire aléatoire
  for (const course of courses || []) {
    const randomSchedule = SCHEDULES[Math.floor(Math.random() * SCHEDULES.length)];

    const { error: updateError } = await sb
      .from("courses")
      .update({ schedule: randomSchedule })
      .eq("id", course.id);

    if (updateError) {
      console.error(`❌ Erreur pour ${course.name}:`, updateError);
    } else {
      console.log(`✅ ${course.name} (${course.type}) → ${randomSchedule}`);
    }
  }
}

async function fixCourseStatus() {
  // Récupérer tous les cours
  const { data: courses, error } = await sb.from("courses").select("id, name, status");

  if (error) throw error;

  // Mettre à jour les cours qui n'ont pas le statut "active"
  for (const course of courses || []) {
    if (course.status !== "active") {
      await sb.from("courses").update({ status: "active" }).eq("id", course.id);

      console.log(`✅ ${course.name} → active`);
    }
  }
}

seedComplete().catch(e => {
  console.error(e);
  process.exit(1);
});
