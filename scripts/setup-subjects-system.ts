import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function setupSubjectsSystem() {
  console.log("📚 SETUP - Système de matières dans les cours");
  console.log("=".repeat(60));

  try {
    // Lire le fichier SQL
    const sqlPath = path.join(process.cwd(), "scripts", "create-subjects-system.sql");
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
        if (
          command.includes("CREATE TABLE") ||
          command.includes("CREATE INDEX") ||
          command.includes("CREATE POLICY")
        ) {
          console.log(`🔧 Exécution: ${command.substring(0, 50)}...`);

          const { error } = await supabase.rpc("exec_sql", {
            sql: command,
          });

          if (error) {
            console.log(`⚠️  Erreur: ${error.message}`);
            errorCount++;
          } else {
            console.log("✅ Succès");
            successCount++;
          }
        } else if (command.includes("INSERT INTO")) {
          console.log(`📝 Insertion de données...`);

          // Pour les insertions, on va les traiter différemment
          try {
            const { error } = await supabase.rpc("exec_sql", {
              sql: command,
            });

            if (error) {
              console.log(`⚠️  Erreur d'insertion: ${error.message}`);
              errorCount++;
            } else {
              console.log("✅ Données insérées");
              successCount++;
            }
          } catch (err) {
            console.log(`⚠️  Erreur d'insertion: ${err}`);
            errorCount++;
          }
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
      console.log("🎉 Système de matières créé avec succès !");
      console.log("");
      console.log("📋 Structure créée :");
      console.log("   • subjects - Matières dans les cours");
      console.log("   • evaluation_criteria - Critères par matière");
      console.log("   • evaluations - Évaluations par matière");
      console.log("   • grades - Notes par matière et critère");
      console.log("");
      console.log("🎯 Matières par défaut :");
      console.log("   📖 Arabe : Lecture, Grammaire, Expression orale, Religion");
      console.log("   📖 Coran : Récitation, Tajweed, Mémorisation, Compréhension");
      console.log("   📖 Éveil : Éveil religieux, Activités manuelles, Chants");
      console.log("");
      console.log("🔗 Vous pouvez maintenant accéder à la page /grades");
    } else {
      console.log("⚠️  Certaines erreurs sont survenues. Vérifiez les logs ci-dessus.");
    }
  } catch (error) {
    console.error("❌ Erreur générale:", error);
  }
}

