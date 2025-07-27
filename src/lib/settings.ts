import supabase from "@/lib/supabase";

export async function fetchCourseDiscountSettings() {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "course_discount")
    .single();
  if (error) throw error;

  // Si data.value existe et est une chaîne JSON, on la parse
  // Sinon, on utilise directement data.value s'il existe
  if (data?.value) {
    try {
      // Si c'est une chaîne, on essaie de la parser
      if (typeof data.value === "string") {
        return JSON.parse(data.value);
      }
      // Si c'est déjà un objet, on l'utilise directement
      return data.value;
    } catch (parseError) {
      console.error("Erreur lors du parsing JSON:", parseError);
      // En cas d'erreur, on retourne les valeurs par défaut
      return { startAt: 3, step: 25, mode: "cumulative" };
    }
  }

  // Valeurs par défaut si aucune donnée n'est trouvée
  return { startAt: 3, step: 25, mode: "cumulative" };
}
