// scripts/seed.ts
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;

// Use service_role key for seeding to bypass RLS
const sb = createClient(supabaseUrl, supabaseServiceKey);

// --- Configuration des quantités de données ---
const NUM_FAMILIES = 5;
const NUM_STUDENTS_PER_FAMILY = 2;
const NUM_TEACHERS = 3;
const NUM_ROOMS = 3;
const NUM_TIME_BLOCKS = 5; // Lundi 9h, Mardi 9h, etc.
const NUM_COURSES = 10;
const NUM_ENROLLMENTS_PER_STUDENT = 1;
const NUM_PAYMENTS_PER_FAMILY = 1;
const NUM_APPOINTMENTS_PER_STUDENT = 1;
const NUM_COURSE_INSTANCES = 5;
const NUM_REGISTRATIONS = 5;
const NUM_SCHOOL_YEARS = 1;
const NUM_APPOINTMENT_DAYS = 3;
const NUM_TIME_SLOTS = 5;

async function main() {
  // ✅ ORDRE CORRIGÉ : supprimer d'abord les tables dépendantes
  const tablesToClean = [
    
    "schedules", // Dépend de courses, time_blocks, rooms
    "registrations", // Dépend de students, course_instances, families, school_years
    "payments", // Dépend de families, students
    "appointments", // Dépend de students
    "enrollments", // Dépend de students, courses
    "course_instances", // Dépend de courses, teachers, rooms, time_slots
    "courses", // Dépend de teachers, rooms, school_years
    "students", // Dépend de families - MAINTENANT on peut les supprimer
    "families", // MAINTENANT on peut les supprimer
    "teachers", // Indépendant
    "rooms", // Indépendant
    "time_blocks", // Indépendant
    "time_slots", // Indépendant
    "school_years", // Indépendant
    "appointment_days", // Indépendant
  ];

  console.log("🧹 Cleaning up tables...");
  for (const t of tablesToClean) {
    try {
      // Méthode plus agressive pour s'assurer que tout est supprimé
      const { error, count } = await sb
        .from(t)
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // UUID impossible

      if (error) {
        console.error(`   ❌ Error cleaning ${t}:`, error);
        // En cas d'erreur, essayer une approche différente
        try {
          await sb.from(t).delete().gt("created_at", "1900-01-01");
        } catch (fallbackError) {
          console.error(`   ❌ Fallback failed for ${t}:`, fallbackError);
        }
      } else {
        console.log(`   ✅ Cleaned ${t}`);
      }
    } catch (error) {
      console.error(`   💥 Critical error cleaning ${t}:`, error);
    }
  }

  // Vérification que les tables sont vraiment vides
  console.log("🔍 Verification of cleanup...");
  const criticalTables = ["families", "students", "enrollments"];
  for (const table of criticalTables) {
    try {
      const { count } = await sb.from(table).select("*", { count: "exact", head: true });

      if (count && count > 0) {
        console.warn(`⚠️  ${table} still has ${count} rows after cleanup`);
      } else {
        console.log(`✅ ${table} is empty`);
      }
    } catch (error) {
      console.error(`❌ Cannot verify ${table}:`, error);
    }
  }

  console.log("Cleanup complete.");

  console.log("Inserting data...");

  let insertedFamilies: any[] = [];
  let insertedTeachers: any[] = [];
  let insertedRooms: any[] = [];
  let insertedTimeBlocks: any[] = [];
  let insertedSchoolYears: any[] = [];
  let insertedStudents: any[] = [];
  let insertedCourses: any[] = [];
  let insertedSchedules: any[] = [];
  let insertedEnrollments: any[] = [];
  let insertedPayments: any[] = [];
  let insertedAppointments: any[] = [];
  let insertedCourseInstances: any[] = [];
  let insertedRegistrations: any[] = [];
  let insertedAppointmentDays: any[] = [];
  let insertedTimeSlots: any[] = [];

  // --- 1. Insert Families ---
  const families = Array.from({ length: NUM_FAMILIES }).map(() => ({
    id: faker.string.uuid(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    postal_code: faker.location.zipCode(),
    city: faker.location.city(),
    created_at: new Date().toISOString(),
  }));
  const { data: familiesData, error: familiesError } = await sb
    .from("families")
    .insert(families)
    .select();
  if (familiesError) console.error("Error inserting families:", familiesError);
  else insertedFamilies = familiesData || [];
  console.log(`   - Inserted ${insertedFamilies.length} families.`);

  // --- 2. Insert Teachers ---
  const teachers = Array.from({ length: NUM_TEACHERS }).map(() => ({
    id: faker.string.uuid(),
    full_name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    created_at: new Date().toISOString(),
  }));
  const { data: teachersData, error: teachersError } = await sb
    .from("teachers")
    .insert(teachers)
    .select();
  if (teachersError) console.error("Error inserting teachers:", teachersError);
  else insertedTeachers = teachersData || [];
  console.log(`   - Inserted ${insertedTeachers.length} teachers.`);

  // --- 3. Insert Rooms ---
  const rooms = Array.from({ length: NUM_ROOMS }).map((_, i) => ({
    id: faker.string.uuid(),
    name: `Salle ${i + 1} - ${faker.word.adjective()}`,
    capacity: faker.number.int({ min: 10, max: 30 }),
    location: faker.location.city(),
    created_at: new Date().toISOString(),
  }));
  const { data: roomsData, error: roomsError } = await sb.from("rooms").insert(rooms).select();
  if (roomsError) console.error("Error inserting rooms:", roomsError);
  else insertedRooms = roomsData || [];
  console.log(`   - Inserted ${insertedRooms.length} rooms.`);

  // --- 4. Insert Time Blocks ---
  const weekdays = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
  const timeBlocks = Array.from({ length: NUM_TIME_BLOCKS }).map((_, i) => ({
    id: faker.string.uuid(),
    weekday: faker.helpers.arrayElement(weekdays),
    start_time: `${faker.number.int({ min: 8, max: 12 })}:00:00`,
    end_time: `${faker.number.int({ min: 13, max: 18 })}:00:00`,
    created_at: new Date().toISOString(),
  }));
  const { data: timeBlocksData, error: timeBlocksError } = await sb
    .from("time_blocks")
    .insert(timeBlocks)
    .select();
  if (timeBlocksError) console.error("Error inserting time_blocks:", timeBlocksError);
  else insertedTimeBlocks = timeBlocksData || [];
  console.log(`   - Inserted ${insertedTimeBlocks.length} time_blocks.`);

  // --- 5. Insert School Years ---
  const schoolYears = Array.from({ length: NUM_SCHOOL_YEARS }).map(() => {
    const start = faker.date.past({ years: 1 });
    const end = faker.date.future({ years: 1, refDate: start });
    return {
      id: faker.string.uuid(),
      label: `${start.getFullYear()}-${end.getFullYear()}`,
      start_date: start.toISOString().split("T")[0],
      end_date: end.toISOString().split("T")[0],
      created_at: new Date().toISOString(),
    };
  });
  const { data: schoolYearsData, error: schoolYearsError } = await sb
    .from("school_years")
    .insert(schoolYears)
    .select();
  if (schoolYearsError) console.error("Error inserting school_years:", schoolYearsError);
  else insertedSchoolYears = schoolYearsData || [];
  console.log(`   - Inserted ${insertedSchoolYears.length} school_years.`);

  // --- 6. Insert Students (dependent on Families) ---
  if (insertedFamilies.length > 0) {
    const students = insertedFamilies.flatMap(family => {
      const familyStudents: any[] = [];
      for (let i = 0; i < NUM_STUDENTS_PER_FAMILY; i++) {
        const birthDate = faker.date.birthdate({ min: 3, max: 60, mode: "age" });
        familyStudents.push({
          id: faker.string.uuid(),
          family_id: family.id,
          last_name: family.last_name, // Use family's last name for consistency
          first_name: faker.person.firstName(),
          birth_date: birthDate.toISOString().split("T")[0],
          level: faker.helpers.arrayElement(["Débutant", "Intermédiaire", "Avancé", null]),
          registration_type:
            birthDate.getFullYear() > new Date().getFullYear() - 14 ? "child" : "adult",
          already_registered: faker.datatype.boolean(),
          notes: faker.lorem.sentence(),
          created_at: new Date().toISOString(),
        });
      }
      return familyStudents;
    });
    const { data: studentsData, error: studentsError } = await sb
      .from("students")
      .insert(students)
      .select();
    if (studentsError) console.error("Error inserting students:", studentsError);
    else insertedStudents = studentsData || [];
  }
  console.log(`   - Inserted ${insertedStudents.length} students.`);

  // --- 7. Insert Courses (dependent on Rooms, Teachers, School Years) ---
  if (insertedTeachers.length > 0 && insertedRooms.length > 0 && insertedSchoolYears.length > 0) {
    const courses = Array.from({ length: NUM_COURSES }).map(() => ({
      id: faker.string.uuid(),
      name: faker.word.words({ count: 2 }),
      type: faker.helpers.arrayElement(["enfants", "adultes"]),
      teacher_id: faker.helpers.arrayElement(insertedTeachers).id,
      room_id: faker.helpers.arrayElement(insertedRooms).id,
      schedule: faker.lorem.sentence(3), // Simplified schedule description
      capacity: faker.number.int({ min: 5, max: 20 }),
      price: faker.number.float({ min: 100, max: 500, fractionDigits: 2 }),
      status: faker.helpers.arrayElement(["active", "inactive"]),
      label: faker.commerce.productAdjective() + " " + faker.commerce.product(),
      category: faker.helpers.arrayElement(["Arabe", "Coran", "Maternelle", "Scolaire"]),
      audience: faker.helpers.arrayElement(["Hommes", "Femmes", "Mixte"]),
      school_year_id: faker.helpers.arrayElement(insertedSchoolYears).id,
      created_at: new Date().toISOString(),
    }));
    const { data: coursesData, error: coursesError } = await sb
      .from("courses")
      .insert(courses)
      .select();
    if (coursesError) console.error("Error inserting courses:", coursesError);
    else insertedCourses = coursesData || [];
  }
  console.log(`   - Inserted ${insertedCourses.length} courses.`);

  // --- 8. Insert Schedules (dependent on Courses, Time Blocks, Rooms) ---
  if (insertedCourses.length > 0 && insertedTimeBlocks.length > 0 && insertedRooms.length > 0) {
    const schedules = insertedCourses.map(course => ({
      id: faker.string.uuid(),
      course_id: course.id,
      time_block_id: faker.helpers.arrayElement(insertedTimeBlocks).id,
      room_id: faker.helpers.arrayElement(insertedRooms).id,
      created_at: new Date().toISOString(),
    }));
    const { data: schedulesData, error: schedulesError } = await sb
      .from("schedules")
      .insert(schedules)
      .select();
    if (schedulesError) console.error("Error inserting schedules:", schedulesError);
    else insertedSchedules = schedulesData || [];
  }
  console.log(`   - Inserted ${insertedSchedules.length} schedules.`);

  // --- 9. Insert Enrollments (dependent on Students, Courses) ---
  if (insertedStudents.length > 0 && insertedCourses.length > 0) {
    const enrollmentsToInsert = insertedStudents.flatMap(student => {
      const studentEnrollments: any[] = [];
      for (let i = 0; i < NUM_ENROLLMENTS_PER_STUDENT; i++) {
        studentEnrollments.push({
          id: faker.string.uuid(),
          student_id: student.id,
          course_id: faker.helpers.arrayElement(insertedCourses).id,
          start_date: faker.date.past({ years: 1 }).toISOString().split("T")[0],
          end_date: faker.helpers.arrayElement([
            null,
            faker.date.future({ years: 1 }).toISOString().split("T")[0],
          ]),
          status: faker.helpers.arrayElement(["active", "finished"]),
          created_at: new Date().toISOString(),
        });
      }
      return studentEnrollments;
    });
    const { data: enrollmentsData, error: enrollmentsError } = await sb
      .from("enrollments")
      .insert(enrollmentsToInsert)
      .select();
    if (enrollmentsError) console.error("Error inserting enrollments:", enrollmentsError);
    else insertedEnrollments = enrollmentsData || [];
  }
  console.log(`   - Inserted ${insertedEnrollments.length} enrollments.`);

  // --- 10. Insert Payments (dependent on Families, Students) ---
  if (insertedFamilies.length > 0 && insertedStudents.length > 0) {
    const paymentsToInsert = insertedFamilies.flatMap(family => {
      const familyPayments: any[] = [];
      for (let i = 0; i < NUM_PAYMENTS_PER_FAMILY; i++) {
        const studentsInFamily = insertedStudents.filter(s => s.family_id === family.id);
        const studentForPayment =
          studentsInFamily.length > 0 ? faker.helpers.arrayElement(studentsInFamily) : null;

        familyPayments.push({
          id: faker.string.uuid(),
          family_id: family.id,
          student_id: studentForPayment ? studentForPayment.id : null,
          amount_cash: faker.number.float({ min: 0, max: 200, fractionDigits: 2 }),
          amount_card: faker.number.float({ min: 0, max: 200, fractionDigits: 2 }),
          amount_transfer: faker.number.float({ min: 0, max: 200, fractionDigits: 2 }),
          refund_amount: faker.number.float({ min: 0, max: 50, fractionDigits: 2 }),
          cheques: JSON.stringify(
            faker.helpers.arrayElements(
              [
                {
                  nom: faker.person.lastName(),
                  count: faker.number.int({ min: 1, max: 3 }),
                  amount: faker.number.float({ min: 50, max: 150, fractionDigits: 2 }),
                  banque: faker.company.name(),
                },
                {
                  nom: faker.person.lastName(),
                  count: faker.number.int({ min: 1, max: 3 }),
                  amount: faker.number.float({ min: 50, max: 150, fractionDigits: 2 }),
                  banque: faker.company.name(),
                },
              ],
              { min: 0, max: 2 }
            )
          ),
          remarks: faker.helpers.arrayElement([faker.lorem.sentence(), null]),
          created_at: new Date().toISOString(),
        });
      }
      return familyPayments;
    });
    const { data: paymentsData, error: paymentsError } = await sb
      .from("payments")
      .insert(paymentsToInsert)
      .select();
    if (paymentsError) console.error("Error inserting payments:", paymentsError);
    else insertedPayments = paymentsData || [];
  }
  console.log(`   - Inserted ${insertedPayments.length} payments.`);

  // --- 11. Insert Appointments (dependent on Students) ---
  if (insertedStudents.length > 0) {
    const appointmentsToInsert = insertedStudents.flatMap(student => {
      const studentAppointments: any[] = [];
      for (let i = 0; i < NUM_APPOINTMENTS_PER_STUDENT; i++) {
        studentAppointments.push({
          id: faker.string.uuid(),
          student_id: student.id,
          date: faker.date.future({ years: 1 }).toISOString().split("T")[0],
          time: faker.date
            .anytime()
            .toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          created_at: new Date().toISOString(),
        });
      }
      return studentAppointments;
    });
    const { data: appointmentsData, error: appointmentsError } = await sb
      .from("appointments")
      .insert(appointmentsToInsert)
      .select();
    if (appointmentsError) console.error("Error inserting appointments:", appointmentsError);
    else insertedAppointments = appointmentsData || [];
  }
  console.log(`   - Inserted ${insertedAppointments.length} appointments.`);

  // --- 12. Insert Time Slots (now generating data) ---
  const daysOfWeek = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
  const timeSlots = Array.from({ length: NUM_TIME_SLOTS }).map(() => ({
    id: faker.string.uuid(),
    day: faker.helpers.arrayElement(daysOfWeek),
    start_time: `${faker.number.int({ min: 8, max: 12 })}:00:00`,
    end_time: `${faker.number.int({ min: 13, max: 18 })}:00:00`,
    created_at: new Date().toISOString(),
  }));
  const { data: timeSlotsData, error: timeSlotsError } = await sb
    .from("time_slots")
    .insert(timeSlots)
    .select();
  if (timeSlotsError) console.error("Error inserting time_slots:", timeSlotsError);
  else insertedTimeSlots = timeSlotsData || [];
  console.log(`   - Inserted ${insertedTimeSlots.length} time_slots.`);

  // --- 13. Insert Course Instances (dependent on Courses, Teachers, Rooms, Time Slots) ---
  if (
    insertedCourses.length > 0 &&
    insertedTeachers.length > 0 &&
    insertedRooms.length > 0 &&
    insertedTimeSlots.length > 0
  ) {
    const courseInstancesToInsert = Array.from({ length: NUM_COURSE_INSTANCES }).map(() => ({
      id: faker.string.uuid(),
      course_id: faker.helpers.arrayElement(insertedCourses).id,
      teacher_id: faker.helpers.arrayElement(insertedTeachers).id,
      room_id: faker.helpers.arrayElement(insertedRooms).id,
      time_slot_id: faker.helpers.arrayElement(insertedTimeSlots).id,
      capacity: faker.number.int({ min: 10, max: 25 }),
      price: faker.number.float({ min: 50, max: 300, fractionDigits: 2 }),
      status: faker.helpers.arrayElement(["active", "archived"]),
      created_at: new Date().toISOString(),
    }));
    const { data: courseInstancesData, error: courseInstancesError } = await sb
      .from("course_instances")
      .insert(courseInstancesToInsert)
      .select();
    if (courseInstancesError)
      console.error("Error inserting course_instances:", courseInstancesError);
    else insertedCourseInstances = courseInstancesData || [];
  }
  console.log(`   - Inserted ${insertedCourseInstances.length} course_instances.`);

  // --- 14. Insert Appointment Days (now generating data) ---
  const appointmentDays = Array.from({ length: NUM_APPOINTMENT_DAYS }).map(() => ({
    id: faker.string.uuid(),
    date: faker.date.future({ years: 1 }).toISOString().split("T")[0],
    is_active: faker.datatype.boolean(),
    created_at: new Date().toISOString(),
  }));
  const { data: appointmentDaysData, error: appointmentDaysError } = await sb
    .from("appointment_days")
    .insert(appointmentDays)
    .select();
  if (appointmentDaysError)
    console.error("Error inserting appointment_days:", appointmentDaysError);
  else insertedAppointmentDays = appointmentDaysData || [];
  console.log(`   - Inserted ${insertedAppointmentDays.length} appointment_days.`);

  // --- 15. Insert Registrations (dependent on Students, Course Instances, Families, School Years, Appointment Days) ---
  if (
    insertedStudents.length > 0 &&
    insertedCourseInstances.length > 0 &&
    insertedFamilies.length > 0 &&
    insertedSchoolYears.length > 0
  ) {
    const registrationsToInsert = insertedStudents.flatMap(student => {
      const studentRegistrations: any[] = [];
      for (let i = 0; i < NUM_REGISTRATIONS / insertedStudents.length; i++) {
        // Distribute registrations across students
        studentRegistrations.push({
          id: faker.string.uuid(),
          student_id: student.id,
          course_instance_id: faker.helpers.arrayElement(insertedCourseInstances).id,
          is_waiting_list: faker.datatype.boolean(),
          created_at: new Date().toISOString(),
          status: faker.helpers.arrayElement(["pending", "approved", "rejected"]),
          family_id: student.family_id,
          school_year_id: faker.helpers.arrayElement(insertedSchoolYears).id,
          appointment_day: faker.helpers.arrayElement([
            faker.date.future({ years: 1 }).toISOString().split("T")[0],
            null,
          ]),
        });
      }
      return studentRegistrations;
    });
    const { data: registrationsData, error: registrationsError } = await sb
      .from("registrations")
      .insert(registrationsToInsert)
      .select();
    if (registrationsError) console.error("Error inserting registrations:", registrationsError);
    else insertedRegistrations = registrationsData || [];
  }
  console.log(`   - Inserted ${insertedRegistrations.length} registrations.`);

  // --- 16. Insert Settings ---
  const settings = [
    { key: "course_discount", value: JSON.stringify({ mode: "cumulative", step: 25, startAt: 3 }) },
  ];

  const { error: settingsError } = await sb
    .from("settings")
    .upsert(settings, { onConflict: "key" }); // Remplace si existe déjà

  if (settingsError) {
    console.error("Error upserting settings:", settingsError);
  } else {
    console.log(`   - Upserted ${settings.length} settings.`);
  }
  console.log("✅ Seed complete.");
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
