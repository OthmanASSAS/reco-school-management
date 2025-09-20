import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function compareEnrollments() {
  console.log("🔍 Comparaison des enrollments anciens vs nouveaux...\n");

  // 1. Trouver un ancien enrollment (qui fonctionne)
  const { data: oldEnrollments, error: oldError } = await supabase
    .from("enrollments")
    .select(
      `
      id,
      student_id,
      course_id,
      status,
      start_date,
      created_at,
      courses(
        id,
        name,
        label,
        type
      )
    `
    )
    .order("created_at", { ascending: true })
    .limit(3);

  if (oldError) {
    console.error("❌ Erreur anciens enrollments:", oldError);
    return;
  }

  console.log("📚 Anciens enrollments (qui fonctionnent):");
  oldEnrollments?.forEach(enrollment => {
    const course = enrollment.courses;
    console.log(`   ✅ ${enrollment.id}:`);
    console.log(`      - Étudiant: ${enrollment.student_id}`);
    console.log(`      - Cours ID: ${enrollment.course_id}`);
    console.log(`      - Cours nom: ${course?.name || course?.label || "Inconnu"}`);
    console.log(`      - Statut: ${enrollment.status}`);
    console.log(`      - Créé: ${enrollment.created_at}`);
  });

  // 2. Trouver les nouveaux enrollments (qui ne fonctionnent pas)
  const { data: newEnrollments, error: newError } = await supabase
    .from("enrollments")
    .select(
      `
      id,
      student_id,
      course_id,
      status,
      start_date,
      created_at,
      courses(
        id,
        name,
        label,
        type
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(3);

  if (newError) {
    console.error("❌ Erreur nouveaux enrollments:", newError);
    return;
  }

  console.log("\n🆕 Nouveaux enrollments (qui ne fonctionnent pas):");
  newEnrollments?.forEach(enrollment => {
    const course = enrollment.courses;
    console.log(`   ❓ ${enrollment.id}:`);
    console.log(`      - Étudiant: ${enrollment.student_id}`);
    console.log(`      - Cours ID: ${enrollment.course_id}`);
    console.log(`      - Cours nom: ${course?.name || course?.label || "Inconnu"}`);
    console.log(`      - Statut: ${enrollment.status}`);
    console.log(`      - Créé: ${enrollment.created_at}`);
  });

  // 3. Comparer les structures
  console.log("\n🔍 Différences structurelles:");
  if (oldEnrollments && newEnrollments && oldEnrollments.length > 0 && newEnrollments.length > 0) {
    const old = oldEnrollments[0];
    const new_ = newEnrollments[0];

    console.log("   Ancien enrollment:");
    console.log(`      - course_id: ${old.course_id}`);
    console.log(`      - courses: ${JSON.stringify(old.courses)}`);

    console.log("   Nouveau enrollment:");
    console.log(`      - course_id: ${new_.course_id}`);
    console.log(`      - courses: ${JSON.stringify(new_.courses)}`);
  }
}

compareEnrollments().catch(console.error);
