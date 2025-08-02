import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearAllGrades() {
  console.log("🗑️  Suppression de toutes les notes...");

  try {
    // Supprimer toutes les notes
    const { data, error } = await supabase
      .from("grades")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Condition pour supprimer toutes les lignes

    if (error) {
      console.error("❌ Erreur lors de la suppression des notes:", error);
      return;
    }

    console.log("✅ Toutes les notes ont été supprimées avec succès");
    console.log(`📊 Nombre de notes supprimées: ${data?.length || "N/A"}`);

    // Vérifier qu'il ne reste plus de notes
    const { data: remainingGrades, error: checkError } = await supabase
      .from("grades")
      .select("id")
      .limit(1);

    if (checkError) {
      console.error("❌ Erreur lors de la vérification:", checkError);
      return;
    }

    if (remainingGrades && remainingGrades.length === 0) {
      console.log("✅ Confirmation: Aucune note ne reste dans la base de données");
    } else {
      console.log("⚠️  Attention: Il reste encore des notes dans la base de données");
    }
  } catch (error) {
    console.error("❌ Erreur inattendue:", error);
  }
}

// Exécuter le script
clearAllGrades()
  .then(() => {
    console.log("🎉 Script terminé");
    process.exit(0);
  })
  .catch(error => {
    console.error("💥 Erreur fatale:", error);
    process.exit(1);
  });
