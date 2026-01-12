// /Users/oassas/Projets/inscription-app/src/lib/dal/rooms.ts
import { prisma } from "@/lib/prisma";

/**
 * Récupère toutes les salles depuis la table dédiée.
 */
export async function getRooms() {
  const rooms = await prisma.room.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return rooms.map(r => ({
    id: r.id,
    name: r.name,
    capacity: r.capacity || 0,
    location: r.location || "",
    created_at: r.createdAt.toISOString(),
  }));
}
