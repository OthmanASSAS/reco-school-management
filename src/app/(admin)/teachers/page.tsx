import TeachersList from "./components/TeachersList";
import supabase from "@/lib/supabase";

export default async function TeachersPage() {
  // Charger les données des professeurs côté serveur
  const { data: teachers } = await supabase
    .from("teachers")
    .select("id, full_name, email, phone, created_at")
    .order("full_name", { ascending: true });

  return (
    <div className="w-full p-4 md:p-6">
      <div className="w-full md:max-w-7xl md:mx-auto">
        <TeachersList initialTeachers={teachers || []} />
      </div>
    </div>
  );
}
