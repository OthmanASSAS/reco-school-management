// scripts/seed.ts - Version réaliste pour école arabe/coran
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";

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

  // Périodes de cours réalistes
  schoolPeriods: [
    { label: "2023-2024", start: "2023-09-01", end: "2024-06-30" },
    { label: "2024-2025", start: "2024-09-01", end: "2025-06-30" },
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
    start_date: string;
    end_date: string | null;
    status: "active" | "finished";
    created_at: string;
  };

  const enrollments = studentsData!.flatMap(student => {
    const studentAge = new Date().getFullYear() - new Date(student.birth_date).getFullYear();
    const studentEnrollments: EnrollmentToInsert[] = [];

    // Cours appropriés selon l'âge et le type
    const appropriateCourses = coursesData!.filter(course => {
      if (studentAge <= 6) return course.category === "Maternelle";
      if (studentAge >= 14) return course.type === "adultes";
      return course.type === "enfants";
    });

    // Nombre de cours selon l'âge (1-3 cours)
    const numCourses = studentAge <= 6 ? 1 : faker.number.int({ min: 1, max: 3 });
    const selectedCourses = faker.helpers.arrayElements(appropriateCourses, numCourses);

    selectedCourses.forEach(course => {
      // Cours actuel (année 2024-2025)
      studentEnrollments.push({
        id: faker.string.uuid(),
        student_id: student.id,
        course_id: course.id,
        start_date: "2024-09-01",
        end_date: null,
        status: "active",
        created_at: new Date().toISOString(),
      });

      // Historique (année précédente) pour 40% des étudiants
      if (faker.datatype.boolean({ probability: 0.4 })) {
        studentEnrollments.push({
          id: faker.string.uuid(),
          student_id: student.id,
          course_id: course.id,
          start_date: "2023-09-01",
          end_date: "2024-06-30",
          status: "finished",
          created_at: new Date("2023-09-01").toISOString(),
        });
      }
    });

    return studentEnrollments;
  });

  const { data: enrollmentsData } = await sb.from("enrollments").insert(enrollments).select();
  console.log(`   📝 Inserted ${enrollmentsData?.length} enrollments (with history)`);

  // --- 8. Insert Settings ---
  const settings = [
    { key: "course_discount", value: JSON.stringify({ mode: "cumulative", step: 25, startAt: 3 }) },
  ];

  await sb.from("settings").upsert(settings, { onConflict: "key" });
  console.log(`   ⚙️ Upserted settings`);

  console.log("✅ Realistic Islamic school data seeded successfully!");
  console.log(`
📊 Summary:
   - ${familiesData?.length} families with realistic Arabic names
   - ${studentsData?.length} students (aged 4-16)
   - ${coursesData?.length} courses (Arabe 1-3, Coran 1-3, etc.)
   - ${enrollmentsData?.length} enrollments with historical data
   - Fixed price: ${STANDARD_PRICE}€ for all courses
   - 2 school years (2023-2024, 2024-2025)
  `);

  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
