import RegistrationForm from "@/app/(admin)/registration/components/registration-form";
import supabase from "@/lib/supabase";

export default async function RegistrationPage() {
  const [
    { data: familiesData, error: familiesError },
    { data: schoolYearsData, error: schoolYearsError },
    // TEST TEMPORAIRE: utiliser courses directement
    { data: coursesData, error: coursesError },
  ] = await Promise.all([
    supabase.from("families").select("id, first_name, last_name"),
    supabase.from("school_years").select("id, label, start_date"),
    // Utiliser courses directement pour tester
    supabase
      .from("courses")
      .select("id, name, label, type, price, capacity")
      .eq("status", "active"),
  ]);

  console.log("=== DEBUG PAGE ===");
  console.log("familiesData:", familiesData);
  console.log("schoolYearsData:", schoolYearsData);
  console.log("coursesData:", coursesData);

  if (familiesError || schoolYearsError || coursesError) {
    console.error("Erreur lors du chargement des données:", {
      familiesError,
      schoolYearsError,
      coursesError,
    });
    return (
      <div className="p-6 text-red-500">
        Erreur lors du chargement des données nécessaires pour le formulaire.
      </div>
    );
  }

  // Transformer les données
  const families = (familiesData || []).map(family => ({
    id: family.id,
    name: `${family.first_name} ${family.last_name}`.trim(),
  }));

  const schoolYears = (schoolYearsData || []).map(year => ({
    id: year.id,
    year:
      year.label || (year.start_date ? new Date(year.start_date).getFullYear().toString() : "N/A"),
  }));

  // TEST: Convertir courses en courseInstances temporairement
  const courseInstances = (coursesData || []).map(course => ({
    id: course.id,
    course: {
      name: course.name || "Cours sans nom",
      type: course.type || "enfants",
      label: course.label || course.name || "Cours sans label",
    },
    teacher: undefined,
    room: undefined,
    timeSlot: undefined,
    capacity: course.capacity || 0,
    price: course.price || 0,
  }));

  console.log("courseInstances transformées:", courseInstances);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Nouvelle inscription</h1>
        <RegistrationForm
          families={families}
          schoolYears={schoolYears}
          courseInstances={courseInstances}
        />
      </div>
    </div>
  );
}
