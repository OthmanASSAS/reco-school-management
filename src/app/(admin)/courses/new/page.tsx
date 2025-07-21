import { createCourse } from "../actions/actions";
import CourseForm from "../components/CourseForm";

// new/page.tsx
export default function NewCoursePage() {
  return (
    <main className="p-6">
      <h1>Créer un cours</h1>
      <CourseForm onSubmit={createCourse} />
    </main>
  );
}
