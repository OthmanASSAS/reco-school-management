import FamiliesList from "./components/FamiliesList";
import supabase from "@/lib/supabase";
import { Family, SchoolYear, Student } from "@/types/families";

export default async function FamiliesPage() {
  // Charger les données de base côté serveur
  const { data: families } = await supabase
    .from("families")
    .select(
      `
      id, 
      last_name, 
      first_name, 
      email, 
      phone, 
      address, 
      postal_code, 
      city,
      students(
        id,
        first_name,
        last_name,
        birth_date,
        registration_type,
        level,
        notes
      )
    `
    )
    .order("last_name", { ascending: true });

  // Charger les années scolaires côté serveur
  const { data: schoolYears } = await supabase
    .from("school_years")
    .select("id, label, start_date")
    .order("start_date", { ascending: false });

  // Transformer les données pour correspondre aux types
  const typedFamilies: Family[] = (families || []).map(f => ({
    id: f.id,
    first_name: f.first_name,
    last_name: f.last_name,
    email: f.email,
    phone: f.phone,
    address: f.address,
    postal_code: f.postal_code,
    city: f.city,
    students: f.students.map(s => ({
      id: s.id,
      first_name: s.first_name,
      last_name: s.last_name,
      birth_date: s.birth_date,
      registration_type: s.registration_type,
      level: s.level,
      notes: s.notes,
      enrollments: [],
    })),
    payments: [],
  }));

  const typedSchoolYears: SchoolYear[] = (schoolYears || []).map(y => ({
    id: y.id,
    label: y.label,
    start_date: y.start_date,
  }));

  return (
    <div className="w-full p-4 md:p-6">
      <div className="w-full md:max-w-7xl md:mx-auto">
        <FamiliesList initialFamilies={typedFamilies} initialSchoolYears={typedSchoolYears} />
      </div>
    </div>
  );
}
