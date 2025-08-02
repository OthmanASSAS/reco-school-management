import { createClient } from "@supabase/supabase-js";

async function checkEnrollments() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  console.log("🔍 Vérification des inscriptions...\n");

  // Récupérer tous les étudiants avec leurs inscriptions
  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select(
      `
      id,
      first_name,
      last_name,
      enrollments (
        id,
        status,
        start_date,
        end_date,
        course_id,
        school_year_id,
        courses (
          id,
          name,
          type
        ),
        school_years (
          id,
          start_date,
          end_date
        )
      )
    `
    )
    .order("last_name");

  if (studentsError) {
    console.error("Erreur lors de la récupération des étudiants:", studentsError);
    return;
  }

  console.log(`✅ ${students?.length || 0} étudiants trouvés\n`);

  students?.forEach((student: any) => {
    console.log(`👤 ${student.first_name} ${student.last_name} (ID: ${student.id})`);

    if (student.enrollments && student.enrollments.length > 0) {
      console.log(`   📚 ${student.enrollments.length} inscription(s):`);
      student.enrollments.forEach((enrollment: any) => {
        const course = enrollment.courses;
        const schoolYear = enrollment.school_years;
        console.log(`      - ${course?.name || "Cours inconnu"} (${enrollment.status})`);
        console.log(`        Année: ${schoolYear?.start_date}-${schoolYear?.end_date}`);
        console.log(
          `        Date: ${enrollment.start_date} à ${enrollment.end_date || "en cours"}`
        );
      });
    } else {
      console.log("   ❌ Aucune inscription");
    }
    console.log("");
  });

  // Vérifier les cours actifs
  console.log("📋 Cours actifs:");
  const { data: courses } = await supabase
    .from("courses")
    .select("id, name, type, status")
    .eq("status", "active")
    .order("name");

  courses?.forEach((course: any) => {
    console.log(`   - ${course.name} (${course.type})`);
  });

  console.log("\n📋 Années scolaires:");
  const { data: schoolYears } = await supabase
    .from("school_years")
    .select("id, start_date, end_date, is_active")
    .order("start_date", { ascending: false });

  schoolYears?.forEach((year: any) => {
    console.log(
      `   - ${year.start_date}-${year.end_date} ${year.is_active ? "(active)" : "(inactive)"}`
    );
  });
}

checkEnrollments().catch(console.error);
