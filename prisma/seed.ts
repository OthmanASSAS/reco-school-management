// /Users/oassas/Projets/inscription-app/prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve } from "path";

const prisma = new PrismaClient();

function readJsonFile<T>(filename: string): T[] {
  const filePath = resolve(process.cwd(), `scripts/backup-supabase/${filename}`);
  try {
    const content = readFileSync(filePath, "utf-8");
    return JSON.parse(content) as T[];
  } catch (err) {
    console.error(`❌ Erreur lecture ${filename}:`, err);
    return [];
  }
}

function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  return new Date(dateString);
}

const TEACHERS_FALLBACK = [
  { id: "bbd22662-33cb-4ab7-bb98-dc387f220375", fullName: "Ustadh Ahmed Benali", email: "ahmed.benali@ecole.fr", phone: "06 12 34 56 78" },
  { id: "f08dc133-1485-45a0-867a-f5b2dc28c17e", fullName: "Ustadha Fatima Al-Maghribi", email: "fatima.almaghribi@ecole.fr", phone: "06 23 45 67 89" },
  { id: "e9f4ec36-92cf-49a4-b795-33b45e7893b1", fullName: "Ustadh Omar Zouaoui", email: "omar.zouaoui@ecole.fr", phone: "06 34 56 78 90" },
  { id: "6c450ef6-aa18-4b10-b5d7-0e6d910f606a", fullName: "Ustadha Aisha Bennani", email: "aisha.bennani@ecole.fr", phone: "06 45 67 89 01" },
  { id: "40734440-7d34-48cd-b713-19693d163b23", fullName: "Ustadh Youssef Talbi", email: "youssef.talbi@ecole.fr", phone: "06 56 78 90 12" },
];

const ROOMS_FALLBACK = [
  { id: "3c559c42-6778-4f0e-85fe-7eb051beeabe", name: "Salle Al-Fatiha", capacity: 15, location: "Rez-de-chaussée" },
  { id: "c3c32556-70cf-4d59-bb20-3321a7857ad9", name: "Salle Al-Baqarah", capacity: 20, location: "1er étage" },
  { id: "04a51e4f-3f7f-49eb-aa6b-797e8b9d3acb", name: "Salle An-Nour", capacity: 12, location: "1er étage" },
  { id: "b20fa0fb-f8d1-4e92-84df-f1a6f74d5585", name: "Salle As-Sabr", capacity: 18, location: "2ème étage" },
  { id: "4e64243f-4dd1-461b-aa6b-a3141d8366f1", name: "Salle Al-Hikmah", capacity: 25, location: "2ème étage" },
];

async function main() {
  console.log("🌱 Début du seed Prisma (Sans Transaction pour éviter les timeouts Accelerate)...\n");

  try {
    console.log("🧹 Nettoyage de la base de données...");
    await prisma.registration.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.student.deleteMany();
    await prisma.course.deleteMany();
    await prisma.family.deleteMany();
    await prisma.schoolYear.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.room.deleteMany();
    await prisma.setting.deleteMany();
    await prisma.payment.deleteMany();
    console.log("✅ Base nettoyée\n");

    const schoolYears = readJsonFile<any>("school_years.json");
    const families = readJsonFile<any>("families.json");
    const courses = readJsonFile<any>("courses.json");
    const students = readJsonFile<any>("students.json");
    const enrollments = readJsonFile<any>("enrollments.json");
    const registrations = readJsonFile<any>("registrations.json");

    console.log("   📅 Années scolaires...");
    await prisma.schoolYear.createMany({
      data: schoolYears.map((year: any) => ({
        id: year.id,
        label: year.label,
        startDate: parseDate(year.start_date)!,
        endDate: parseDate(year.end_date),
        isCurrent: year.is_current ?? false,
        createdAt: parseDate(year.created_at)!,
      }))
    });

    console.log("   👨‍🏫 Professeurs...");
    await prisma.teacher.createMany({ data: TEACHERS_FALLBACK });

    console.log("   🏫 Salles...");
    await prisma.room.createMany({ data: ROOMS_FALLBACK });

    console.log("   👨‍👩‍👧‍👦 Familles...");
    await prisma.family.createMany({
      data: families.map((family: any) => ({
        id: family.id,
        lastName: family.last_name,
        firstName: family.first_name,
        email: family.email,
        phone: family.phone,
        address: family.address,
        postalCode: family.postal_code,
        city: family.city,
        createdAt: parseDate(family.created_at)!,
      }))
    });

    console.log("   📚 Cours...");
    await prisma.course.createMany({
      data: courses.map((course: any) => ({
        id: course.id,
        name: course.name,
        type: course.type,
        teacherNameText: course.teacher,
        roomNameText: course.room,
        schedule: course.schedule,
        capacity: course.capacity,
        price: course.price,
        status: course.status || "active",
        label: course.label,
        category: course.category,
        audience: course.audience,
        teacherId: course.teacher_id,
        roomId: course.room_id,
        schoolYearId: course.school_year_id,
        createdAt: parseDate(course.created_at)!,
      }))
    });

    console.log("   👦 Élèves...");
    await prisma.student.createMany({
      data: students.map((s: any) => ({
        id: s.id,
        familyId: s.family_id,
        lastName: s.last_name,
        firstName: s.first_name,
        birthDate: parseDate(s.birth_date),
        level: s.level,
        registrationType: s.registration_type || null,
        alreadyRegistered: s.already_registered ?? false,
        notes: s.notes,
        createdAt: parseDate(s.created_at)!,
      }))
    });

    console.log("   ✍️  Inscriptions...");
    await prisma.enrollment.createMany({
      data: enrollments.map((e: any) => ({
        id: e.id,
        studentId: e.student_id,
        courseId: e.course_id,
        schoolYearId: e.school_year_id,
        startDate: parseDate(e.start_date) || new Date(),
        endDate: parseDate(e.end_date),
        status: e.status,
        createdAt: parseDate(e.created_at)!,
      }))
    });

    console.log("   📋 Dossiers...");
    await prisma.registration.createMany({
      data: registrations.map((reg: any) => ({
        id: reg.id,
        studentId: reg.student_id,
        familyId: reg.family_id,
        schoolYearId: reg.school_year_id,
        isWaitingList: reg.is_waiting_list ?? false,
        status: reg.status,
        createdAt: parseDate(reg.created_at)!,
      }))
    });

    console.log("   ⚙️ Paramètres...");
    await prisma.setting.upsert({
      where: { key: "course_discount" },
      update: {},
      create: {
        key: "course_discount",
        value: { mode: "cumulative", step: 25, startAt: 3 }
      }
    });

    console.log("\n🎉 Seed terminé avec succès !");
  } catch (error) {
    console.error("\n❌ Erreur durant le seed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
