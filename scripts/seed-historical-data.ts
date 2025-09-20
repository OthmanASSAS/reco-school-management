import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedHistoricalData() {
  console.log('🕒 Création des données historiques...');

  try {
    // 1. Créer une année scolaire 2023-2024
    console.log('📅 Création de l\'année scolaire 2023-2024...');

    const { data: existingYear } = await supabase
      .from('school_years')
      .select('id')
      .eq('label', '2023-2024')
      .single();

    let historicalYearId: string;

    if (existingYear) {
      historicalYearId = existingYear.id;
      console.log('   Année 2023-2024 existe déjà, réutilisation...');
    } else {
      const { data: newYear, error: yearError } = await supabase
        .from('school_years')
        .insert([{
          label: '2023-2024',
          start_date: '2023-09-01',
          end_date: '2024-06-30',
          is_current: false
        }])
        .select()
        .single();

      if (yearError) throw yearError;
      historicalYearId = newYear.id;
      console.log('   ✅ Année 2023-2024 créée');
    }

    // 2. Récupérer quelques familles existantes
    console.log('👨‍👩‍👧‍👦 Récupération des familles existantes...');

    const { data: families, error: familiesError } = await supabase
      .from('families')
      .select('id, first_name, last_name')
      .limit(5);

    if (familiesError) throw familiesError;

    if (families.length === 0) {
      console.log('❌ Aucune famille trouvée. Veuillez d\'abord exécuter le seed principal.');
      return;
    }

    console.log(`   ✅ ${families.length} familles trouvées`);

    // 3. Récupérer les cours existants
    console.log('📚 Récupération des cours existants...');

    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, name, label, price')
      .limit(8);

    if (coursesError) throw coursesError;

    if (courses.length === 0) {
      console.log('❌ Aucun cours trouvé. Veuillez d\'abord exécuter le seed principal.');
      return;
    }

    console.log(`   ✅ ${courses.length} cours trouvés`);

    // 4. Créer des étudiants historiques et des inscriptions
    console.log('🎓 Création des inscriptions historiques...');

    for (const family of families) {
      console.log(`   Famille ${family.first_name} ${family.last_name}...`);

      // Récupérer les étudiants existants de cette famille
      const { data: existingStudents } = await supabase
        .from('students')
        .select('id, first_name, last_name')
        .eq('family_id', family.id);

      if (existingStudents && existingStudents.length > 0) {
        // Inscrire 1-2 étudiants existants à des cours historiques
        const studentsToEnroll = existingStudents.slice(0, Math.ceil(Math.random() * 2));

        for (const student of studentsToEnroll) {
          // Choisir 1-3 cours aléatoires
          const numCourses = Math.floor(Math.random() * 3) + 1;
          const selectedCourses = faker.helpers.arrayElements(courses, numCourses);

          for (const course of selectedCourses) {
            // Vérifier si l'inscription existe déjà
            const { data: existingEnrollment } = await supabase
              .from('enrollments')
              .select('id')
              .eq('student_id', student.id)
              .eq('course_id', course.id)
              .eq('school_year_id', historicalYearId)
              .single();

            if (!existingEnrollment) {
              const { error: enrollmentError } = await supabase
                .from('enrollments')
                .insert([{
                  student_id: student.id,
                  course_id: course.id,
                  school_year_id: historicalYearId,
                  status: 'active',
                  start_date: faker.date.between({
                    from: '2023-09-01',
                    to: '2023-09-30'
                  }).toISOString(),
                  created_at: faker.date.between({
                    from: '2023-09-01',
                    to: '2023-09-30'
                  }).toISOString()
                }]);

              if (enrollmentError) {
                console.log(`     ❌ Erreur inscription ${student.first_name} -> ${course.name}:`, enrollmentError.message);
              } else {
                console.log(`     ✅ ${student.first_name} inscrit à ${course.name}`);
              }
            }
          }
        }
      }

      // 5. Créer des paiements historiques pour cette famille
      const numPayments = Math.floor(Math.random() * 3) + 1; // 1-3 paiements

      for (let i = 0; i < numPayments; i++) {
        const paymentAmount = faker.number.int({ min: 100, max: 800 });
        const paymentMethod = faker.helpers.arrayElement(['cash', 'card', 'transfer']);

        const paymentData: any = {
          family_id: family.id,
          created_at: faker.date.between({
            from: '2023-09-01',
            to: '2024-06-30'
          }).toISOString(),
          remarks: faker.helpers.arrayElement([
            'Paiement année 2023-2024',
            'Rattrapage trimestre 2',
            'Paiement matériel inclus',
            'Réduction fratrie appliquée',
            null
          ])
        };

        // Répartir le montant selon la méthode
        if (paymentMethod === 'cash') {
          paymentData.amount_cash = paymentAmount;
        } else if (paymentMethod === 'card') {
          paymentData.amount_card = paymentAmount;
        } else {
          paymentData.amount_transfer = paymentAmount;
        }

        // Ajouter des livres/matériel parfois
        if (Math.random() > 0.7) {
          paymentData.books = faker.number.int({ min: 20, max: 80 });
        }

        const { error: paymentError } = await supabase
          .from('payments')
          .insert([paymentData]);

        if (paymentError) {
          console.log(`     ❌ Erreur paiement famille ${family.first_name}:`, paymentError.message);
        } else {
          console.log(`     ✅ Paiement ${paymentAmount}€ (${paymentMethod}) créé`);
        }
      }
    }

    // 6. Créer une année scolaire 2022-2023 (plus ancienne)
    console.log('📅 Création de l\'année scolaire 2022-2023...');

    const { data: existingOldYear } = await supabase
      .from('school_years')
      .select('id')
      .eq('label', '2022-2023')
      .single();

    let oldYearId: string;

    if (existingOldYear) {
      oldYearId = existingOldYear.id;
      console.log('   Année 2022-2023 existe déjà, réutilisation...');
    } else {
      const { data: newOldYear, error: oldYearError } = await supabase
        .from('school_years')
        .insert([{
          label: '2022-2023',
          start_date: '2022-09-01',
          end_date: '2023-06-30',
          is_current: false
        }])
        .select()
        .single();

      if (oldYearError) throw oldYearError;
      oldYearId = newOldYear.id;
      console.log('   ✅ Année 2022-2023 créée');
    }

    // 7. Ajouter quelques paiements pour 2022-2023 (données plus légères)
    console.log('💰 Ajout de paiements 2022-2023...');

    for (const family of families.slice(0, 3)) { // Seulement 3 familles
      const paymentAmount = faker.number.int({ min: 200, max: 600 });

      const { error: oldPaymentError } = await supabase
        .from('payments')
        .insert([{
          family_id: family.id,
          amount_transfer: paymentAmount,
          created_at: faker.date.between({
            from: '2022-09-01',
            to: '2023-06-30'
          }).toISOString(),
          remarks: 'Paiement année 2022-2023'
        }]);

      if (!oldPaymentError) {
        console.log(`   ✅ Paiement historique ${paymentAmount}€ pour ${family.first_name}`);
      }
    }

    console.log('\n🎉 Données historiques créées avec succès !');
    console.log('\n📋 Résumé :');
    console.log(`   • Année 2023-2024 : Inscriptions et paiements complets`);
    console.log(`   • Année 2022-2023 : Paiements historiques`);
    console.log(`   • ${families.length} familles avec historique`);
    console.log('\n🧪 Vous pouvez maintenant tester le mode historique dans l\'interface famille !');

  } catch (error) {
    console.error('❌ Erreur lors de la création des données historiques:', error);
    process.exit(1);
  }
}

// Exécution
seedHistoricalData().then(() => {
  console.log('✅ Script terminé');
  process.exit(0);
});