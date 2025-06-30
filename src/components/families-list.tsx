"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Edit, Trash2, Eye, AlertCircle } from "lucide-react";
import { deleteFamily } from "@/lib/actions/families";
import FamilyFormModal from "./family-form-modal";

interface Family {
  id: string;
  last_name: string;
  first_name: string;
  email: string;
  phone: string;
  address: string;
  postal_code: string;
  city: string;
  students: { id: string }[];
}

export default function FamiliesTable() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [search, setSearch] = useState("");
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchFamilies();
  }, []);

  async function fetchFamilies() {
    const { data, error } = await supabase
      .from("families")
      .select("id, last_name, first_name, email, phone, address, postal_code, city, students(id)")
      .order("last_name", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setFamilies(data || []);
    }
  }

  async function handleDelete(family: Family) {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer la famille ${family.first_name} ${family.last_name} ?`
      )
    ) {
      const result = await deleteFamily(family.id);
      setDeleteMessage(result.message);

      if (result.success) {
        fetchFamilies(); // Rafraîchir la liste
      }

      // Effacer le message après 5 secondes
      setTimeout(() => setDeleteMessage(null), 5000);
    }
  }

  const filtered = families.filter(f => {
    const fullName = `${f?.first_name || ""} ${f?.last_name || ""}`.trim().toLowerCase();
    const email = (f?.email || "").toLowerCase();
    const phone = f?.phone || "";

    return (
      fullName.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase()) ||
      phone.includes(search)
    );
  });

  return (
    <div className="space-y-6">
      {/* Messages de feedback */}
      {deleteMessage && (
        <Alert className={deleteMessage.includes("succès") ? "border-green-500" : "border-red-500"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{deleteMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Familles ({families.length})</CardTitle>
          <div className="flex gap-3">
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <FamilyFormModal onFamilyCreated={fetchFamilies} />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left font-medium">Nom</th>
                  <th className="p-3 text-left font-medium">Email</th>
                  <th className="p-3 text-left font-medium">Téléphone</th>
                  <th className="p-3 text-left font-medium"># Étudiants</th>
                  <th className="p-3 text-left font-medium">Adresse</th>
                  <th className="p-3 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">
                          {f.first_name} {f.last_name.toUpperCase()}
                        </p>
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">{f.email}</td>
                    <td className="p-3 text-gray-600">{f.phone || "-"}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {f.students.length}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 text-sm">
                      {f.address
                        ? `${f.address}, ${f.postal_code || ""} ${f.city || ""}`.trim()
                        : "-"}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center space-x-1">
                        <Button variant="outline" size="sm" title="Voir les détails">
                          <Eye size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          title="Modifier"
                          onClick={() => {
                            // TODO: Implémenter la modification
                            alert("Fonction de modification à implémenter");
                          }}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          title="Supprimer"
                          onClick={() => handleDelete(f)}
                          disabled={f.students.length > 0}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      {search
                        ? "Aucune famille trouvée pour cette recherche."
                        : "Aucune famille enregistrée."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
