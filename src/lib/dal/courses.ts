// /Users/oassas/Projets/inscription-app/src/lib/dal/courses.ts
import { prisma } from "@/lib/prisma";
import { Course } from "@/types/families";

/**
 * Récupère tous les cours actifs.
 */
export async function getActiveCourses(): Promise<Course[]> {
  const courses = await prisma.course.findMany({
    where: {
      status: "active",
    },
    orderBy: {
      name: "asc",
    },
  });

  return courses.map(c => ({
    id: c.id,
    name: c.name,
    label: c.label || c.name,
    price: Number(c.price || 0),
    type: c.type,
    category: c.category || undefined,
  }));
}

/**
 * Récupère tous les cours avec les détails (Profs et Salles via relations).
 */
export async function getCoursesWithDetails() {
  const courses = await prisma.course.findMany({
    include: {
      teacher: true,
      room: true,
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return courses.map(c => ({
    id: c.id,
    name: c.name,
    type: c.type,
    // Priorité au nom dans la table liée, sinon le champ texte statique
    teacher_name: c.teacher?.fullName || c.teacherNameText, 
    room_name: c.room?.name || c.roomNameText,
    status: c.status,
    price: Number(c.price || 0),
    capacity: c.capacity,
    enrolled_count: c._count.enrollments,
    teacher_id: c.teacherId,
    room_id: c.roomId,
    schedule: c.schedule,
  }));
}
