/**
 * SEED PRISMA - Import données Supabase
 *
 * POURQUOI CE SCRIPT ?
 * - Importer les données exportées de Supabase vers Prisma
 * - Respecter l'ordre des foreign keys (parents → enfants)
 * - Garantir l'intégrité avec une transaction atomique
 *
 * ORDRE D'INSERTION CRITIQUE :
 * 1. school_years (pas de FK)
 * 2. families (pas de FK)
 * 3. courses (pas de FK)
 * 4. students (FK → families)
 * 5. enrollments (FK → students, courses, school_years)
 * 6. registrations (FK → students, families, school_years)
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve } from "path";

// Singleton Prisma client (même pattern que src/lib/prisma.ts)
const prisma = new PrismaClient();

/**
 * UTILITAIRE : Lire fichier JSON
 *
 * resolve() = construire chemin absolu depuis racine projet
 * readFileSync() = lecture synchrone (ok pour seed, 1 fois)
 * JSON.parse() = transformer string JSON → objet JavaScript
 */
function readJsonFile<T>(filename: string): T[] {
  const filePath = resolve(process.cwd(), `scripts/backup-supabase/${filename}`);

  try {
    const content = readFileSync(filePath, "utf-8");
    return JSON.parse(content) as T[];
  } catch (err) {
    console.error(`❌ Erreur lecture ${filename}:`, err);
    throw err;
  }
}

/**
 * TRANSFORMATION DATES
 *
 * POURQUOI ? Supabase renvoie des strings ISO ("2022-09-01")
 * Prisma attend des Date objects
 *
 * new Date(string) = convertit ISO string → Date JS
 * || null = si undefined/null, retourner null (pour champs optionnels)
 */
function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  return new Date(dateString);
}

/**
 * MAIN SEED FUNCTION
 *
 * async = fonction asynchrone (peut utiliser await)
 * try/catch = gestion d'erreurs
 * finally = toujours exécuté (même si erreur) → fermer connexion DB
 */
