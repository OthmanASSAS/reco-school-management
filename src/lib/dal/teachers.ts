// /Users/oassas/Projets/inscription-app/src/lib/dal/teachers.ts
import { prisma } from "@/lib/prisma";

/**
 * Récupère tous les professeurs depuis la table dédiée.
 */
export async function getTeachers() {
  const teachers = await prisma.teacher.findMany({
    orderBy: {
      fullName: 'asc',
    },
  });

  return teachers.map(t => ({
    id: t.id,
    full_name: t.fullName,
    email: t.email || "",
    phone: t.phone || "",
    created_at: t.createdAt.toISOString(),
  }));
}
