// /Users/oassas/Projets/inscription-app/src/lib/dal/grades.ts
import { prisma } from "@/lib/prisma";

/**
 * Récupère toutes les données nécessaires pour la page de gestion des notes.
 */
export async function getGradesInitialData() {
  const [schoolYearsRaw, coursesRaw, studentsRaw, enrollmentsRaw] = await Promise.all([
    prisma.schoolYear.findMany({ orderBy: { startDate: 'desc' } }),
    prisma.course.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.student.findMany({ select: { id: true, firstName: true, lastName: true }, orderBy: { lastName: 'asc' } }),
    prisma.enrollment.findMany({ select: { studentId: true, courseId: true, schoolYearId: true } }),
  ]);

  // NOTE: La table 'subjects' n'existe pas encore dans la base de données réelle (PostgreSQL).
  // On retourne un tableau vide pour l'instant pour éviter les crashs au build.
  const subjects: any[] = [];

  return {
    schoolYears: schoolYearsRaw.map(y => ({
      id: y.id,
      label: y.label,
      start_date: y.startDate.toISOString(),
      end_date: y.endDate ? y.endDate.toISOString() : "",
    })),
    courses: coursesRaw,
    students: studentsRaw.map(s => ({
      id: s.id,
      first_name: s.firstName,
      last_name: s.lastName,
    })),
    subjects,
    enrollments: enrollmentsRaw.map(e => ({
      student_id: e.studentId,
      course_id: e.courseId,
      school_year_id: e.schoolYearId,
    })),
  };
}