async function main() {
  console.log("🌱 Début du seed Prisma...\n");

  try {
    // ========================================
    // ÉTAPE 1 : NETTOYER LA DB
    // ========================================
    console.log("🧹 Nettoyage de la base de données...");

    /**
     * deleteMany() = DELETE FROM table
     * Ordre inverse des FK (enfants → parents)
     * POURQUOI ? On ne peut pas supprimer un parent si un enfant l'utilise
     *
     * await = attendre que l'opération se termine avant de passer à la suite
     */
    await prisma.registration.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.student.deleteMany();
    await prisma.course.deleteMany();
    await prisma.family.deleteMany();
    await prisma.schoolYear.deleteMany();

    console.log("✅ Base nettoyée\n");

    // ========================================
    // ÉTAPE 2 : LIRE LES FICHIERS JSON
    // ========================================
    console.log("📂 Lecture des fichiers JSON...");

    /**
     * Type inference TypeScript
     * <SchoolYear> = typage générique
     * TypeScript sait que schoolYears est un array de SchoolYear
     */
    const schoolYears = readJsonFile<{
      id: string;
      label: string;
      start_date: string;
      end_date: string;
      created_at: string;
    }>("school_years.json");

    const families = readJsonFile<{
      id: string;
      last_name: string;
      first_name: string;
      email: string;
      phone: string | null;
      address: string | null;
      postal_code: string | null;
      city: string | null;
      created_at: string;
    }>("families.json");

    const courses = readJsonFile<{
      id: string;
      name: string;
      type: string;
      teacher: string | null;
      room: string | null;
      schedule: string | null;
      capacity: number | null;
      price: number | null;
      status: string;
      created_at: string;
      label: string | null;
      category: string | null;
      audience: string | null;
      teacher_id: string | null;
      room_id: string | null;
      school_year_id: string | null;
    }>("courses.json");

    const students = readJsonFile<{
      id: string;
      family_id: string;
      last_name: string;
      first_name: string;
      birth_date: string | null;
      level: string | null;
      registration_type: string;
      already_registered: boolean | null;
      notes: string | null;
      created_at: string;
    }>("students.json");

    const enrollments = readJsonFile<{
      id: string;
      student_id: string;
      course_id: string;
      school_year_id: string;
      start_date: string | null;
      end_date: string | null;
      status: string;
      created_at: string;
    }>("enrollments.json");

    const registrations = readJsonFile<{
      id: string;
      student_id: string;
      family_id: string;
      school_year_id: string;
      course_instance_id: string | null;
      is_waiting_list: boolean | null;
      status: string;
      created_at: string;
    }>("registrations.json");

    console.log(`✅ Fichiers lus:
   - ${schoolYears.length} années scolaires
   - ${families.length} familles
   - ${courses.length} cours
   - ${students.length} élèves
   - ${enrollments.length} inscriptions aux cours
   - ${registrations.length} dossiers préinscription\n`);

    // ========================================
    // ÉTAPE 3 : INSERTION AVEC TRANSACTION
    // ========================================
    console.log("💾 Insertion des données...");

    /**
     * TRANSACTION PRISMA = $transaction()
     *
     * POURQUOI ?
     * - Garantit que TOUTES les insertions réussissent OU AUCUNE
     * - Si 1 insertion échoue → rollback automatique
     * - Évite d'avoir une DB à moitié remplie
     *
     * PATTERN AVANCÉ :
     * $transaction() accepte une fonction async
     * Cette fonction reçoit "tx" = transaction context
     * On utilise "tx" au lieu de "prisma" pour que tout soit dans la transaction
     */
    await prisma.$transaction(async tx => {
      // 1️⃣ SCHOOL YEARS (pas de FK)
      console.log("   📅 Années scolaires...");
      for (const year of schoolYears) {
        /**
         * create() = INSERT INTO
         * data = les valeurs à insérer
         *
         * MAPPING SNAKE_CASE → CAMELCASE :
         * Prisma utilise camelCase (startDate)
         * Supabase utilise snake_case (start_date)
         * On doit transformer manuellement
         */
        await tx.schoolYear.create({
          data: {
            id: year.id,
            label: year.label,
            startDate: parseDate(year.start_date)!,
            endDate: parseDate(year.end_date)!,
            createdAt: parseDate(year.created_at)!,
          },
        });
      }

      // 2️⃣ FAMILIES (pas de FK)
      console.log("   👨‍👩‍👧‍👦 Familles...");
      for (const family of families) {
        await tx.family.create({
          data: {
            id: family.id,
            lastName: family.last_name,
            firstName: family.first_name,
            email: family.email,
            phone: family.phone,
            address: family.address,
            postalCode: family.postal_code,
            city: family.city,
            createdAt: parseDate(family.created_at)!,
          },
        });
      }

      // 3️⃣ COURSES (pas de FK)
      console.log("   📚 Cours...");
      for (const course of courses) {
        await tx.course.create({
          data: {
            id: course.id,
            name: course.name,
            type: course.type,
            teacher: course.teacher,
            room: course.room,
            schedule: course.schedule,
            capacity: course.capacity,
            price: course.price,
            status: course.status,
            label: course.label,
            category: course.category,
            audience: course.audience,
            teacherId: course.teacher_id,
            roomId: course.room_id,
            schoolYearId: course.school_year_id,
            createdAt: parseDate(course.created_at)!,
          },
        });
      }

      // 4️⃣ STUDENTS (FK → families)
      console.log("   👦 Élèves...");
      for (const student of students) {
        /**
         * ENUM CASTING + NULL HANDLING
         *
         * registration_type peut être "child" | "adult" | null
         * Ternaire : si null → null, sinon → cast en enum
         *
         * POURQUOI ? Données Supabase ont des valeurs null (préinscriptions en cours)
         */
        await tx.student.create({
          data: {
            id: student.id,
            familyId: student.family_id,
            lastName: student.last_name,
            firstName: student.first_name,
            birthDate: parseDate(student.birth_date),
            level: student.level,
            registrationType: student.registration_type
              ? (student.registration_type as "child" | "adult")
              : null,
            alreadyRegistered: student.already_registered ?? false,
            notes: student.notes,
            createdAt: parseDate(student.created_at)!,
          },
        });
      }

      // 5️⃣ ENROLLMENTS (FK → students, courses, school_years)
      console.log("   ✍️  Inscriptions aux cours...");
      for (const enrollment of enrollments) {
        await tx.enrollment.create({
          data: {
            id: enrollment.id,
            studentId: enrollment.student_id,
            courseId: enrollment.course_id,
            schoolYearId: enrollment.school_year_id,
            startDate: parseDate(enrollment.start_date),
            endDate: parseDate(enrollment.end_date),
            status: enrollment.status,
            createdAt: parseDate(enrollment.created_at)!,
          },
        });
      }

      // 6️⃣ REGISTRATIONS (FK → students, families, school_years)
      console.log("   📋 Dossiers préinscription...");
      for (const registration of registrations) {
        await tx.registration.create({
          data: {
            id: registration.id,
            studentId: registration.student_id,
            familyId: registration.family_id,
            schoolYearId: registration.school_year_id,
            courseInstanceId: registration.course_instance_id,
            isWaitingList: registration.is_waiting_list ?? false,
            status: registration.status,
            createdAt: parseDate(registration.created_at)!,
          },
        });
      }
    });

    console.log("\n✅ Toutes les données ont été insérées !");

    // ========================================
    // ÉTAPE 4 : VÉRIFICATION
    // ========================================
    console.log("\n📊 Vérification finale...");

    /**
     * count() = SELECT COUNT(*) FROM table
     * Retourne le nombre de lignes
     */
    const counts = {
      schoolYears: await prisma.schoolYear.count(),
      families: await prisma.family.count(),
      courses: await prisma.course.count(),
      students: await prisma.student.count(),
      enrollments: await prisma.enrollment.count(),
      registrations: await prisma.registration.count(),
    };

    console.log(`
   Années scolaires : ${counts.schoolYears}
   Familles        : ${counts.families}
   Cours           : ${counts.courses}
   Élèves          : ${counts.students}
   Inscriptions    : ${counts.enrollments}
   Préinscriptions : ${counts.registrations}
    `);

    console.log("\n🎉 Seed terminé avec succès !");
  } catch (error) {
    console.error("\n❌ Erreur durant le seed:", error);

    /**
     * process.exit(1) = arrêter le script avec code erreur
     * 1 = erreur (0 = succès)
     * Permet à Prisma de savoir que le seed a échoué
     */
    process.exit(1);
  } finally {
    /**
     * $disconnect() = fermer la connexion DB
     * TOUJOURS dans finally = même si erreur, on ferme la connexion
     * Évite les connexions orphelines qui bloquent la DB
     */
    await prisma.$disconnect();
  }
}

/**
 * EXÉCUTION
 *
 * main() = appeler la fonction
 * .catch() = si erreur non catchée dans main()
 */
main().catch(err => {
  console.error("❌ Erreur fatale:", err);
  process.exit(1);
});
