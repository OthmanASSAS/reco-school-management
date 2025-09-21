import { Course, Enrollment, Student } from "@/types/families";

type CourseWithMeta = Course & {
  status?: string | null;
};

export type EnrollmentWithCourse = Omit<Enrollment, "courses"> & {
  courses: CourseWithMeta | null;
};

type FamilyFromSupabase = {
  id: string;
  last_name: string;
  first_name: string;
  email: string;
  phone?: string | null;
  students: Array<
    Omit<Student, "enrollments"> & {
      created_at: string;
      enrollments: EnrollmentWithCourse[];
    }
  >;
};

export interface StudentListItem extends Omit<Student, "enrollments"> {
  family: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  enrollments: EnrollmentWithCourse[];
  activeEnrollments: EnrollmentWithCourse[];
  finishedEnrollments: EnrollmentWithCourse[];
  activeCoursesCount: number;
  hasHistory: boolean;
  hasMultipleCourses: boolean;
  primaryCourseLabel: string;
  created_at: string;
}

export function mapFamiliesToStudents(
  families: FamilyFromSupabase[] | null | undefined
): StudentListItem[] {
  if (!families?.length) {
    return [];
  }

  return families.flatMap(family => {
    const { id: familyId, last_name, first_name, email, phone, students } = family;

    if (!students?.length) {
      return [];
    }

    return students.map(student => {
      const enrollments = (student.enrollments || []) as EnrollmentWithCourse[];
      const activeEnrollments = enrollments.filter(enrollment => enrollment.status === "active");
      const finishedEnrollments = enrollments.filter(
        enrollment => enrollment.status === "finished"
      );
      const primaryCourseName =
        activeEnrollments[0]?.courses?.label ||
        activeEnrollments[0]?.courses?.name ||
        "Non assigné";

      return {
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        birth_date: student.birth_date,
        registration_type: student.registration_type,
        level: student.level,
        notes: student.notes,
        created_at: student.created_at,
        enrollments,
        activeEnrollments,
        finishedEnrollments,
        activeCoursesCount: activeEnrollments.length,
        hasHistory: finishedEnrollments.length > 0,
        hasMultipleCourses: activeEnrollments.length > 1,
        primaryCourseLabel: primaryCourseName,
        family: {
          id: familyId,
          name: `${last_name} ${first_name}`.trim(),
          email,
          phone: phone || undefined,
        },
      } satisfies StudentListItem;
    });
  });
}
