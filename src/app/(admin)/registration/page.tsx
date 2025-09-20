import RegistrationWizard from "@/app/(admin)/registration/components/RegistrationWizard";
import supabase from "@/lib/supabase";

export default async function RegistrationPage() {
  const [familiesRes, coursesRes] = await Promise.all([
    supabase.from("families").select("id, first_name, last_name"),
    supabase.from("courses").select("id, label, name, type, price").eq("status", "active"),
  ]);

  if (familiesRes.error || coursesRes.error) {
    return <div className="p-4 text-red-600">Erreur de chargement</div>;
  }

  const families = (familiesRes.data || []).map(f => ({
    id: f.id,
    name: `${f.first_name} ${f.last_name}`.trim(),
  }));
  const courses = (coursesRes.data || []).map(c => ({
    id: c.id,
    label: c.label || c.name,
    type: c.type,
    price: c.price,
  }));

  return (
    <div className="w-full p-4 md:p-6">
      <div className="w-full md:max-w-4xl md:mx-auto">
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Guichet d’inscription</h1>
        <RegistrationWizard families={families} courses={courses} />
      </div>
    </div>
  );
}
