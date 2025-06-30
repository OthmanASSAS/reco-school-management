import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function seed() {
  console.log("🧪 Démarrage du seed...");

  await supabase.from("students").delete().neq("id", 0);
  await supabase.from("families").delete().neq("id", 0);

  const families = [
    {
      first_name: "Sophie",
      last_name: "Martin",
      email: "parent.martin@email.com",
      phone: "0612345678",
      address: "12 rue des Lilas",
      postal_code: "75012",
      city: "Paris",
    },
    {
      first_name: "Marc",
      last_name: "Dubois",
      email: "marc.dubois@email.com",
      phone: "0698765432",
      address: "4 avenue Jean Jaurès",
      postal_code: "69007",
      city: "Lyon",
    },
  ];

  const { data: insertedFamilies, error: familyError } = await supabase
    .from("families")
    .insert(families)
    .select();

  if (familyError || !insertedFamilies) {
    console.error("❌ Erreur lors de l'insertion des familles :", familyError);
    return process.exit(1);
  }

  console.log("✅ Familles insérées");

  const students = [
    {
      first_name: "Lucas",
      last_name: "Martin",
      age: 6,
      course: "CP-B",
      level: "CP",
      registration_type: "enfant",
      payment_status: "paid",
      family_id: insertedFamilies[0].id,
    },
    {
      first_name: "Emma",
      last_name: "Martin",
      age: 10,
      course: "CM2-B",
      level: "CM2",
      registration_type: "enfant",
      payment_status: "pending",
      family_id: insertedFamilies[0].id,
    },
    {
      first_name: "Marie",
      last_name: "Dubois",
      age: 35,
      course: "Anglais Adultes",
      level: "Adulte",
      registration_type: "adulte",
      payment_status: "paid",
      family_id: insertedFamilies[1].id,
    },
  ];

  const { error: studentError } = await supabase.from("students").insert(students);

  if (studentError) {
    console.error("❌ Erreur lors de l'insertion des élèves :", studentError);
    return process.exit(1);
  }

  console.log("✅ Étudiants insérés avec succès");
  process.exit(0);
}

seed();
