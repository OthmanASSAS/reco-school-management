import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;
const sb = createClient(supabaseUrl, supabaseServiceKey);

async function addTestGrades2025() {
  console.log("📝 Ajout de notes de test pour 2025-2026...");

  // Récupérer l'année scolaire 2025-2026
  const { data: schoolYear2025 } = await sb
    .from("school_years")
    .select("id")
    .eq("label", "2025-2026")
    .single();

  if (!schoolYear2025) {
    console.log("❌ Année scolaire 2025-2026 non trouvée");
    return;
  }

  // Récupérer les étudiants
  const { data: students } = await sb
    .from("students")
    .select("id, first_name, last_name")
    .limit(10);

  // Récupérer les matières du cours Arabe 1
  const { data: arabe1Course } = await sb
    .from("courses")
    .select("id")
    .eq("name", "Arabe 1")
    .single();

  if (!arabe1Course) {
    console.log("❌ Cours Arabe 1 non trouvé");
    return;
  }

  const { data: subjects } = await sb
    .from("subjects")
    .select("id, name")
    .eq("course_id", arabe1Course.id);

  if (!subjects || subjects.length === 0) {
    console.log("❌ Aucune matière trouvée pour Arabe 1");
    return;
  }

  console.log(`\n📋 Données:`);
  console.log(`   Année scolaire: 2025-2026 (${schoolYear2025.id})`);
  console.log(`   Cours: Arabe 1 (${arabe1Course.id})`);
  console.log(`   Matières: ${subjects.length}`);
  console.log(`   Étudiants: ${students?.length || 0}`);

  // Créer des notes de test
  const gradesToInsert = [];

  for (const subject of subjects) {
    for (const student of students || []) {
      // Créer des notes pour différentes périodes
      const periods = [
        { type: "semaine", value: "Semaine 1" },
        { type: "semaine", value: "Semaine 2" },
        { type: "mois", value: "Septembre" },
        { type: "mois", value: "Octobre" },
      ];

      for (const period of periods) {
        // 50% de chance d'avoir une note
        if (faker.datatype.boolean()) {
          gradesToInsert.push({
            student_id: student.id,
            subject_id: subject.id,
            score: faker.number.int({ min: 8, max: 20 }),
            coefficient: 1,
            period_type: period.type,
            period_value: period.value,
            school_year_id: schoolYear2025.id,
            comments: faker.datatype.boolean(0.3) ? faker.lorem.sentence(3) : null,
            evaluation_date: faker.date.past().toISOString().split("T")[0],
          });
        }
      }
    }
  }

  console.log(`\n📝 Insertion de ${gradesToInsert.length} notes...`);

  const { error } = await sb.from("grades").insert(gradesToInsert);

  if (error) {
    console.error("❌ Erreur lors de l'insertion:", error);
    return;
  }

  console.log(`✅ ${gradesToInsert.length} notes insérées avec succès !`);
  console.log(`\n🎯 Test:`);
  console.log(`   1. Aller sur http://localhost:3001/grades`);
  console.log(`   2. Sélectionner: 2025-2026, Arabe 1, Semaine, Semaine 1`);
  console.log(`   3. Ouvrir une matière - vous devriez voir les notes !`);
}

addTestGrades2025().catch(e => {
  console.error("❌ Erreur:", e);
  process.exit(1);
});
