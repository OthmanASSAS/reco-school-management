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
  courses: Array<{
    id: string;
    name: string;
    type: string;
    capacity: number;
    enrolledCount: number;
    schedule: string;
    occupancyRate: number;
  }>;
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

  // 4. Calcul du revenu encaissé (somme de tous les modes de paiement)
  const payments = await prisma.payment.findMany({
    select: {
      amountCash: true,
      amountCard: true,
      amountTransfer: true,
      refundAmount: true,
      cheques: true,
    }
  });

  let totalRevenue = 0;
  payments.forEach(p => {
    totalRevenue += Number(p.amountCash || 0);
    totalRevenue += Number(p.amountCard || 0);
    totalRevenue += Number(p.amountTransfer || 0);
    totalRevenue -= Number(p.refundAmount || 0);
    
    // Calcul des chèques (stockés en JSON)
    if (p.cheques && Array.isArray(p.cheques)) {
      totalRevenue += (p.cheques as any[]).reduce((sum, lot) => 
        sum + (Number(lot.count) || 0) * (Number(lot.amount) || 0), 0
      );
    }
  });

  // 5. Paiements en retard (Simple: familles n'ayant aucun paiement pour l'année en cours)
  const overduePayments = await prisma.family.count({
    where: {
      payments: { none: {} }
    }
  });

  return {
    studentsCount,
    familiesCount,
    coursesCount,
    totalRevenue,
    overduePayments,
    recentStudents,
    occupancyRate,
    courses,
  };
}
