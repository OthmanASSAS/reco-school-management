// /Users/oassas/Projets/inscription-app/src/lib/dal/students.ts
import { prisma } from "@/lib/prisma";
import { StudentListItem } from "@/lib/students";

/**
 * Récupère tous les étudiants avec leurs familles et inscriptions.
 * Architecture DAL utilisant Prisma.
 */
export async function getStudents(): Promise<StudentListItem[]> {
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
    },
    orderBy: {
      lastName: "asc",
    },
  });

  return families.flatMap(family => {
    return family.students.map(student => {
      const enrollments = student.enrollments.map(e => ({
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
          status: e.course.status,
        },
      }));

      const activeEnrollments = enrollments.filter(e => e.status === "active");
      const finishedEnrollments = enrollments.filter(e => e.status === "finished");
      
      const primaryCourseName =
        activeEnrollments[0]?.courses?.label ||
        activeEnrollments[0]?.courses?.name ||
        "Non assigné";

      return {
        id: student.id,
        first_name: student.firstName,
        last_name: student.lastName,
        birth_date: student.birthDate ? student.birthDate.toISOString().split("T")[0] : "",
        registration_type: (student.registrationType as any) || "child",
        level: student.level || undefined,
        notes: student.notes || undefined,
        created_at: student.createdAt.toISOString(),
        enrollments,
        activeEnrollments,
        finishedEnrollments,
        activeCoursesCount: activeEnrollments.length,
        hasHistory: finishedEnrollments.length > 0,
        hasMultipleCourses: activeEnrollments.length > 1,
        primaryCourseLabel: primaryCourseName,
        family: {
          id: family.id,
          name: `${family.lastName} ${family.firstName}`.trim(),
          email: family.email,
          phone: family.phone || undefined,
        },
      };
    });
  });
}
