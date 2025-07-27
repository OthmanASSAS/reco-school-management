// scripts/seed-all.ts - Script principal pour lancer tous les seeds
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;
const sb = createClient(supabaseUrl, supabaseServiceKey);

async function seedAll() {
  console.log("🌱 Démarrage du seeding complet...");
  console.log("=".repeat(50));

  try {
    // 1. Seed principal (données de base)
    console.log("\n📚 1. Seed principal...");
    const { execSync } = require("child_process");
    execSync("npm run seed", { stdio: "inherit" });
    console.log("✅ Seed principal terminé");

    // 2. Assigner professeurs et salles
    console.log("\n👨‍🏫 2. Assignation des professeurs et salles...");
    execSync("npm run assign-teachers-rooms", { stdio: "inherit" });
    console.log("✅ Assignation terminée");

    // 3. Mettre à jour les horaires
    console.log("\n⏰ 3. Mise à jour des horaires...");
    execSync("npm run update-schedules", { stdio: "inherit" });
    console.log("✅ Horaires mis à jour");

    // 4. Vérifier le statut des cours
    console.log("\n📊 4. Vérification des statuts...");
    execSync("npm run fix-course-status", { stdio: "inherit" });
    console.log("✅ Statuts vérifiés");

    // 5. Vérification finale
    console.log("\n🔍 5. Vérification finale...");
    execSync("npm run check-rooms", { stdio: "inherit" });
    console.log("✅ Vérification terminée");

    console.log("\n🎉 Seeding complet terminé !");
    console.log("📅 Tu peux maintenant voir le planning sur /planning");
    console.log("📚 Tu peux voir les cours sur /courses");
    console.log("👨‍👩‍👧‍👦 Tu peux voir les familles sur /families");
  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error);
    process.exit(1);
  }
}

seedAll().catch(e => {
  console.error(e);
  process.exit(1);
});
