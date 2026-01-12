// /Users/oassas/Projets/inscription-app/src/lib/dal/families.ts
import { prisma } from "@/lib/prisma";
import { Family, SchoolYear } from "@/types/families";

/**
 * Récupère toutes les familles avec leurs étudiants, inscriptions et cours associés.
 */
export async function getFamilies(): Promise<Family[]> {
  const families = await prisma.family.findMany({
    include: {
      students: {
        include: {
          enrollments: {
            include: {
              course: true,
            },
          },
        },
      },
      payments: true,
    },
    orderBy: {
      lastName: "asc",
    },
  });

  return families.map(f => ({
    id: f.id,
    first_name: f.firstName,
    last_name: f.lastName,
    email: f.email,
    phone: f.phone || undefined,
    address: f.address || undefined,
    postal_code: f.postalCode || undefined,
    city: f.city || undefined,
    students: f.students.map(s => ({
      id: s.id,
      first_name: s.firstName,
      last_name: s.lastName,
      birth_date: s.birthDate ? s.birthDate.toISOString().split("T")[0] : "",
      registration_type: (s.registrationType as any) || "child",
      level: s.level || undefined,
      notes: s.notes || undefined,
      enrollments: s.enrollments.map(e => ({
        id: e.id,
        course_id: e.courseId,
        school_year_id: e.schoolYearId,
        status: e.status,
        start_date: e.startDate.toISOString(),
        created_at: e.createdAt.toISOString(),
        courses: {
          id: e.course.id,
          name: e.course.name,
          label: e.course.label || e.course.name,
          price: Number(e.course.price || 0),
          type: e.course.type,
          category: e.course.category || undefined,
        },
      })),
    })),
    payments: f.payments.map(p => ({
      id: p.id,
      amount_cash: Number(p.amountCash),
      amount_card: Number(p.amountCard),
      amount_transfer: Number(p.amountTransfer),
      refund_amount: Number(p.refundAmount),
      books: p.books,
      remarks: p.remarks || undefined,
      cheques: p.cheques as any,
      created_at: p.createdAt.toISOString(),
      family_id: p.familyId,
      school_year_id: p.schoolYearId,
    })),
  }));
}

/**
 * Récupère uniquement les IDs et les noms complets des familles.
 */
export async function getFamiliesMinimal() {
  const families = await prisma.family.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
    orderBy: {
      lastName: "asc",
    },
  });

  return families.map(f => ({
    id: f.id,
    name: `${f.firstName} ${f.lastName}`.trim(),
  }));
}

/**
 * Récupère une famille par son ID avec tous les détails.
 */
export async function getFamilyById(id: string) {
  const family = await prisma.family.findUnique({
    where: { id },
    include: {
      students: {
        include: {
          enrollments: {
            include: {
              course: true,
            },
          },
        },
      },
    },
  });

  if (!family) return null;

  return {
    ...family,
    first_name: family.firstName,
    last_name: family.lastName,
    address: family.address || "",
    phone: family.phone || "",
    status: "active",
    students: family.students.map(s => ({
      ...s,
      first_name: s.firstName,
      last_name: s.lastName,
      registration_type: s.registrationType,
      birth_date: s.birthDate ? s.birthDate.toISOString().split("T")[0] : "",
      enrollments: s.enrollments.map(e => ({
        ...e,
        courses: e.course,
      })),
    })),
  };
}

/**
 * Récupère toutes les années scolaires.
 */
export async function getSchoolYears(): Promise<SchoolYear[]> {
  const years = await prisma.schoolYear.findMany({
    orderBy: {
      startDate: "desc",
    },
  });

  return years.map(y => ({
    id: y.id,
    label: y.label,
    start_date: y.startDate.toISOString(),
    end_date: y.endDate ? y.endDate.toISOString() : null,
    is_current: y.isCurrent,
  }));
}
