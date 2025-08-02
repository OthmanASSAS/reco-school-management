// Nouveau composant : StudentSelector.tsx
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import supabase from "@/lib/supabase";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  family_id: string;
}

interface Props {
  onStudentSelected: (student: Student) => void;
}

export default function StudentSelector({ onStudentSelected }: Props) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (search.length < 2) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("students")
        .select("id, first_name, last_name, birth_date, family_id")
        .ilike("last_name", `%${search}%`);
      if (!error) setResults(data || []);
      setLoading(false);
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔍 Recherche d'élève (pré-inscription)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="student-search">Nom de famille</Label>
          <Input
            id="student-search"
            placeholder="Ex: Ben Saïd"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          {loading && <p className="text-sm text-gray-500">Recherche...</p>}
          {results.map(student => (
            <div
              key={student.id}
              className="p-2 bg-gray-50 border rounded hover:bg-gray-100 cursor-pointer"
              onClick={() => onStudentSelected(student)}
            >
              {student.first_name} {student.last_name} — {student.birth_date}
            </div>
          ))}
          {!loading && search.length >= 2 && results.length === 0 && (
            <p className="text-sm text-gray-500">Aucun résultat trouvé.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
