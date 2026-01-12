// /Users/oassas/Projets/inscription-app/src/app/(admin)/teachers/page.tsx
import TeachersList from "./components/TeachersList";
import { getTeachers } from "@/lib/dal/teachers";

export const dynamic = 'force-dynamic';

export default async function TeachersPage() {
  // Charger les données via le DAL Prisma (Architecture DDD)
  const teachers = await getTeachers();

  return (
    <div className="w-full p-4 md:p-6">
      <div className="w-full md:max-w-7xl md:mx-auto">
        <TeachersList initialTeachers={teachers} />
      </div>
    </div>
  );
}
