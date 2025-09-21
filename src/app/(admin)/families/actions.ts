"use server";

import { createClient } from "@/lib/supabase/server";
import { Family } from "@/types/families";

export async function getFamilyDetails(familyId: string): Promise<Family | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
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
        notes,
        enrollments(
          id,
          status,
          start_date,
          courses(
            id,
            name,
            label,
            type,
            price
          )
        )
      )
    `
    )
    .eq("id", familyId)
    .single();

  if (error) {
    console.error("Error fetching family details:", error);
    return null;
  }

  return data as unknown as Family;
}
