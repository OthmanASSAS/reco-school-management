"use client";
import { Course } from "@/types";
import { Button } from "@/components/ui/button";

interface Props {
  course?: Course;
  onSubmit: (formData: FormData) => void;
}
export default function CourseForm({ course, onSubmit }: Props) {
  return (
    <form action={onSubmit} className="space-y-4">
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
