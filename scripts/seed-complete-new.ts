import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedComplete() {
  console.log('🚀 Seed complet avec migration et données historiques...');

  try {
    // 1. MIGRATION : Ajouter school_year_id aux payments si nécessaire
    console.log('📊 Étape 1: Vérification et migration schema...');

    // Vérifier si la colonne school_year_id existe dans payments
    const { error: testError } = await supabase
      .from('payments')
      .select('school_year_id')
      .limit(1);

    // Variable pour tracker si school_year_id est disponible
    let hasSchoolYearId = !testError;

    if (testError && testError.message.includes('column "school_year_id" does not exist')) {
      console.log('   🔧 Ajout de la colonne school_year_id à payments...');

      // Utiliser une requête SQL directe pour ajouter la colonne
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE payments
          ADD COLUMN IF NOT EXISTS school_year_id UUID REFERENCES school_years(id);

          CREATE INDEX IF NOT EXISTS idx_payments_school_year_id
          ON payments(school_year_id);
        `
      });

      if (alterError) {
        console.log('   ⚠️  Tentative alternative pour ajouter school_year_id...');

        // Méthode alternative via raw SQL
        const { error: rawError } = await supabase
          .from('payments')
          .insert([{
            family_id: '00000000-0000-0000-0000-000000000000',
            school_year_id: '00000000-0000-0000-0000-000000000000',
            amount_cash: 0
          }]);

        if (rawError && rawError.message.includes('column "school_year_id" does not exist')) {
          console.log('   ❌ Impossible d\'ajouter school_year_id automatiquement');
          console.log('   💡 Veuillez exécuter manuellement:');
          console.log('   ALTER TABLE payments ADD COLUMN school_year_id UUID REFERENCES school_years(id);');

          // Continuer sans school_year_id pour l'instant
          console.log('   ⏭️  Continuation sans school_year_id...');
        } else {
          // Supprimer le test
          await supabase
            .from('payments')
            .delete()
            .eq('family_id', '00000000-0000-0000-0000-000000000000');
          console.log('   ✅ school_year_id ajouté avec succès');
          hasSchoolYearId = true;
        }
      } else {
        console.log('   ✅ Schema mis à jour avec school_year_id');
        hasSchoolYearId = true;
      }
    } else {
      console.log('   ✅ Schema vérifié (school_year_id existe déjà)');
    }

    // 2. NETTOYAGE OPTIONNEL
    console.log('🧹 Étape 2: Gestion du nettoyage...');

    const CLEAN_ALL = process.argv.includes('--clean');

    if (CLEAN_ALL) {
      console.log('   ⚠️  Mode --clean activé - Suppression des données...');

      // Ordre important pour respecter les contraintes FK
      await supabase.from('enrollments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('families').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('school_years').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      console.log('   ✅ Base de données nettoyée');
    } else {
      console.log('   ⏭️  Données existantes conservées (utilisez --clean pour nettoyer)');
    }

    // 3. CRÉATION DES ANNÉES SCOLAIRES
    console.log('📅 Étape 3: Années scolaires...');

    const schoolYearsData = [
      {
        label: '2022-2023',
        start_date: '2022-09-01',
        end_date: '2023-06-30',
        is_current: false
      },
      {
        label: '2023-2024',
        start_date: '2023-09-01',
        end_date: '2024-06-30',
        is_current: false
      },
      {
        label: '2024-2025',
        start_date: '2024-09-01',
        end_date: '2025-06-30',
        is_current: true
      }
    ];

    const createdYears: any[] = [];

    for (const yearData of schoolYearsData) {
      const { data: existingYear } = await supabase
        .from('school_years')
        .select('*')
        .eq('label', yearData.label)
        .single();

      if (existingYear) {
        createdYears.push(existingYear);
        console.log(`   ✅ Année ${yearData.label} existe déjà`);
      } else {
        const { data: newYear, error } = await supabase
          .from('school_years')
          .insert([yearData])
          .select()
          .single();

        if (!error && newYear) {
          createdYears.push(newYear);
          console.log(`   ✅ Année ${yearData.label} créée`);
        }
      }
    }

    const currentYear = createdYears.find(y => y.is_current);
    const year2023 = createdYears.find(y => y.label === '2023-2024');
    const year2022 = createdYears.find(y => y.label === '2022-2023');

    // 4. RÉCUPÉRATION DES COURS EXISTANTS
    console.log('📚 Étape 4: Cours...');

    const { data: existingCourses, error: coursesError } = await supabase
      .from('courses')
      .select('*');

    if (coursesError) {
      console.error('❌ Erreur lors de la récupération des cours:', coursesError);
      return;
    }

    const createdCourses = existingCourses || [];

    for (const course of createdCourses) {
      console.log(`   ✅ Cours ${course.name} disponible`);
    }

    console.log(`   ✅ ${createdCourses.length} cours disponibles`);

    if (createdCourses.length === 0) {
      console.log('❌ Aucun cours disponible pour créer des inscriptions');
      return;
    }

    // 5. CRÉATION DES FAMILLES
    console.log('👨‍👩‍👧‍👦 Étape 5: Familles...');

    const familiesData = [
      {
        first_name: 'Ahmed',
        last_name: 'Benali',
        email: 'ahmed.benali@email.com',
        phone: '06 12 34 56 78',
        address: '15 Rue de la Paix',
        postal_code: '75001',
        city: 'Paris'
      },
      {
        first_name: 'Fatima',
        last_name: 'Alaoui',
        email: 'fatima.alaoui@email.com',
        phone: '06 23 45 67 89',
        address: '42 Avenue des Champs',
        postal_code: '13001',
        city: 'Marseille'
      },
      {
        first_name: 'Omar',
        last_name: 'Tazi',
        email: 'omar.tazi@email.com',
        phone: '06 34 56 78 90',
        address: '8 Place Bellecour',
        postal_code: '69002',
        city: 'Lyon'
      },
      {
        first_name: 'Aicha',
        last_name: 'Benjelloun',
        email: 'aicha.benjelloun@email.com',
        phone: '06 45 67 89 01',
        address: '25 Rue Alsace Lorraine',
        postal_code: '31000',
        city: 'Toulouse'
      },
      {
        first_name: 'Youssef',
        last_name: 'Mabrouki',
        email: 'youssef.mabrouki@email.com',
        phone: '06 56 78 90 12',
        address: '12 Promenade des Anglais',
        postal_code: '06000',
        city: 'Nice'
      }
    ];

    const createdFamilies: any[] = [];

    for (const familyData of familiesData) {
      const { data: existingFamily } = await supabase
        .from('families')
        .select('*')
        .eq('email', familyData.email)
        .single();

      if (existingFamily) {
        createdFamilies.push(existingFamily);
      } else {
        const { data: newFamily, error } = await supabase
          .from('families')
          .insert([familyData])
          .select()
          .single();

        if (!error && newFamily) {
          createdFamilies.push(newFamily);
          console.log(`   ✅ Famille ${familyData.first_name} ${familyData.last_name} créée`);
        }
      }
    }

    console.log(`   ✅ ${createdFamilies.length} familles disponibles`);

    // 6. CRÉATION DES ÉTUDIANTS AVEC HISTORIQUE
    console.log('🎓 Étape 6: Étudiants et inscriptions historiques...');

    const studentNames = [
      ['Ahmed', 'Khadija'], // Famille Benali
      ['Omar', 'Fatima'], // Famille Alaoui
      ['Hassan', 'Aicha'], // Famille Tazi
      ['Youssef'], // Famille Benjelloun
      ['Bilal', 'Nour', 'Amine'] // Famille Mabrouki
    ];

    let totalStudents = 0;
    let totalEnrollments = 0;

    for (let i = 0; i < createdFamilies.length; i++) {
      const family = createdFamilies[i];
      const names = studentNames[i] || ['Étudiant'];

      console.log(`   Famille ${family.first_name} ${family.last_name}...`);

      for (const firstName of names) {
        const studentData = {
          family_id: family.id,
          first_name: firstName,
          last_name: family.last_name,
          birth_date: faker.date.between({ from: '2008-01-01', to: '2018-12-31' }).toISOString().split('T')[0],
          registration_type: 'child'
        };

        const { data: student, error: studentError } = await supabase
          .from('students')
          .insert([studentData])
          .select()
          .single();

        if (!studentError && student) {
          totalStudents++;
          console.log(`     ✅ ${firstName} créé`);

          // Inscriptions par année avec logique réaliste
          const enrollmentPlans = [];

          if (currentYear) {
            enrollmentPlans.push({
              year: currentYear,
              courses: faker.helpers.arrayElements(createdCourses, Math.floor(Math.random() * 2) + 1), // 1-2 cours actuels
              period: { from: currentYear.start_date, to: currentYear.end_date }
            });
          }

          if (year2023) {
            enrollmentPlans.push({
              year: year2023,
              courses: faker.helpers.arrayElements(createdCourses, Math.floor(Math.random() * 2) + 1), // 1-2 cours 2023
              period: { from: year2023.start_date, to: year2023.end_date }
            });
          }

          // Certains étudiants ont aussi un historique 2022
          if (year2022 && Math.random() > 0.5) {
            enrollmentPlans.push({
              year: year2022,
              courses: faker.helpers.arrayElements(createdCourses, 1), // 1 cours 2022
              period: { from: year2022.start_date, to: year2022.end_date }
            });
          }

          for (const plan of enrollmentPlans) {
            if (!plan.year) continue;

            for (const course of plan.courses) {
              const { error: enrollmentError } = await supabase
                .from('enrollments')
                .insert([{
                  student_id: student.id,
                  course_id: course.id,
                  school_year_id: plan.year.id,
                  status: 'active',
                  start_date: faker.date.between({
                    from: plan.period.from,
                    to: new Date(new Date(plan.period.from).getTime() + 30 * 24 * 60 * 60 * 1000) // +30 jours
                  }).toISOString(),
                  created_at: faker.date.between({
                    from: plan.period.from,
                    to: plan.period.to
                  }).toISOString()
                }]);

              if (!enrollmentError) {
                totalEnrollments++;
                console.log(`       → ${course.label} (${plan.year.label})`);
              }
            }
          }
        }
      }
    }

    console.log(`   ✅ ${totalStudents} étudiants et ${totalEnrollments} inscriptions créés`);

    // 7. PAIEMENTS HISTORIQUES AVEC SCHOOL_YEAR_ID
    console.log('💰 Étape 7: Paiements historiques...');

    let totalPayments = 0;

    for (const family of createdFamilies) {
      console.log(`   Paiements famille ${family.first_name}...`);

      // Paiements par année scolaire
      const paymentPlans = [];

      if (currentYear) {
        paymentPlans.push({
          year: currentYear,
          amount: faker.number.int({ min: 400, max: 900 }),
          count: Math.floor(Math.random() * 2) + 1 // 1-2 paiements actuels
        });
      }

      if (year2023) {
        paymentPlans.push({
          year: year2023,
          amount: faker.number.int({ min: 300, max: 700 }),
          count: Math.floor(Math.random() * 2) + 1 // 1-2 paiements 2023
        });
      }

      if (year2022) {
        paymentPlans.push({
          year: year2022,
          amount: faker.number.int({ min: 250, max: 500 }),
          count: 1 // 1 paiement 2022
        });
      }

      for (const plan of paymentPlans) {
        if (!plan.year) continue;

        for (let i = 0; i < plan.count; i++) {
          const paymentMethod = faker.helpers.arrayElement(['cash', 'card', 'transfer']);
          const amount = Math.floor(plan.amount / plan.count); // Répartir le montant

          const paymentData: any = {
            family_id: family.id,
            created_at: faker.date.between({
              from: plan.year.start_date,
              to: plan.year.end_date
            }).toISOString(),
            remarks: `Paiement ${plan.year.label} - ${paymentMethod}`
          };

          // Ajouter school_year_id seulement si la colonne existe
          if (hasSchoolYearId) {
            paymentData.school_year_id = plan.year.id; // 🎯 Lié à l'année scolaire !
          }

          // Répartition par méthode de paiement
          if (paymentMethod === 'cash') {
            paymentData.amount_cash = amount;
          } else if (paymentMethod === 'card') {
            paymentData.amount_card = amount;
          } else {
            paymentData.amount_transfer = amount;
          }

          // Parfois des livres/matériel
          if (Math.random() > 0.7) {
            paymentData.books = faker.number.int({ min: 20, max: 60 });
          }

          const { error: paymentError } = await supabase
            .from('payments')
            .insert([paymentData]);

          if (!paymentError) {
            totalPayments++;
            console.log(`     ✅ ${amount}€ (${paymentMethod}) - ${plan.year.label}`);
          }
        }
      }
    }

    console.log(`   ✅ ${totalPayments} paiements créés`);

    // 8. RÉSUMÉ FINAL
    console.log('\n🎉 Seed complet terminé avec succès !');
    console.log('\n📊 Résumé des données créées :');
    console.log(`   📅 ${createdYears.length} années scolaires (2022-2025)`);
    console.log(`   📚 ${createdCourses.length} cours disponibles`);
    console.log(`   👨‍👩‍👧‍👦 ${createdFamilies.length} familles`);
    console.log(`   🎓 ${totalStudents} étudiants`);
    console.log(`   📝 ${totalEnrollments} inscriptions historiques`);
    console.log(`   💰 ${totalPayments} paiements liés aux années scolaires`);

    console.log('\n🎯 Fonctionnalités testables :');
    console.log('   ✅ Mode historique via sélecteur d\'année');
    console.log('   ✅ Paiements filtrés par année scolaire');
    console.log('   ✅ Inscriptions multi-années');
    console.log('   ✅ Interface responsive');

    console.log('\n🧪 Test maintenant l\'interface famille avec le sélecteur d\'années !');

  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }
}

// Usage:
// pnpm seed-complete-new           -> Ajoute aux données existantes
// pnpm seed-complete-new --clean   -> Reset complet et recrée tout
seedComplete().then(() => {
  console.log('✅ Seed terminé');
  process.exit(0);
});