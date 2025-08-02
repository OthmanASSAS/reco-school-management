import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;
const sb = createClient(supabaseUrl, supabaseServiceKey);

async function addTestGrades() {
  console.log("📝 Ajout de notes de test...");

  const { data: allStudents } = await sb.from("students").select("id");
  const { data: allSubjects } = await sb.from("subjects").select("id, course_id");
  const { data: allSchoolYears } = await sb.from("school_years").select("id");

  console.log(
    `📊 État: ${allStudents?.length || 0} étudiants, ${allSubjects?.length || 0} matières, ${allSchoolYears?.length || 0} années scolaires`
  );

  if (allStudents && allSubjects && allSchoolYears && allSubjects.length > 0) {
    const gradesToInsert = [];
    const periodTypes = ["Semaine", "Mois", "Trimestre", "Semestre", "Annuel"];

    for (let i = 0; i < 50; i++) {
      const randomStudent = faker.helpers.arrayElement(allStudents);
      const randomSubject = faker.helpers.arrayElement(allSubjects);
      const randomSchoolYear = faker.helpers.arrayElement(allSchoolYears);
      const randomPeriodType = faker.helpers.arrayElement(periodTypes);
      const randomPeriodValue = `Période ${faker.number.int({ min: 1, max: 4 })}`;

      gradesToInsert.push({
        student_id: randomStudent.id,
        subject_id: randomSubject.id,
        score: faker.number.int({ min: 0, max: 20 }),
        coefficient: faker.number.int({ min: 1, max: 3 }),
        period_type: randomPeriodType,
        period_value: randomPeriodValue,
        school_year_id: randomSchoolYear.id,
        comments: faker.datatype.boolean(0.5) ? faker.lorem.sentence(3) : null,
        evaluation_date: faker.date.past().toISOString().split("T")[0],
      });
    }

    const { error: gradesError } = await sb.from("grades").insert(gradesToInsert);
    if (gradesError) {
      console.error("   ❌ Erreur lors de l'insertion des notes de test:", gradesError);
    } else {
      console.log(`   ✅ Inséré ${gradesToInsert.length} notes de test.`);
    }
  } else {
    console.log("   ⚠️  Pas de matières disponibles pour créer des notes de test.");
  }

  console.log("✅ Ajout de notes terminé !");
}

addTestGrades().catch(e => {
  console.error(e);
  process.exit(1);
});
