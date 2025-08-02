<<<<<<< HEAD
// scripts/seed.ts
=======
// scripts/seed.ts - Version réaliste pour école arabe/coran
>>>>>>> main
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";

<<<<<<< HEAD
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function main() {
  console.log("🧹 Cleanup tables...");
  const tables = [
    "schedules",
    "courses",
    "time_blocks",
    "students",
    "teachers",
    "rooms",
    "families",
  ];
  for (const t of tables) {
    await sb.from(t).delete().neq("id", "0");
  }

  console.log("👪 Insert familles...");
  const families = Array.from({ length: 10 }).map(() => ({
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    phone: "06" + faker.string.numeric(8),
    address: faker.location.streetAddress(),
    postal_code: faker.location.zipCode("#####"),
    city: faker.location.city(),
  }));
  const { data: fams } = await sb.from("families").insert(families).select();
  if (!fams) throw new Error("families error");

  console.log("🧍‍♂️ Insert enseignants...");
  const teachers = Array.from({ length: 5 }).map(() => ({
    full_name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number({}),
  }));
  const { data: profs } = await sb.from("teachers").insert(teachers).select();
  if (!profs) throw new Error("teachers error");

  console.log("🏫 Insert salles...");
  const rooms = Array.from({ length: 5 }).map((_, i) => ({
    name: `Salle ${i + 1}`,
    capacity: faker.number.int({ min: 10, max: 30 }),
    location: faker.location.city(),
  }));
  const { data: rms } = await sb.from("rooms").insert(rooms).select();
  if (!rms) throw new Error("rooms error");

  console.log("⏰ Insert créneaux...");
  const weekdays = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
  const timeBlocks = Array.from({ length: 7 }).map((_, i) => ({
    weekday: weekdays[i],
    start_time: "09:00",
    end_time: "10:30",
  }));
  const { data: tbs } = await sb.from("time_blocks").insert(timeBlocks).select();
  if (!tbs) throw new Error("time_blocks error");

  console.log("📚 Insert cours...");
  const courses = Array.from({ length: 5 }).map((_, i) => ({
    name: faker.word.words({ count: 2 }),
    type: i % 2 === 0 ? "enfants" : "adultes",
    teacher: profs[faker.number.int({ min: 0, max: profs.length - 1 })].full_name,
    schedule: "-",
    capacity: faker.number.int({ min: 5, max: 20 }),
    price: faker.number.float({ min: 100, max: 500, fractionDigits: 2 }),
    room_id: rms[faker.number.int({ min: 0, max: rms.length - 1 })].id,
    school_year_id: null,
  }));
  const { data: cs } = await sb.from("courses").insert(courses).select();
  if (!cs) throw new Error("courses error");

  console.log("👶 Insert élèves...");
  const students: any[] = [];
  fams.forEach(f => {
    const count = 2; // 2 élèves par famille
    for (let i = 0; i < count; i++) {
      const birth = faker.date.birthdate({ min: 3, max: 60, mode: "age" });
      students.push({
        family_id: f.id,
        last_name: faker.person.lastName(),
        first_name: faker.person.firstName(),
        birth_date: birth.toISOString().split("T")[0],
        level: null,
        registration_type: birth.getFullYear() > new Date().getFullYear() - 14 ? "adult" : "child",
        already_registered: false,
        notes: "",
      });
    }
  });
  const { data: studs } = await sb.from("students").insert(students).select();
  if (!studs) throw new Error("students error");

  console.log("📅 Insert emplois du temps...");
  const schedules = Array.from({ length: 10 }).map(() => ({
    course_id: cs[faker.number.int({ min: 0, max: cs.length - 1 })].id,
    time_block_id: tbs[faker.number.int({ min: 0, max: tbs.length - 1 })].id,
    room_id: rms[faker.number.int({ min: 0, max: rms.length - 1 })].id,
  }));
  await sb.from("schedules").insert(schedules);
  console.log("✅ Seed complete.");
=======
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;
const sb = createClient(supabaseUrl, supabaseServiceKey);

// --- Configuration réaliste ---
const NUM_FAMILIES = 8;
const NUM_STUDENTS_PER_FAMILY = 2; // 1-3 enfants par famille
const STANDARD_PRICE = 350; // Prix fixe pour tous les cours

// Données réalistes pour une école arabe/coran
const REALISTIC_DATA = {
  teachers: [
    { name: "Ustadh Ahmed Benali", email: "ahmed.benali@ecole.fr", phone: "06 12 34 56 78" },
    {
      name: "Ustadha Fatima Al-Maghribi",
      email: "fatima.almaghribi@ecole.fr",
      phone: "06 23 45 67 89",
    },
    { name: "Ustadh Omar Zouaoui", email: "omar.zouaoui@ecole.fr", phone: "06 34 56 78 90" },
    { name: "Ustadha Aisha Bennani", email: "aisha.bennani@ecole.fr", phone: "06 45 67 89 01" },
    { name: "Ustadh Youssef Talbi", email: "youssef.talbi@ecole.fr", phone: "06 56 78 90 12" },
  ],

  rooms: [
    { name: "Salle Al-Fatiha", capacity: 15, location: "Rez-de-chaussée" },
    { name: "Salle Al-Baqarah", capacity: 20, location: "1er étage" },
    { name: "Salle An-Nour", capacity: 12, location: "1er étage" },
    { name: "Salle As-Sabr", capacity: 18, location: "2ème étage" },
    { name: "Salle Al-Hikmah", capacity: 25, location: "2ème étage" },
  ],

  courses: [
    // Cours d'Arabe
    {
      name: "Arabe 1",
      label: "Arabe Débutant",
      type: "enfants",
      category: "Arabe",
      description: "Initiation à l'alphabet arabe et premiers mots",
    },
    {
      name: "Arabe 2",
      label: "Arabe Élémentaire",
      type: "enfants",
      category: "Arabe",
      description: "Lecture de mots simples et phrases courtes",
    },
    {
      name: "Arabe 3",
      label: "Arabe Intermédiaire",
      type: "enfants",
      category: "Arabe",
      description: "Lecture fluide et expression écrite",
    },
    {
      name: "Arabe Adulte 1",
      label: "Arabe Adulte Débutant",
      type: "adultes",
      category: "Arabe",
      description: "Apprentissage de l'arabe pour adultes",
    },
    {
      name: "Arabe Adulte 2",
      label: "Arabe Adulte Avancé",
      type: "adultes",
      category: "Arabe",
      description: "Perfectionnement en arabe littéraire",
    },

    // Cours de Coran
    {
      name: "Coran 1",
      label: "Coran Débutant",
      type: "enfants",
      category: "Coran",
      description: "Apprentissage du Tajwid et courtes sourates",
    },
    {
      name: "Coran 2",
      label: "Coran Intermédiaire",
      type: "enfants",
      category: "Coran",
      description: "Mémorisation et perfectionnement",
    },
    {
      name: "Coran 3",
      label: "Coran Avancé",
      type: "enfants",
      category: "Coran",
      description: "Hafs et règles avancées",
    },
    {
      name: "Coran Adulte",
      label: "Coran pour Adultes",
      type: "adultes",
      category: "Coran",
      description: "Lecture coranique et Tajwid pour adultes",
    },

    // Cours spécialisés
    {
      name: "Maternelle",
      label: "Éveil Islamique",
      type: "enfants",
      category: "Maternelle",
      description: "Éveil religieux pour les tout-petits",
    },
    {
      name: "Soutien",
      label: "Soutien Scolaire",
      type: "enfants",
      category: "Scolaire",
      description: "Aide aux devoirs et soutien",
    },
  ],

  // Noms de familles arabes/musulmanes réalistes
  arabicFamilyNames: [
    "Al-Maghribi",
    "Benali",
    "Zouaoui",
    "Bennani",
    "Talbi",
    "El-Fassi",
    "Alami",
    "Berrada",
    "Cherkaoui",
    "Tazi",
    "Bennaceur",
    "Sebti",
    "Andaloussi",
    "Chraibi",
    "Lahlou",
    "Mekouar",
  ],

  arabicFirstNames: {
    boys: [
      "Ahmed",
      "Mohammed",
      "Omar",
      "Youssef",
      "Hamza",
      "Adam",
      "Ayoub",
      "Ismail",
      "Bilal",
      "Zakaria",
    ],
    girls: [
      "Fatima",
      "Aisha",
      "Khadija",
      "Maryam",
      "Hafsa",
      "Zeinab",
      "Salma",
      "Nour",
      "Aya",
      "Lina",
    ],
  },

  // Périodes de cours réalistes - 4 années pour tester le filtrage
  schoolPeriods: [
    { label: "2022-2023", start: "2022-09-01", end: "2023-06-30" },
    { label: "2023-2024", start: "2023-09-01", end: "2024-06-30" },
    { label: "2024-2025", start: "2024-09-01", end: "2025-06-30" },
    { label: "2025-2026", start: "2025-09-01", end: "2026-06-30" },
  ],
};

async function main() {
  // Nettoyage (votre code existant est bon)
  const tablesToClean = [
    "schedules",
    "registrations",
    "payments",
    "appointments",
    "enrollments",
    "course_instances",
    "courses",
    "students",
    "families",
    "teachers",
    "rooms",
    "time_blocks",
    "time_slots",
    "school_years",
    "appointment_days",
  ];

  console.log("🧹 Cleaning up tables...");
  for (const t of tablesToClean) {
    try {
      const { error } = await sb.from(t).delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) {
        console.error(`   ❌ Error cleaning ${t}:`, error);
      } else {
        console.log(`   ✅ Cleaned ${t}`);
      }
    } catch (error) {
      console.error(`   💥 Critical error cleaning ${t}:`, error);
    }
  }

  console.log("🌱 Inserting realistic data for Islamic school...");

  // --- 0. Migration: Add school_year_id to enrollments table ---
  console.log("🔧 Running migrations...");

  // Vérifier si la colonne existe déjà en essayant de la sélectionner
  try {
    const { data: testQuery } = await sb.from("enrollments").select("school_year_id").limit(1);

    // Si on arrive ici, la colonne existe
    console.log("   ✅ school_year_id column already exists in enrollments table");
  } catch (error) {
    // Si on a une erreur, la colonne n'existe pas
    console.log("   📝 Adding school_year_id column to enrollments table...");
    console.log("   ⚠️  Please run this SQL manually in your Supabase dashboard:");
    console.log(
      "   ALTER TABLE enrollments ADD COLUMN school_year_id UUID REFERENCES school_years(id);"
    );
    console.log("   Then restart the seed script.");
    process.exit(1);
  }

  // --- 1. Insert School Years ---
  const schoolYears = REALISTIC_DATA.schoolPeriods.map(period => ({
    id: faker.string.uuid(),
    label: period.label,
    start_date: period.start,
    end_date: period.end,
    created_at: new Date().toISOString(),
  }));

  const { data: schoolYearsData } = await sb.from("school_years").insert(schoolYears).select();
  console.log(`   📅 Inserted ${schoolYearsData?.length} school years`);

  // Mettre à jour les enrollments existants avec school_year_id si nécessaire
  console.log("   🔄 Updating existing enrollments with school_year_id...");
  const { data: existingEnrollments } = await sb
    .from("enrollments")
    .select("id, start_date, school_year_id")
    .is("school_year_id", null);

  if (existingEnrollments && existingEnrollments.length > 0) {
    console.log(
      `   📝 Found ${existingEnrollments.length} enrollments without school_year_id, updating...`
    );

    for (const enrollment of existingEnrollments) {
      const enrollmentYear = new Date(enrollment.start_date).getFullYear();
      const schoolYear = schoolYearsData!.find(y => {
        const yearStart = new Date(y.start_date).getFullYear();
        return yearStart === enrollmentYear;
      });

      if (schoolYear) {
        await sb
          .from("enrollments")
          .update({ school_year_id: schoolYear.id })
          .eq("id", enrollment.id);
      }
    }
    console.log("   ✅ Updated existing enrollments with school_year_id");
  } else {
    console.log("   ✅ All enrollments already have school_year_id");
  }

  // --- 2. Insert Realistic Teachers ---
  const teachers = REALISTIC_DATA.teachers.map(teacher => ({
    id: faker.string.uuid(),
    full_name: teacher.name,
    email: teacher.email,
    phone: teacher.phone,
    created_at: new Date().toISOString(),
  }));

  const { data: teachersData } = await sb.from("teachers").insert(teachers).select();
  console.log(`   👨‍🏫 Inserted ${teachersData?.length} teachers`);

  // --- 3. Insert Realistic Rooms ---
  const rooms = REALISTIC_DATA.rooms.map(room => ({
    id: faker.string.uuid(),
    name: room.name,
    capacity: room.capacity,
    location: room.location,
    created_at: new Date().toISOString(),
  }));

  const { data: roomsData } = await sb.from("rooms").insert(rooms).select();
  console.log(`   🏫 Inserted ${roomsData?.length} rooms`);

  // --- 4. Insert Realistic Families ---
  const families = Array.from({ length: NUM_FAMILIES }).map(() => {
    const familyName = faker.helpers.arrayElement(REALISTIC_DATA.arabicFamilyNames);
    const fatherName = faker.helpers.arrayElement(REALISTIC_DATA.arabicFirstNames.boys);

    return {
      id: faker.string.uuid(),
      first_name: fatherName,
      last_name: familyName,
      email: `${fatherName.toLowerCase()}.${familyName.toLowerCase().replace("-", "")}@gmail.com`,
      phone: `06 ${faker.string.numeric(2)} ${faker.string.numeric(2)} ${faker.string.numeric(2)} ${faker.string.numeric(2)}`,
      address: `${faker.location.streetAddress()}, ${faker.location.city()}`,
      postal_code: faker.location.zipCode(),
      city: faker.helpers.arrayElement(["Paris", "Lyon", "Marseille", "Lille", "Toulouse"]),
      created_at: new Date().toISOString(),
    };
  });

  const { data: familiesData } = await sb.from("families").insert(families).select();
  console.log(`   👨‍👩‍👧‍👦 Inserted ${familiesData?.length} families`);

  // --- 5. Insert Realistic Courses ---
  const courses = REALISTIC_DATA.courses.map(course => ({
    id: faker.string.uuid(),
    name: course.name,
    label: course.label,
    type: course.type,
    category: course.category,
    teacher_id: faker.helpers.arrayElement(teachersData!).id,
    room_id: faker.helpers.arrayElement(roomsData!).id,
    school_year_id: faker.helpers.arrayElement(schoolYearsData!).id,
    schedule: `${faker.helpers.arrayElement(["Mercredi", "Samedi", "Dimanche"])} ${faker.helpers.arrayElement(["9h-11h", "14h-16h", "16h-18h"])}`,
    capacity: faker.number.int({ min: 12, max: 20 }),
    price: STANDARD_PRICE, // Prix fixe
    status: "active",
    audience: faker.helpers.arrayElement(["Hommes", "Femmes", "Mixte"]),
    created_at: new Date().toISOString(),
  }));

  const { data: coursesData } = await sb.from("courses").insert(courses).select();
  console.log(`   📚 Inserted ${coursesData?.length} courses`);

  // --- 6. Insert Realistic Students ---
  const students = familiesData!.flatMap(family => {
    const numStudents = faker.number.int({ min: 1, max: 3 });
    const familyStudents = [];

    for (let i = 0; i < numStudents; i++) {
      const isGirl = faker.datatype.boolean();
      const firstName = isGirl
        ? faker.helpers.arrayElement(REALISTIC_DATA.arabicFirstNames.girls)
        : faker.helpers.arrayElement(REALISTIC_DATA.arabicFirstNames.boys);

      const age = faker.number.int({ min: 4, max: 16 });
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - age);

      familyStudents.push({
        id: faker.string.uuid(),
        family_id: family.id,
        first_name: firstName,
        last_name: family.last_name,
        birth_date: birthDate.toISOString().split("T")[0],
        registration_type: age < 14 ? "child" : "adult",
        level: faker.helpers.arrayElement(["Débutant", "Élémentaire", "Intermédiaire", "Avancé"]),
        already_registered: faker.datatype.boolean({ probability: 0.3 }),
        notes: faker.helpers.arrayElement([
          "Élève assidu et motivé",
          "Besoin d'encouragements",
          "Très bon niveau",
          "Première année",
          "",
        ]),
        created_at: faker.date
          .between({
            from: new Date("2023-09-01"),
            to: new Date(),
          })
          .toISOString(),
      });
    }

    return familyStudents;
  });

  const { data: studentsData } = await sb.from("students").insert(students).select();
  console.log(`   🎓 Inserted ${studentsData?.length} students`);

  // --- 7. Insert Realistic Enrollments (avec historique) ---
  type EnrollmentToInsert = {
    id: string;
    student_id: string;
    course_id: string;
    school_year_id: string;
    start_date: string;
    end_date: string | null;
    status: "active" | "finished";
    created_at: string;
  };

  // Répartir les familles sur les différentes années scolaires
  // Certaines familles restent plusieurs années (plus réaliste)
  const familyYearDistribution = [
    { year: "2022-2023", familyCount: 3 }, // 3 familles (début)
    { year: "2023-2024", familyCount: 4 }, // 4 familles (2 nouvelles + 2 qui continuent)
    { year: "2024-2025", familyCount: 5 }, // 5 familles (1 nouvelle + 4 qui continuent)
    { year: "2025-2026", familyCount: 6 }, // 6 familles (1 nouvelle + 5 qui continuent)
  ];

  console.log("🔍 Family year distribution:", familyYearDistribution);
  console.log("🔍 Total families:", NUM_FAMILIES);
  console.log("🔍 Students per family:", NUM_STUDENTS_PER_FAMILY);
  console.log("🔍 Total students:", studentsData!.length);

  const enrollments = studentsData!.flatMap((student, studentIndex) => {
    const studentAge = new Date().getFullYear() - new Date(student.birth_date).getFullYear();
    const studentEnrollments: EnrollmentToInsert[] = [];

    // Déterminer les années scolaires pour cette famille (plusieurs années possibles)
    const familyIndex = Math.floor(studentIndex / NUM_STUDENTS_PER_FAMILY);

    // Logique pour déterminer les années de la famille
    let familyYears: string[] = [];

    // Familles 0-2 : commencent en 2022-2023 et continuent
    if (familyIndex <= 2) {
      familyYears = ["2022-2023", "2023-2024", "2024-2025", "2025-2026"];
    }
    // Familles 3-4 : commencent en 2023-2024 et continuent
    else if (familyIndex <= 4) {
      familyYears = ["2023-2024", "2024-2025", "2025-2026"];
    }
    // Familles 5-6 : commencent en 2024-2025 et continuent
    else if (familyIndex <= 6) {
      familyYears = ["2024-2025", "2025-2026"];
    }
    // Familles 7+ : commencent en 2025-2026
    else {
      familyYears = ["2025-2026"];
    }

    // Log pour debug
    if (studentIndex % NUM_STUDENTS_PER_FAMILY === 0) {
      console.log(`🔍 Family ${familyIndex}: assigned to years ${familyYears.join(", ")}`);
    }

    // Cours appropriés selon l'âge et le type
    const appropriateCourses = coursesData!.filter(course => {
      if (studentAge <= 6) return course.category === "Maternelle";
      if (studentAge >= 14) return course.type === "adultes";
      return course.type === "enfants";
    });

    // Nombre de cours selon l'âge (1-3 cours) - éviter les doublons
    const numCourses =
      studentAge <= 6
        ? 1
        : faker.number.int({ min: 1, max: Math.min(3, appropriateCourses.length) });
    const selectedCourses = faker.helpers.arrayElements(appropriateCourses, numCourses);

    // Créer des enrollments pour chaque année de la famille avec des cours différents
    familyYears.forEach((familyYear, yearIndex) => {
      // Sélectionner des cours différents pour chaque année (progression)
      const yearCourses = appropriateCourses.slice(yearIndex, yearIndex + 2);
      if (yearCourses.length === 0) return;

      yearCourses.forEach(course => {
        const schoolYearId = schoolYearsData!.find(y => y.label === familyYear)?.id;
        if (schoolYearId) {
          const courseDuration = faker.helpers.arrayElement([
            { months: 3, endDate: `${familyYear.split("-")[1]}-12-01` },
            { months: 6, endDate: `${familyYear.split("-")[1]}-03-01` },
            { months: 9, endDate: `${familyYear.split("-")[1]}-06-01` },
            { months: 12, endDate: null },
          ]);

          const startDate = `${familyYear.split("-")[0]}-09-01`;
          const status =
            familyYear === "2024-2025" || familyYear === "2025-2026" ? "active" : "finished";

          studentEnrollments.push({
            id: faker.string.uuid(),
            student_id: student.id,
            course_id: course.id,
            school_year_id: schoolYearId,
            start_date: startDate,
            end_date: courseDuration.endDate,
            status: status,
            created_at: new Date(startDate).toISOString(),
          });
        }
      });
    });

    return studentEnrollments;
  });

  const { data: enrollmentsData, error: enrollmentsError } = await sb
    .from("enrollments")
    .insert(enrollments)
    .select();
  if (enrollmentsError) {
    console.error("   ❌ Error inserting enrollments:", enrollmentsError);
    console.log("   📝 Enrollments to insert:", enrollments.length);
  } else {
    console.log(`   📝 Inserted ${enrollmentsData?.length || 0} enrollments (with history)`);
  }

  // --- 7. Insert Payments (sans school_year_id pour l'instant) ---
  console.log("   💰 Creating payments...");

  const payments = familiesData!.flatMap(family => {
    const familyPayments: any[] = [];

    // Déterminer les années de la famille (même logique que pour les enrollments)
    const familyIndex = familiesData!.findIndex(f => f.id === family.id);
    let familyYears: string[] = [];

    // Familles 0-2 : commencent en 2022-2023 et continuent
    if (familyIndex <= 2) {
      familyYears = ["2022-2023", "2023-2024", "2024-2025", "2025-2026"];
    }
    // Familles 3-4 : commencent en 2023-2024 et continuent
    else if (familyIndex <= 4) {
      familyYears = ["2023-2024", "2024-2025", "2025-2026"];
    }
    // Familles 5-6 : commencent en 2024-2025 et continuent
    else if (familyIndex <= 6) {
      familyYears = ["2024-2025", "2025-2026"];
    }
    // Familles 7+ : commencent en 2025-2026
    else {
      familyYears = ["2025-2026"];
    }

    // Créer des paiements pour chaque année de la famille
    familyYears.forEach(year => {
      const schoolYearId = schoolYearsData!.find(y => y.label === year)?.id;
      if (!schoolYearId) return;

      // Créer 1-3 paiements pour cette année
      const numPayments = faker.number.int({ min: 1, max: 3 });
      const months = [
        `${year.split("-")[0]}-09`,
        `${year.split("-")[0]}-12`,
        `${year.split("-")[1]}-03`,
        `${year.split("-")[1]}-06`,
      ];

      for (let i = 0; i < numPayments; i++) {
        const paymentMonth = faker.helpers.arrayElement(months);
        const paymentDate = `${paymentMonth}-${faker.number.int({ min: 1, max: 28 })}`;
        const paymentAmount = faker.number.int({ min: 100, max: 500 });

        familyPayments.push({
          id: faker.string.uuid(),
          family_id: family.id,
          // school_year_id sera ajouté plus tard
          amount_cash: faker.datatype.boolean({ probability: 0.3 })
            ? faker.number.int({ min: 50, max: paymentAmount })
            : 0,
          amount_card: faker.datatype.boolean({ probability: 0.4 })
            ? faker.number.int({ min: 50, max: paymentAmount })
            : 0,
          amount_transfer: faker.datatype.boolean({ probability: 0.2 })
            ? faker.number.int({ min: 50, max: paymentAmount })
            : 0,
          refund_amount: faker.datatype.boolean({ probability: 0.1 })
            ? faker.number.int({ min: 10, max: 50 })
            : 0,
          books: faker.datatype.boolean({ probability: 0.2 }),
          remarks: faker.datatype.boolean({ probability: 0.3 }) ? faker.lorem.sentence() : null,
          cheques: faker.datatype.boolean({ probability: 0.3 })
            ? JSON.stringify([
                {
                  nom: family.last_name,
                  banque: faker.helpers.arrayElement([
                    "Société Générale",
                    "BNP Paribas",
                    "Crédit Agricole",
                    "Banque Populaire",
                  ]),
                  count: faker.number.int({ min: 1, max: 3 }),
                  amount: faker.number.int({ min: 50, max: 200 }),
                },
              ])
            : null,
          created_at: new Date(paymentDate).toISOString(),
        });
      }
    });

    return familyPayments;
  });

  const { data: paymentsData, error: paymentsError } = await sb
    .from("payments")
    .insert(payments)
    .select();

  if (paymentsError) {
    console.error("   ❌ Error inserting payments:", paymentsError);
  } else {
    console.log(`   💰 Inserted ${paymentsData?.length || 0} payments across school years`);
  }

  // --- 8. Insert Settings ---
  const settings = [
    { key: "course_discount", value: JSON.stringify({ mode: "cumulative", step: 25, startAt: 3 }) },
  ];

  await sb.from("settings").upsert(settings, { onConflict: "key" });
  console.log(`   ⚙️ Upserted settings`);

  console.log("✅ Realistic Islamic school data seeded successfully!");

  // --- 9. COMPLÉTER LES DONNÉES (Assigner profs/salles + horaires) ---
  console.log("\n🔧 Complétion des données...");

  // Assigner professeurs et salles aux cours
  console.log("👨‍🏫 Assignation des professeurs et salles...");
  const { data: allCourses } = await sb
    .from("courses")
    .select("id, name, type, teacher_id, room_id");
  const { data: allTeachers } = await sb.from("teachers").select("id, full_name");
  const { data: allRooms } = await sb.from("rooms").select("id, name");

  for (const course of allCourses || []) {
    const updates: any = {};
    let hasUpdates = false;

    // Assigner un professeur si pas déjà assigné
    if (!course.teacher_id && allTeachers && allTeachers.length > 0) {
      const randomTeacher = allTeachers[Math.floor(Math.random() * allTeachers.length)];
      updates.teacher_id = randomTeacher.id;
      hasUpdates = true;
      console.log(`   👨‍🏫 ${course.name} → ${randomTeacher.full_name}`);
    }

    // Assigner une salle si pas déjà assignée
    if (!course.room_id && allRooms && allRooms.length > 0) {
      const randomRoom = allRooms[Math.floor(Math.random() * allRooms.length)];
      updates.room_id = randomRoom.id;
      hasUpdates = true;
      console.log(`   🏫 ${course.name} → ${randomRoom.name}`);
    }

    // Mettre à jour le cours si nécessaire
    if (hasUpdates) {
      await sb.from("courses").update(updates).eq("id", course.id);
    }
  }

  // Ajouter des horaires aux cours
  console.log("⏰ Ajout des horaires...");
  const SCHEDULES = [
    "Lundi 09:00-11:00",
    "Lundi 14:00-16:00",
    "Lundi 16:00-18:00",
    "Mardi 09:00-11:00",
    "Mardi 14:00-16:00",
    "Mardi 16:00-18:00",
    "Mercredi 09:00-11:00",
    "Mercredi 14:00-16:00",
    "Mercredi 16:00-18:00",
    "Jeudi 09:00-11:00",
    "Jeudi 14:00-16:00",
    "Jeudi 16:00-18:00",
    "Vendredi 09:00-11:00",
    "Vendredi 14:00-16:00",
    "Vendredi 16:00-18:00",
    "Samedi 09:00-11:00",
    "Samedi 14:00-16:00",
    "Samedi 16:00-18:00",
    "Dimanche 09:00-11:00",
    "Dimanche 14:00-16:00",
    "Dimanche 16:00-18:00",
  ];

  for (const course of allCourses || []) {
    const randomSchedule = SCHEDULES[Math.floor(Math.random() * SCHEDULES.length)];

    await sb.from("courses").update({ schedule: randomSchedule }).eq("id", course.id);

    console.log(`   ⏰ ${course.name} → ${randomSchedule}`);
  }

  // S'assurer que tous les cours sont actifs
  console.log("📊 Vérification des statuts...");
  await sb.from("courses").update({ status: "active" }).neq("status", "active");

  console.log("✅ Complétion terminée !");
  console.log(`
📊 Summary complet:
   - ${familiesData?.length} families with realistic Arabic names
   - ${studentsData?.length} students (aged 4-16)
   - ${coursesData?.length} courses (Arabe 1-3, Coran 1-3, etc.)
   - ${enrollmentsData?.length} enrollments with historical data
   - ${paymentsData?.length || 0} payments across school years
   - Fixed price: ${STANDARD_PRICE}€ for all courses
   - 4 school years (2022-2023, 2023-2024, 2024-2025, 2025-2026)
   - ✅ Professeurs assignés aux cours
   - ✅ Salles assignées aux cours
   - ✅ Horaires ajoutés aux cours
   - ✅ Planning prêt à utiliser !
  `);

>>>>>>> main
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
