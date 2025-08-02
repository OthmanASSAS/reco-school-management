import { createClient } from "@supabase/supabase-js";

async function checkSpecificCourse() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const courseId = "4d74340c-93f2-42da-bd28-f87becd4f1b5"; // Arabe Adulte 2
  const schoolYearId = "1969c7e5-faf0-47dc-86b9-da466d29fde6"; // 2025-2026

  console.log("🔍 Vérification des inscriptions pour un cours spécifique...\n");

  // Récupérer le cours
  const { data: course } = await supabase
    .from("courses")
    .select("id, name, type")
    .eq("id", courseId)
    .single();

  console.log(`📚 Cours: ${course?.name} (${course?.type})`);

  // Récupérer l'année scolaire
  const { data: schoolYear } = await supabase
    .from("school_years")
    .select("id, start_date, end_date")
    .eq("id", schoolYearId)
    .single();

  console.log(`📅 Année scolaire: ${schoolYear?.start_date} - ${schoolYear?.end_date}\n`);

  // Récupérer toutes les inscriptions pour ce cours et cette année
  const { data: enrollments, error } = await supabase
    .from("enrollments")
    .select(
      `
      id,
      student_id,
      status,
      start_date,
      end_date,
      students (
        id,
        first_name,
        last_name
      )
    `
    )
    .eq("course_id", courseId)
    .eq("school_year_id", schoolYearId);

  if (error) {
    console.error("Erreur:", error);
    return;
  }

  console.log(
    `✅ ${enrollments?.length || 0} inscription(s) trouvée(s) pour ce cours et cette année:\n`
  );

  enrollments?.forEach((enrollment: any) => {
    const student = enrollment.students;
    console.log(`👤 ${student?.first_name} ${student?.last_name}`);
    console.log(`   Status: ${enrollment.status}`);
    console.log(`   Période: ${enrollment.start_date} à ${enrollment.end_date || "en cours"}`);
    console.log("");
  });

  // Vérifier s'il y a d'autres inscriptions pour ce cours dans d'autres années
  const { data: allEnrollmentsForCourse } = await supabase
    .from("enrollments")
    .select(
      `
      id,
      student_id,
      school_year_id,
      status,
      students (
        id,
        first_name,
        last_name
      ),
      school_years (
        id,
        start_date,
        end_date
      )
    `
    )
    .eq("course_id", courseId);

  console.log(
    `📊 Total inscriptions pour ce cours (toutes années): ${allEnrollmentsForCourse?.length || 0}\n`
  );

  // Grouper par année scolaire
  const enrollmentsByYear = allEnrollmentsForCourse?.reduce((acc: any, enrollment: any) => {
    const yearKey = enrollment.school_years?.start_date;
    if (!acc[yearKey]) {
      acc[yearKey] = [];
    }
    acc[yearKey].push(enrollment);
    return acc;
  }, {});

  Object.entries(enrollmentsByYear || {}).forEach(([year, enrollments]: [string, any]) => {
    console.log(`📅 Année ${year}:`);
    enrollments.forEach((enrollment: any) => {
      const student = enrollment.students;
      console.log(`   - ${student?.first_name} ${student?.last_name} (${enrollment.status})`);
    });
    console.log("");
  });
}

checkSpecificCourse().catch(console.error);
