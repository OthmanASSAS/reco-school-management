// src/lib/dal/dashboard.ts

import { prisma } from "@/lib/prisma";

/**
 * Interface représentant les données formatées pour le dashboard.
 * C'est le "contrat" que la DAL s'engage à respecter.
 */
export interface DashboardStats {
  studentsCount: number;
  familiesCount: number;
  coursesCount: number;
  totalRevenue: number;
  overduePayments: number;
  recentStudents: Array<{
    id: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
  }>;
  occupancyRate: number;
}

/**
 * Récupère toutes les statistiques nécessaires pour le Dashboard.
 * Cette fonction centralise la logique métier et l'accès aux données.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  // 1. On récupère les comptes de base en parallèle (performance)
  const [studentsCount, familiesCount, coursesCount] = await Promise.all([
    prisma.student.count(),
    prisma.family.count(),
    prisma.course.count({ where: { status: "active" } }),
  ]);

  // 2. Récupérer les inscriptions récentes
  const recentStudents = await prisma.student.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      createdAt: true,
    },
  });

  // 3. Récupérer les données des cours actifs pour l'overview et le taux d'occupation
  const activeCoursesData = await prisma.course.findMany({
    where: { status: "active" },
    select: {
      id: true,
      name: true,
      type: true,
      capacity: true,
      schedule: true,
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Transformation des données (Calculs métiers)
  const courses = activeCoursesData.map(course => {
    const enrolledCount = course._count.enrollments;
    const capacity = course.capacity || 0;

    // Calcul du taux d'occupation par classe (Produit en croix)
    // On limite à 100% même en cas d'over-booking pour la cohérence visuelle
    const rate = capacity > 0 ? Math.min((enrolledCount / capacity) * 100, 100) : 0;

    return {
      id: course.id,
      name: course.name,
      type: course.type,
      capacity: capacity,
      enrolledCount: enrolledCount,
      schedule: course.schedule || "Non planifié",
      occupancyRate: Math.round(rate),
    };
  });

  // Calcul du taux d'occupation moyen global
  const occupancyRate =
    courses.length > 0
      ? Math.round(courses.reduce((acc, c) => acc + c.occupancyRate, 0) / courses.length)
      : 0;

  // TODO: Implémenter le calcul complexe du revenu et des paiements en retard
  const totalRevenue = 0;
  const overduePayments = 0;

  return {
    studentsCount,
    familiesCount,
    coursesCount,
    totalRevenue,
    overduePayments,
    recentStudents,
    occupancyRate,
    courses, // On ajoute les cours formatés à la réponse
  };
}
