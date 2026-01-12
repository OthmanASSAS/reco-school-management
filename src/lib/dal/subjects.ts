// /Users/oassas/Projets/inscription-app/src/lib/dal/subjects.ts
import { prisma } from "@/lib/prisma";

/**
 * Récupère les matières d'un cours spécifique.
 */
export async function getCourseSubjects(courseId: string) {
  return await prisma.subject.findMany({
    where: {
      courseId: courseId,
    },
    orderBy: {
      orderIndex: "asc",
    },
  });
}

/**
 * Récupère les données d'un cours pour la page des matières.
 */
export async function getCourseForSubjects(courseId: string) {
  return await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      name: true,
      label: true,
      type: true,
      category: true,
    },
  });
}

/**
 * Récupère tous les cours pour les templates de matières.
 */
export async function getAllCoursesMini() {
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      name: true,
      label: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return courses.map(c => ({
    ...c,
    label: c.label || c.name,
  }));
}
