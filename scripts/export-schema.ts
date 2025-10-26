/**
 * Script pour exporter le schéma Supabase complet
 * Usage: pnpm tsx scripts/export-schema.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";

// Charger les variables d'environnement
config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variables d'environnement Supabase manquantes");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportSchema() {
  console.log("🔍 Extraction du schéma Supabase...\n");

  // Liste des tables à analyser (basé sur l'analyse du code)
  const tables = [
    "families",
    "students",
    "courses",
    "enrollments",
    "payments",
    "school_years",
    "registrations",
    "appointments",
    "teachers",
    "rooms",
    "settings",
    "course_instances",
    "subjects",
  ];

  const schemaInfo: Record<string, unknown> = {};

  for (const table of tables) {
    try {
      // Récupérer un exemple de ligne pour voir la structure
      const { data, error } = await supabase.from(table).select("*").limit(1);

      if (error) {
        console.log(`⚠️  ${table}: ${error.message}`);
        schemaInfo[table] = { error: error.message };
      } else {
        const sample = data?.[0] || {};
        const columns = Object.keys(sample).map(key => ({
          name: key,
          type: typeof sample[key],
          sample: sample[key],
        }));

        schemaInfo[table] = {
          exists: true,
          columns,
          sampleCount: data?.length || 0,
        };
        console.log(`✅ ${table}: ${columns.length} colonnes`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Erreur inattendue`);
      schemaInfo[table] = { error: String(err) };
    }
  }

  // Sauvegarder dans un fichier
  const output = {
    exportDate: new Date().toISOString(),
    tables: schemaInfo,
  };

  writeFileSync("scripts/schema-export.json", JSON.stringify(output, null, 2));

  console.log("\n✅ Schéma exporté dans scripts/schema-export.json");
}

exportSchema().catch(console.error);
