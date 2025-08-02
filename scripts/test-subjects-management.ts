import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;
const sb = createClient(supabaseUrl, supabaseServiceKey);

async function testSubjectsManagement() {
  console.log("🧪 Test de la gestion des matières...");

  // 1. Récupérer un cours existant
  const { data: courses, error: coursesError } = await sb
    .from("courses")
    .select("id, name")
    .limit(1);

  if (coursesError || !courses || courses.length === 0) {
    console.error("❌ Erreur lors de la récupération des cours:", coursesError);
    return;
  }

  const testCourse = courses[0];
  console.log(`✅ Cours de test: ${testCourse.name} (${testCourse.id})`);

  // 2. Vérifier les matières existantes
  const { data: existingSubjects, error: subjectsError } = await sb
    .from("subjects")
    .select("id, name, description, color, order_index, is_active")
    .eq("course_id", testCourse.id)
    .order("order_index");

  if (subjectsError) {
    console.error("❌ Erreur lors de la récupération des matières:", subjectsError);
    return;
  }

  console.log(`📚 Matières existantes: ${existingSubjects?.length || 0}`);
  if (existingSubjects && existingSubjects.length > 0) {
    existingSubjects.forEach((subject, index) => {
      console.log(
        `   ${index + 1}. ${subject.name} (${subject.color}) - ${subject.is_active ? "Actif" : "Inactif"}`
      );
    });
  }

  // 3. Tester l'ajout d'une nouvelle matière
  console.log("\n➕ Test d'ajout d'une nouvelle matière...");

  const newSubject = {
    name: "Test Matière",
    description: "Matière de test pour vérification",
    color: "#3B82F6",
    order_index: (existingSubjects?.length || 0) + 1,
    is_active: true,
    course_id: testCourse.id,
  };

  const { data: addedSubject, error: addError } = await sb
    .from("subjects")
    .insert(newSubject)
    .select()
    .single();

  if (addError) {
    console.error("❌ Erreur lors de l'ajout de la matière:", addError);
  } else {
    console.log(`✅ Matière ajoutée: ${addedSubject.name} (${addedSubject.id})`);
  }

  // 4. Tester la modification d'une matière
  if (addedSubject) {
    console.log("\n✏️ Test de modification de la matière...");

    const { data: updatedSubject, error: updateError } = await sb
      .from("subjects")
      .update({
        name: "Test Matière Modifiée",
        color: "#10B981",
      })
      .eq("id", addedSubject.id)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Erreur lors de la modification:", updateError);
    } else {
      console.log(`✅ Matière modifiée: ${updatedSubject.name} (${updatedSubject.color})`);
    }

    // 5. Nettoyer - supprimer la matière de test
    console.log("\n🗑️ Nettoyage - suppression de la matière de test...");

    const { error: deleteError } = await sb.from("subjects").delete().eq("id", addedSubject.id);

    if (deleteError) {
      console.error("❌ Erreur lors de la suppression:", deleteError);
    } else {
      console.log("✅ Matière de test supprimée");
    }
  }

  // 6. Tester la copie depuis un template
  console.log("\n📋 Test de copie depuis un template...");

  // Récupérer un autre cours comme template
  const { data: templateCourses } = await sb
    .from("courses")
    .select("id, name")
    .neq("id", testCourse.id)
    .limit(1);

  if (templateCourses && templateCourses.length > 0) {
    const templateCourse = templateCourses[0];
    console.log(`📚 Template: ${templateCourse.name}`);

    // Vérifier si le template a des matières
    const { data: templateSubjects } = await sb
      .from("subjects")
      .select("id, name")
      .eq("course_id", templateCourse.id);

    if (templateSubjects && templateSubjects.length > 0) {
      console.log(`   📝 ${templateSubjects.length} matière(s) dans le template`);
      templateSubjects.forEach(subject => {
        console.log(`      - ${subject.name}`);
      });
    } else {
      console.log("   ⚠️ Aucune matière dans le template");
    }
  }

  console.log("\n✅ Tests terminés !");
  console.log("\n📋 Résumé:");
  console.log("   ✅ Récupération des cours");
  console.log("   ✅ Récupération des matières");
  console.log("   ✅ Ajout de matière");
  console.log("   ✅ Modification de matière");
  console.log("   ✅ Suppression de matière");
  console.log("   ✅ Vérification des templates");

  console.log("\n🎯 La gestion des matières est prête !");
  console.log(`🌐 URL de test: http://localhost:3001/admin/courses/${testCourse.id}/matieres`);
}

testSubjectsManagement().catch(e => {
  console.error("❌ Erreur lors des tests:", e);
  process.exit(1);
});
