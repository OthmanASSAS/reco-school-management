/**
 * Export des données Supabase vers JSON
 *
 * POURQUOI CE SCRIPT ?
 * - Backup des données avant migration
 * - Format JSON facile à utiliser pour seed Prisma
 * - Permet de vérifier les données avant import
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync } from "fs";

// Charger les variables d'environnement
config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variables Supabase manquantes dans .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * ORDRE D'EXPORT : Important pour respecter les foreign keys
 *
 * 1. Tables sans dépendances (school_years, families, courses)
 * 2. Tables avec 1 niveau de dépendance (students)
 * 3. Tables avec 2+ niveaux (enrollments, registrations)
 */
const TABLES_ORDER = [
  "school_years", // Pas de FK
  "families", // Pas de FK
  "courses", // Pas de FK (pour l'instant, teacher_id/room_id nullable)
  "students", // FK → families
  "enrollments", // FK → students, courses, school_years
  "registrations", // FK → students, families, school_years
];

async function exportTable(tableName: string) {
  console.log(`\n📊 Export de ${tableName}...`);

  try {
    // SELECT * FROM table
    // .select() sans argument = toutes les colonnes
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .order("created_at", { ascending: true }); // Ordre chronologique

    if (error) {
      console.error(`❌ Erreur ${tableName}:`, error.message);
      return null;
    }

    if (!data || data.length === 0) {
      console.log(`⚠️  ${tableName}: Table vide (0 lignes)`);
      return [];
    }

    console.log(`✅ ${tableName}: ${data.length} lignes exportées`);
    return data;
  } catch (err) {
    console.error(`❌ ${tableName}: Erreur inattendue`, err);
    return null;
  }
}

async function main() {
  console.log("🚀 Export des données Supabase...\n");

  // Créer le dossier de backup s'il n'existe pas
  const backupDir = resolve(process.cwd(), "scripts/backup-supabase");
  mkdirSync(backupDir, { recursive: true });

  const exportedData: Record<string, unknown> = {
    exportDate: new Date().toISOString(),
    tables: {},
  };

  // Exporter chaque table dans l'ordre
  for (const table of TABLES_ORDER) {
    const data = await exportTable(table);

    if (data === null) {
      console.error(`\n❌ Export ${table} échoué. Arrêt.`);
      process.exit(1);
    }

    exportedData.tables[table] = data;

    // Sauvegarder chaque table dans un fichier séparé
    // POURQUOI ? Plus facile à lire/modifier qu'un gros fichier
    const filePath = `${backupDir}/${table}.json`;
    writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`   💾 Sauvegardé: ${table}.json`);
  }

  // Sauvegarder aussi un fichier complet
  // POURQUOI ? Utile pour avoir une vue d'ensemble
  const completePath = `${backupDir}/complete-export.json`;
  writeFileSync(completePath, JSON.stringify(exportedData, null, 2));

  // Résumé
  console.log("\n" + "=".repeat(50));
  console.log("✅ Export terminé !\n");
  console.log("📁 Fichiers créés dans:", backupDir);
  console.log("\nRésumé:");

  for (const table of TABLES_ORDER) {
    const count = (exportedData.tables[table] as unknown[]).length;
    console.log(`   ${table.padEnd(20)} ${count.toString().padStart(4)} lignes`);
  }

  console.log("\n" + "=".repeat(50));
}

main().catch(err => {
  console.error("❌ Erreur fatale:", err);
  process.exit(1);
});
