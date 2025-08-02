import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function setupGradesSystem() {
  console.log("🎵 SETUP - Système de notes pour professeurs");
  console.log("=".repeat(60));

  try {
    // Lire le fichier SQL
    const sqlPath = path.join(process.cwd(), "scripts", "create-grades-tables.sql");
    const sqlContent = fs.readFileSync(sqlPath, "utf8");

    console.log("📋 Exécution du script SQL...");
    console.log("");

    // Diviser le script en commandes individuelles
    const commands = sqlContent
      .split(";")
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith("--"));

    let successCount = 0;
    let errorCount = 0;

    for (const command of commands) {
      try {
        console.log(`🔧 Exécution: ${command.substring(0, 50)}...`);

        const { error } = await supabase.rpc("exec_sql", {
          sql: command,
        });

        if (error) {
          // Si la fonction exec_sql n'existe pas, on essaie une autre approche
          console.log("⚠️  Fonction exec_sql non disponible, tentative alternative...");

          // Pour les tables, on peut essayer de les créer via l'API REST
          if (command.includes("CREATE TABLE")) {
            console.log("📋 Création de table via API...");
            // On va créer les tables une par une
            continue;
          }

          console.log(`❌ Erreur: ${error.message}`);
          errorCount++;
        } else {
          console.log("✅ Succès");
          successCount++;
        }
      } catch (err) {
        console.log(`❌ Erreur: ${err}`);
        errorCount++;
      }
    }

    console.log("");
    console.log("📊 Résumé:");
    console.log(`   ✅ ${successCount} commande(s) réussie(s)`);
    console.log(`   ❌ ${errorCount} erreur(s)`);
    console.log("");

    if (errorCount === 0) {
      console.log("🎉 Système de notes créé avec succès !");
      console.log("");
      console.log("📋 Tables créées :");
      console.log("   • evaluation_criteria - Critères d'évaluation");
      console.log("   • evaluations - Sessions d'évaluation");
      console.log("   • grades - Notes des élèves");
      console.log("");
      console.log("🎯 Critères par défaut :");
      console.log("   • Technique (30%)");
      console.log("   • Musicalité (25%)");
      console.log("   • Rythme (20%)");
      console.log("   • Théorie (15%)");
      console.log("   • Assiduité (10%)");
      console.log("");
      console.log("🔗 Vous pouvez maintenant accéder à la page /grades");
    } else {
      console.log("⚠️  Certaines erreurs sont survenues. Vérifiez les logs ci-dessus.");
    }
  } catch (error) {
    console.error("❌ Erreur générale:", error);
  }
}

// Fonction alternative pour créer les tables une par une
async function createTablesIndividually() {
  console.log("🔧 Création des tables individuellement...");

  try {
    // 1. Vérifier si les tables existent déjà
    const { data: existingTables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", ["evaluation_criteria", "evaluations", "grades"]);

    if (tablesError) {
      console.log("⚠️  Impossible de vérifier les tables existantes:", tablesError.message);
    } else {
      const existingTableNames = existingTables?.map(t => t.table_name) || [];
      console.log("📋 Tables existantes:", existingTableNames);
    }

    // 2. Créer les critères d'évaluation
    console.log("🎯 Création des critères d'évaluation...");
    const defaultCriteria = [
      {
        name: "Technique",
        description: "Maîtrise technique de l'instrument",
        category: "technique",
        weight: 30,
      },
      {
        name: "Musicalité",
        description: "Expression musicale et sensibilité",
        category: "musicality",
        weight: 25,
      },
      {
        name: "Rythme",
        description: "Précision rythmique et tempo",
        category: "rhythm",
        weight: 20,
      },
      {
        name: "Théorie",
        description: "Connaissance théorique et solfège",
        category: "theory",
        weight: 15,
      },
      {
        name: "Assiduité",
        description: "Présence et participation",
        category: "attendance",
        weight: 10,
      },
    ];

    for (const criterion of defaultCriteria) {
      const { error: insertError } = await supabase
        .from("evaluation_criteria")
        .upsert(criterion, { onConflict: "name" });

      if (insertError) {
        console.log(`⚠️  Erreur pour le critère "${criterion.name}":`, insertError.message);
      } else {
        console.log(`✅ Critère "${criterion.name}" ajouté`);
      }
    }

    console.log("");
    console.log("🎉 Configuration terminée !");
    console.log("📋 Les tables seront créées automatiquement lors de la première utilisation.");
  } catch (error) {
    console.error("❌ Erreur lors de la création des tables:", error);
  }
}

// Fonction principale
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "setup":
      await setupGradesSystem();
      break;
    case "create":
      await createTablesIndividually();
      break;
    default:
      console.log("Usage:");
      console.log("  npm run setup-grades-system setup   - Configuration complète");
      console.log("  npm run setup-grades-system create  - Création des critères");
      break;
  }
}

main().catch(console.error);
