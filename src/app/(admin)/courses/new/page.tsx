import CourseForm from "../components/CourseForm";

// new/page.tsx
export default function NewCoursePage() {
  return (
    <main className="p-6">
      <h1>Créer un cours</h1>
      <CourseForm
        onCourseCreated={() => {
          // Redirection ou notification
        }}
        onCourseUpdated={() => {
          // Ne devrait pas être appelé pour un nouveau cours
        }}
      />
    </main>
  );
}
