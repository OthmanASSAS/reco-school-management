"use server";

import supabase from "@/lib/supabase";

export async function preRegister(formData: FormData) {
  console.log({ formData });
  const family = JSON.parse(formData.get("family") as string);
  const students = JSON.parse(formData.get("students") as string);
  const appointmentDay = formData.get("appointmentDay") as string | null;

  // Étape 1 : vérifier si la famille existe déjà via email
  let { data: familySelect, error: familySelectError } = await supabase
    .from("families")
    .select("*")
    .eq("email", family.contactEmail)
    .single();

  if (familySelectError && familySelectError.code !== "PGRST116") {
    return { error: familySelectError.message, status: 400 };
  }

  // Créer si elle n'existe pas
  if (!familySelect) {
    const { data: familyInsert, error: familyInsertError } = await supabase
      .from("families")
      .insert({
        last_name: family.familyName,
        first_name: family.parentFirstName,
        email: family.contactEmail,
        phone: family.contactPhone,
        address: family.address,
        postal_code: family.postalCode,
        city: family.city,
      })
      .select()
      .single();

    if (familyInsertError) {
      return { error: familyInsertError.message, status: 400 };
    }
    familySelect = familyInsert;
  }

  const familyId = familySelect.id;

  // Récupération de l'année scolaire active
  const { data: schoolYear, error: yearError } = await supabase
    .from("school_years")
    .select("*")
    .order("start_date", { ascending: false })
    .limit(1)
    .single();

  if (yearError) {
    return { error: yearError.message, status: 400 };
  }

  const schoolYearId = schoolYear.id;
  const messages = [];

  for (const student of students) {
    // Vérifier si l'élève existe déjà dans la famille
    const { data: existingStudent } = await supabase
      .from("students")
      .select("*")
      .eq("family_id", familyId)
      .eq("first_name", student.firstName)
      .eq("last_name", student.lastName)
      .eq("birth_date", student.birthDate)
      .single();

    let studentId = existingStudent?.id;

    if (!existingStudent) {
      const { data: studentInsert, error: studentError } = await supabase
        .from("students")
        .insert({
          family_id: familyId,
          last_name: student.lastName,
          first_name: student.firstName,
          birth_date: student.birthDate,
          level: null,
          registration_type: student.registration_type,
          already_registered: false,
        })
        .select()
        .single();

      if (studentError) {
        return { error: studentError.message, status: 400 };
      }
      studentId = studentInsert.id;
      messages.push(`${student.firstName} ${student.lastName} a été ajouté.`);
    } else {
      messages.push(`${student.firstName} ${student.lastName} existe déjà.`);
    }

    // Vérifier s'il y a déjà une préinscription pour cet élève cette année
    const { data: existingRegistration } = await supabase
      .from("registrations")
      .select("id")
      .eq("student_id", studentId)
      .eq("school_year_id", schoolYearId)
      .maybeSingle();

    if (!existingRegistration) {
      const { error: registrationError } = await supabase.from("registrations").insert({
        student_id: studentId,
        family_id: familyId,
        status: "draft",
        course_instance_id: null,
        school_year_id: schoolYearId,
        is_waiting_list: false,
        appointment_day: appointmentDay,
      });

      if (registrationError) {
        return { error: registrationError.message, status: 400 };
      }
    } else {
      messages.push(`Inscription de ${student.firstName} déjà enregistrée.`);
    }
  }

  return { success: true, messages, status: 201 };
}
