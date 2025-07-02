// scripts/seed.ts
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";

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
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