// Fonction pour créer les matières manuellement
async function createSubjectsManually() {
  console.log("🔧 Création des matières manuellement...");

  try {
    // 1. Récupérer les cours existants
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("id, name, label")
      .eq("status", "active")
      .order("name");

    if (coursesError) {
      console.error("❌ Erreur lors de la récupération des cours:", coursesError);
      return;
    }

    console.log(`📚 ${courses?.length || 0} cours trouvé(s)`);

    // 2. Définir les matières par cours
    const subjectsByCourse: {
      [key: string]: Array<{
        name: string;
        description: string;
        color: string;
        order_index: number;
      }>;
    } = {
      "Arabe Débutant": [
        {
          name: "Lecture",
          description: "Lecture et compréhension de textes",
          color: "#3B82F6",
          order_index: 1,
        },
        {
          name: "Grammaire",
          description: "Règles grammaticales de base",
          color: "#10B981",
          order_index: 2,
        },
        {
          name: "Expression orale",
          description: "Conversation et prononciation",
          color: "#F59E0B",
          order_index: 3,
        },
        { name: "Religion", description: "Éducation religieuse", color: "#8B5CF6", order_index: 4 },
      ],
      "Arabe Élémentaire": [
        {
          name: "Lecture",
          description: "Lecture et compréhension de textes",
          color: "#3B82F6",
          order_index: 1,
        },
        {
          name: "Grammaire",
          description: "Règles grammaticales intermédiaires",
          color: "#10B981",
          order_index: 2,
        },
        {
          name: "Expression orale",
          description: "Conversation et prononciation",
          color: "#F59E0B",
          order_index: 3,
        },
        { name: "Religion", description: "Éducation religieuse", color: "#8B5CF6", order_index: 4 },
      ],
      "Arabe Intermédiaire": [
        {
          name: "Lecture",
          description: "Lecture et compréhension de textes",
          color: "#3B82F6",
          order_index: 1,
        },
        {
          name: "Grammaire",
          description: "Règles grammaticales avancées",
          color: "#10B981",
          order_index: 2,
        },
        {
          name: "Expression orale",
          description: "Conversation et prononciation",
          color: "#F59E0B",
          order_index: 3,
        },
        { name: "Religion", description: "Éducation religieuse", color: "#8B5CF6", order_index: 4 },
      ],
      "Coran Débutant": [
        {
          name: "Récitation",
          description: "Apprentissage de la récitation",
          color: "#059669",
          order_index: 1,
        },
        {
          name: "Tajweed",
          description: "Règles de prononciation",
          color: "#DC2626",
          order_index: 2,
        },
        {
          name: "Mémorisation",
          description: "Mémorisation des versets",
          color: "#7C3AED",
          order_index: 3,
        },
        {
          name: "Compréhension",
          description: "Explication des versets",
          color: "#EA580C",
          order_index: 4,
        },
      ],
      "Coran Intermédiaire": [
        {
          name: "Récitation",
          description: "Perfectionnement de la récitation",
          color: "#059669",
          order_index: 1,
        },
        {
          name: "Tajweed",
          description: "Règles de prononciation avancées",
          color: "#DC2626",
          order_index: 2,
        },
        {
          name: "Mémorisation",
          description: "Mémorisation des sourates",
          color: "#7C3AED",
          order_index: 3,
        },
        {
          name: "Compréhension",
          description: "Explication approfondie",
          color: "#EA580C",
          order_index: 4,
        },
      ],
      "Coran Avancé": [
        {
          name: "Récitation",
          description: "Maîtrise de la récitation",
          color: "#059669",
          order_index: 1,
        },
        {
          name: "Tajweed",
          description: "Maîtrise des règles de prononciation",
          color: "#DC2626",
          order_index: 2,
        },
        {
          name: "Mémorisation",
          description: "Mémorisation complète",
          color: "#7C3AED",
          order_index: 3,
        },
        {
          name: "Compréhension",
          description: "Analyse approfondie",
          color: "#EA580C",
          order_index: 4,
        },
      ],
      "Éveil Islamique": [
        {
          name: "Éveil religieux",
          description: "Découverte de l'islam",
          color: "#059669",
          order_index: 1,
        },
        {
          name: "Activités manuelles",
          description: "Créativité et expression",
          color: "#F59E0B",
          order_index: 2,
        },
        {
          name: "Chants et comptines",
          description: "Apprentissage par le chant",
          color: "#8B5CF6",
          order_index: 3,
        },
      ],
    };

    // 3. Créer les matières pour chaque cours
    for (const course of courses || []) {
      const courseName = course.label || course.name;
      const subjects = subjectsByCourse[courseName];

      if (subjects) {
        console.log(`📚 Création des matières pour ${courseName}...`);

        for (const subject of subjects) {
          const { error: insertError } = await supabase.from("subjects").upsert(
            {
              course_id: course.id,
              ...subject,
            },
            { onConflict: "course_id,name" }
          );

          if (insertError) {
            console.log(`⚠️  Erreur pour la matière "${subject.name}":`, insertError.message);
          } else {
            console.log(`✅ Matière "${subject.name}" ajoutée`);
          }
        }
      }
    }

    console.log("");
    console.log("🎉 Matières créées avec succès !");
    console.log("📋 Les critères d'évaluation seront créés automatiquement.");
  } catch (error) {
    console.error("❌ Erreur lors de la création des matières:", error);
  }
}

// Fonction principale
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "setup":
      await setupSubjectsSystem();
      break;
    case "create":
      await createSubjectsManually();
      break;
    default:
      console.log("Usage:");
      console.log("  npm run setup-subjects-system setup   - Configuration complète");
      console.log("  npm run setup-subjects-system create  - Création des matières");
      break;
  }
}

main().catch(console.error);
