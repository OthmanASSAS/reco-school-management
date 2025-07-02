"use client";
import { Course } from "@/types";
import { Button } from "@/components/ui/button";
import { createCourse, updateCourse } from "../actions/actions";

interface Props {
  course?: Course;
}
export default function CourseForm({ course }: Props) {
  return (
    <form
      action={course ? data => updateCourse(course.id, data) : createCourse}
      className="space-y-4"
    >
      <input name="name" defaultValue={course?.name} placeholder="Nom du cours" required />
      <select name="teacher_id" defaultValue={course?.teacher_id ?? ""}>
        {/* map enseignants */}
      </select>
      <select name="room_id" defaultValue={course?.room_id ?? ""}>
        {/* map salles */}
      </select>
      <input name="price" type="number" defaultValue={course?.price ?? ""} placeholder="Prix €" />
      <select name="type" defaultValue={course?.type}>
        <option value="enfants">Enfants</option>
        <option value="adultes">Adultes</option>
      </select>
      <textarea
        name="schedule"
        defaultValue={course?.schedule_id ?? ""}
        placeholder="Horaire / description"
      />
      <Button type="submit">Enregistrer</Button>
    </form>
  );
}
