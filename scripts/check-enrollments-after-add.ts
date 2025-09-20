import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkEnrollments() {
  console.log("🔍 Vérification des enrollments...\n");

  // 1. Vérifier les étudiants récents
  const { data: recentStudents, error: studentsError } = await supabase
    .from("students")
    .select(
      `
      id,
      first_name,
      last_name,
      family_id,
      created_at
    `
    )
    .order("created_at", { ascending: false })
    .limit(5);

  if (studentsError) {
    console.error("❌ Erreur récupération étudiants:", studentsError);
    return;
  }

  console.log("📚 Étudiants récents:");
  recentStudents?.forEach(student => {
    console.log(`   - ${student.first_name} ${student.last_name} (ID: ${student.id})`);
  });

  // 2. Vérifier les enrollments pour chaque étudiant
  for (const student of recentStudents || []) {
    console.log(`\n🔗 Enrollments pour ${student.first_name} ${student.last_name}:`);

    const { data: enrollments, error: enrollmentsError } = await supabase
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
      .eq("student_id", student.id);

    if (enrollmentsError) {
      console.error(`   ❌ Erreur enrollments pour ${student.first_name}:`, enrollmentsError);
      continue;
    }

    if (!enrollments || enrollments.length === 0) {
      console.log(`   ⚠️  Aucun enrollment trouvé pour ${student.first_name}`);
    } else {
      enrollments.forEach(enrollment => {
        const course = enrollment.courses;
        console.log(`   ✅ Enrollment ${enrollment.id}:`);
        const courseName = Array.isArray(course)
          ? course[0]?.name || course[0]?.label
          : course?.name || course?.label;
        console.log(`      - Cours: ${courseName || "Inconnu"} (ID: ${enrollment.course_id})`);
        console.log(`      - Statut: ${enrollment.status}`);
        console.log(`      - Date début: ${enrollment.start_date}`);
      });
    }
  }

  // 3. Vérifier les familles avec leurs étudiants et enrollments
  console.log("\n🏠 Familles avec étudiants et enrollments:");
  const { data: families, error: familiesError } = await supabase
    .from("families")
    .select(
      `
      id,
      first_name,
      last_name,
      students(
        id,
        first_name,
        last_name,
        enrollments(
          id,
          course_id,
          status,
          courses(
            id,
            name,
            label
          )
        )
      )
    `
    )
    .order("last_name", { ascending: true })
    .limit(3);

  if (familiesError) {
    console.error("❌ Erreur récupération familles:", familiesError);
    return;
  }

  families?.forEach(family => {
    console.log(`\n👨‍👩‍👧‍👦 Famille ${family.first_name} ${family.last_name}:`);
    family.students?.forEach(student => {
      console.log(`   👤 ${student.first_name} ${student.last_name}:`);
      if (student.enrollments && student.enrollments.length > 0) {
        student.enrollments.forEach(enrollment => {
          const course = enrollment.courses;
          console.log(`      📚 ${course?.name || course?.label || "Cours inconnu"}`);
        });
      } else {
        console.log(`      ⚠️  Aucun cours inscrit`);
      }
    });
  });
}

checkEnrollments().catch(console.error);
