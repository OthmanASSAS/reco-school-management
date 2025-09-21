"use client";

import { useRouter } from "next/navigation";
import CourseForm from "./CourseForm";

interface Course {
  id: string;
  name: string;
  description: string;
  type: string;
  capacity: number;
  teacher_id: string | null;
  room_id: string | null;
  status: string;
}

interface CourseFormWrapperProps {
  course: Course;
}

export default function CourseFormWrapper({ course }: CourseFormWrapperProps) {
  const router = useRouter();

  const handleCourseUpdated = () => {
    // Recharger la page après mise à jour
    router.refresh();
  };

  const handleCourseCreated = () => {
    // Ne devrait pas être appelé dans ce contexte
  };

  return (
    <CourseForm
      course={course}
      onCourseCreated={handleCourseCreated}
      onCourseUpdated={handleCourseUpdated}
    />
  );
}
