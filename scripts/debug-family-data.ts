import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function debugFamilyData(familyId?: string) {
  console.log("🔍 DEBUG - Données de famille avec noms lisibles");
  console.log("=".repeat(80));

  try {
    // Récupérer toutes les familles ou une famille spécifique
    const query = familyId
      ? supabase.from("families").select("*").eq("id", familyId)
      : supabase.from("families").select("*").limit(5);

    const { data: families, error } = await query;

    if (error) {
      console.error("❌ Erreur lors de la récupération des familles:", error);
      return;
    }

    console.log(`📋 ${families?.length || 0} famille(s) trouvée(s)`);
    console.log("");

    for (const family of families || []) {
      console.log(`👨‍👩‍👧‍👦 FAMILLE: ${family.first_name} ${family.last_name}`);
      console.log(`   📧 Email: ${family.email}`);
      console.log(`   📞 Téléphone: ${family.phone}`);
      console.log(`   🏠 Adresse: ${family.address}, ${family.postal_code} ${family.city}`);
      console.log(`   🆔 ID: ${family.id}`);
      console.log("");

      // Récupérer les étudiants de cette famille
      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select(
          `
          *,
          enrollments(
            *,
            courses(
              id,
              name,
              label,
              category,
              price
            ),
            school_years(
              id,
              label,
              start_date,
              end_date
            )
          )
        `
        )
        .eq("family_id", family.id);

      if (studentsError) {
        console.error("❌ Erreur lors de la récupération des étudiants:", studentsError);
        continue;
      }

      console.log(`   👨‍🎓 ÉTUDIANTS (${students?.length || 0}):`);
      for (const student of students || []) {
        console.log(
          `      👤 ${student.first_name} ${student.last_name} (${student.registration_type})`
        );
        console.log(`         🆔 ID: ${student.id}`);
        console.log(`         📅 Né(e) le: ${student.birth_date}`);

        if (student.enrollments && student.enrollments.length > 0) {
          console.log(`         📚 COURS INSCRITS:`);
          for (const enrollment of student.enrollments) {
            const course = enrollment.courses;
            const schoolYear = enrollment.school_years;
            console.log(`            🎓 ${course?.label || course?.name} (${course?.category})`);
            console.log(`               💰 Prix: ${course?.price}€`);
            console.log(`               📅 Année: ${schoolYear?.label || "Non définie"}`);
            console.log(`               📊 Statut: ${enrollment.status}`);
            console.log(`               🆔 Enrollment ID: ${enrollment.id}`);
          }
        } else {
          console.log(`         ⚠️  Aucun cours inscrit`);
        }
        console.log("");
      }

      // Récupérer les paiements de cette famille
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .eq("family_id", family.id)
        .order("created_at", { ascending: false });

      if (paymentsError) {
        console.error("❌ Erreur lors de la récupération des paiements:", paymentsError);
        continue;
      }

      console.log(`   💰 PAIEMENTS (${payments?.length || 0}):`);
      for (const payment of payments || []) {
        console.log(
          `      💳 Paiement du ${new Date(payment.created_at).toLocaleDateString("fr-FR")}`
        );
        console.log(`         🆔 ID: ${payment.id}`);
        console.log(`         💵 Espèces: ${payment.amount_cash || 0}€`);
        console.log(`         💳 Carte: ${payment.amount_card || 0}€`);
        console.log(`         🏦 Virement: ${payment.amount_transfer || 0}€`);
        console.log(`         📚 Livres: ${payment.books ? "Oui" : "Non"}`);
        console.log(`         💸 Remboursement: ${payment.refund_amount || 0}€`);
        if (payment.cheques && payment.cheques.length > 0) {
          console.log(`         🧾 Chèques:`);
          for (const cheque of payment.cheques) {
            if (cheque && typeof cheque === "object") {
              const count = cheque.count || 0;
              const amount = cheque.amount || 0;
              const banque = cheque.banque || "Banque inconnue";
              console.log(`            - ${count}x ${amount}€ (${banque})`);
            }
          }
        }
        console.log("");
      }

      console.log("─".repeat(80));
      console.log("");
    }
  } catch (error) {
    console.error("❌ Erreur générale:", error);
  }
}

// Fonction pour afficher les années scolaires
async function debugSchoolYears() {
  console.log("📅 DEBUG - Années scolaires");
  console.log("=".repeat(50));

  try {
    const { data: schoolYears, error } = await supabase
      .from("school_years")
      .select("*")
      .order("start_date", { ascending: false });

    if (error) {
      console.error("❌ Erreur lors de la récupération des années scolaires:", error);
      return;
    }

    console.log(`${schoolYears?.length || 0} année(s) scolaire(s) trouvée(s)`);
    console.log("");

    for (const year of schoolYears || []) {
      const isCurrent =
        new Date() >= new Date(year.start_date) && new Date() <= new Date(year.end_date);
      console.log(
        `📚 ${year.label || `${new Date(year.start_date).getFullYear()}-${new Date(year.end_date).getFullYear()}`}`
      );
      console.log(`   🆔 ID: ${year.id}`);
      console.log(
        `   📅 Du ${new Date(year.start_date).toLocaleDateString("fr-FR")} au ${new Date(year.end_date).toLocaleDateString("fr-FR")}`
      );
      console.log(
        `   ${isCurrent ? "✅" : "⏳"} ${isCurrent ? "Année courante" : "Année passée/future"}`
      );
      console.log("");
    }
  } catch (error) {
    console.error("❌ Erreur générale:", error);
  }
}

// Fonction pour afficher les cours
async function debugCourses() {
  console.log("🎓 DEBUG - Cours disponibles");
  console.log("=".repeat(50));

  try {
    const { data: courses, error } = await supabase
      .from("courses")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("❌ Erreur lors de la récupération des cours:", error);
      return;
    }

    console.log(`${courses?.length || 0} cours trouvé(s)`);
    console.log("");

    for (const course of courses || []) {
      console.log(`📚 ${course.label || course.name}`);
      console.log(`   🆔 ID: ${course.id}`);
      console.log(`   💰 Prix: ${course.price}€`);
      console.log(`   🏷️  Catégorie: ${course.category || "Non définie"}`);
      console.log(`   📊 Type: ${course.type || "Non défini"}`);
      console.log(`   📊 Statut: ${course.status || "Non défini"}`);
      console.log("");
    }
  } catch (error) {
    console.error("❌ Erreur générale:", error);
  }
}

// Fonction principale
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "family":
      const familyId = args[1];
      await debugFamilyData(familyId);
      break;
    case "school-years":
      await debugSchoolYears();
      break;
    case "courses":
      await debugCourses();
      break;
    case "all":
      console.log("🔍 DEBUG COMPLET");
      console.log("=".repeat(80));
      await debugSchoolYears();
      console.log("");
      await debugCourses();
      console.log("");
      await debugFamilyData();
      break;
    default:
      console.log("Usage:");
      console.log("  npm run debug-family-data family [family-id]  - Debug une famille spécifique");
      console.log("  npm run debug-family-data school-years        - Debug les années scolaires");
      console.log("  npm run debug-family-data courses             - Debug les cours");
      console.log("  npm run debug-family-data all                 - Debug complet");
      break;
  }
}

main().catch(console.error);
