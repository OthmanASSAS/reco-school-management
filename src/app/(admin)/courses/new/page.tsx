<<<<<<< HEAD
=======
import { createCourse } from "../actions/actions";
>>>>>>> main
import CourseForm from "../components/CourseForm";

// new/page.tsx
export default function NewCoursePage() {
  return (
    <main className="p-6">
      <h1>Créer un cours</h1>
<<<<<<< HEAD
      <CourseForm />
=======
      <CourseForm onSubmit={createCourse} />
>>>>>>> main
    </main>
  );
}
