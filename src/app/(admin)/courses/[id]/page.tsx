// [id]/page.tsx
import { getCoursesWithDetail, updateCourse } from "../actions/actions";
import CourseForm from "../components/CourseForm";
export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const courses = await getCoursesWithDetail();
  const course = courses.find(c => c.id === params.id);
  return (
    <main className="p-6">
      <h1>Modifier le cours</h1>
      {course && <CourseForm course={course} onSubmit={data => updateCourse(course.id, data)} />}
    </main>
  );
}
