"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useState } from "react";
import supabase from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function InscriptionForm() {
  const { toast } = useToast();
  const { register, control, handleSubmit, reset } = useForm<any>({
    defaultValues: {
      family: {},
      students: [
        {
          last_name: "",
          first_name: "",
          birth_date: "",
          level: "",
          registration_type: "child",
          already_registered: false,
          notes: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "students",
  });

  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (data: any) => {
    const { family, students } = data;

    const { data: insertedFamily, error: familyError } = await supabase
      .from("families")
      .insert([family])
      .select()
      .single();

    if (familyError) {
      toast({
        variant: "destructive",
        title: "Erreur d'enregistrement",
        description: "Erreur lors de l'enregistrement de la famille",
      });
      console.error(familyError);
      return;
    }

    for (const student of students) {
      await supabase.from("students").insert([
        {
          ...student,
          family_id: insertedFamily.id,
        },
      ]);
    }

    setSubmitted(true);
    reset();
  };

  if (submitted) {
    return (
      <div className="p-4 text-green-600 font-semibold">
        Merci, votre inscription a bien été enregistrée.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Responsable / Famille</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          placeholder="Nom"
          {...register("family.last_name")}
          className="border p-2 rounded w-full"
          required
        />
        <input
          placeholder="Prénom"
          {...register("family.first_name")}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="email"
          placeholder="Email"
          {...register("family.email")}
          className="border p-2 rounded w-full"
          required
        />
        <input
          placeholder="Téléphone"
          {...register("family.phone")}
          className="border p-2 rounded w-full"
        />
        <input
          placeholder="Adresse"
          {...register("family.address")}
          className="border p-2 rounded w-full"
        />
        <input
          placeholder="Code postal"
          {...register("family.postal_code")}
          className="border p-2 rounded w-full"
        />
        <input
          placeholder="Ville"
          {...register("family.city")}
          className="border p-2 rounded w-full"
        />
      </div>

      <h2 className="text-2xl font-bold mt-8">Enfants / Adultes à inscrire</h2>
      {fields.map((field: any, index: any) => (
        <div key={field.id} className="border p-4 rounded bg-gray-50 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Nom"
              {...register(`students.${index}.last_name`)}
              className="border p-2 rounded w-full"
              required
            />
            <input
              placeholder="Prénom"
              {...register(`students.${index}.first_name`)}
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="date"
              {...register(`students.${index}.birth_date`)}
              className="border p-2 rounded w-full"
              required
            />
            <input
              placeholder="Niveau"
              {...register(`students.${index}.level`)}
              className="border p-2 rounded w-full"
            />
            <select
              {...register(`students.${index}.registration_type`)}
              className="border p-2 rounded w-full"
            >
              <option value="child">Enfant</option>
              <option value="adult">Adulte</option>
            </select>
            <label className="flex items-center space-x-2">
              <input type="checkbox" {...register(`students.${index}.already_registered`)} />
              <span>Déjà inscrit en 2024-2025</span>
            </label>
            <textarea
              placeholder="Commentaire"
              {...register(`students.${index}.notes`)}
              className="border p-2 rounded w-full"
            />
          </div>
          <button type="button" onClick={() => remove(index)} className="text-red-600 mt-2">
            Supprimer cet inscrit
          </button>
        </div>
      ))}
      <button type="button" onClick={() => append({})} className="bg-gray-200 px-4 py-2 rounded">
        + Ajouter un inscrit
      </button>
      <div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded mt-4">
          Envoyer
        </button>
      </div>
    </form>
  );
}
