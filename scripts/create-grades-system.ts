import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function createGradesSystem() {
  console.log("🎵 CRÉATION - Système de notes pour professeurs");
  console.log("=".repeat(60));

  try {
    // 1. Table des critères d'évaluation
    console.log('📋 Création de la table "evaluation_criteria"...');
    const { error: criteriaError } = await supabase.rpc("create_evaluation_criteria_table");

    if (criteriaError) {
      console.log("⚠️  Table evaluation_criteria déjà existante ou erreur:", criteriaError.message);
    } else {
      console.log("✅ Table evaluation_criteria créée");
    }

    // 2. Table des évaluations
    console.log('📊 Création de la table "evaluations"...');
    const { error: evaluationsError } = await supabase.rpc("create_evaluations_table");

    if (evaluationsError) {
      console.log("⚠️  Table evaluations déjà existante ou erreur:", evaluationsError.message);
    } else {
      console.log("✅ Table evaluations créée");
    }

    // 3. Table des notes
    console.log('📝 Création de la table "grades"...');
    const { error: gradesError } = await supabase.rpc("create_grades_table");

    if (gradesError) {
      console.log("⚠️  Table grades déjà existante ou erreur:", gradesError.message);
    } else {
      console.log("✅ Table grades créée");
    }

    // 4. Insérer des critères d'évaluation par défaut
    console.log("🎯 Insertion des critères d'évaluation par défaut...");
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
        console.log(
          `⚠️  Critère "${criterion.name}" déjà existant ou erreur:`,
          insertError.message
        );
      } else {
        console.log(`✅ Critère "${criterion.name}" ajouté`);
      }
    }

    console.log("");
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
  } catch (error) {
    console.error("❌ Erreur lors de la création du système de notes:", error);
  }
}

// Fonction pour créer les tables via SQL direct
async function createTablesWithSQL() {
  console.log("🔧 Création des tables via SQL...");

  try {
    // 1. Table des critères d'évaluation
    const { error: criteriaError } = await supabase
      .from("evaluation_criteria")
      .select("*")
      .limit(1);

    if (criteriaError && criteriaError.code === "PGRST116") {
      console.log("📋 Création de la table evaluation_criteria...");
      await supabase.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS evaluation_criteria (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            category VARCHAR(50) NOT NULL,
            weight INTEGER DEFAULT 20 CHECK (weight >= 0 AND weight <= 100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      });
      console.log("✅ Table evaluation_criteria créée");
    }

    // 2. Table des évaluations
    const { error: evaluationsError } = await supabase.from("evaluations").select("*").limit(1);

    if (evaluationsError && evaluationsError.code === "PGRST116") {
      console.log("📊 Création de la table evaluations...");
      await supabase.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS evaluations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
            teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            evaluation_date DATE NOT NULL,
            evaluation_type VARCHAR(50) DEFAULT 'continuous', -- continuous, exam, performance
            status VARCHAR(20) DEFAULT 'draft', -- draft, active, completed
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      });
      console.log("✅ Table evaluations créée");
    }

    // 3. Table des notes
    const { error: gradesError } = await supabase.from("grades").select("*").limit(1);

    if (gradesError && gradesError.code === "PGRST116") {
      console.log("📝 Création de la table grades...");
      await supabase.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS grades (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
            student_id UUID REFERENCES students(id) ON DELETE CASCADE,
            criterion_id UUID REFERENCES evaluation_criteria(id) ON DELETE CASCADE,
            score DECIMAL(5,2) CHECK (score >= 0 AND score <= 20),
            comment TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(evaluation_id, student_id, criterion_id)
          );
        `,
      });
      console.log("✅ Table grades créée");
    }
  } catch (error) {
    console.error("❌ Erreur lors de la création des tables:", error);
  }
}

// Fonction principale
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "create":
      await createGradesSystem();
      break;
    case "sql":
      await createTablesWithSQL();
      break;
    default:
      console.log("Usage:");
      console.log("  npm run create-grades-system create  - Créer le système de notes");
      console.log("  npm run create-grades-system sql     - Créer les tables via SQL");
      break;
  }
}

main().catch(console.error);
