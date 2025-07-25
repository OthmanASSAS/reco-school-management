"use client";

import { Button } from "@/components/ui/button";
import { Eye, CreditCard, Edit, Trash2 } from "lucide-react";
import { Family } from "@/types/families";
import { deleteFamily } from "@/lib/actions/families";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface FamiliesTableProps {
  families: Family[];
  onPaymentManagement: (family: Family) => void;
  onFamilyDetails: (family: Family) => void;
  onRefresh: () => void;
  setDeleteMessage: (message: string | null) => void;
}

export default function FamiliesTable({
  families,
  onPaymentManagement,
  onFamilyDetails,
  onRefresh,
  setDeleteMessage,
}: FamiliesTableProps) {
  const { toast } = useToast();

  async function handleDelete(family: Family) {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer la famille ${family.first_name} ${family.last_name} ?`
      )
    ) {
      const result = await deleteFamily(family.id);
      setDeleteMessage(result.message);

      if (result.success) {
        onRefresh();
      }

      setTimeout(() => setDeleteMessage(null), 5000);
    }
  }

  if (families.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune famille trouvée pour cette recherche.
      </div>
    );
  }

  return (
    <>
      {/* Version mobile - Cartes */}
      <div className="block lg:hidden space-y-4">
        {families.map(f => (
          <Card key={f.id} className="w-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                    Famille {f.last_name.toUpperCase()}
                  </CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {f.students.length} étudiant{f.students.length > 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800"
                    title="Voir les détails"
                    asChild
                  >
                    <Link href={`/families/${f.id}/edit`}>
                      <Edit size={16} />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-800"
                    title="Gérer les paiements"
                    onClick={() => onPaymentManagement(f)}
                  >
                    <CreditCard size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-orange-600 hover:text-orange-800"
                    title="Modifier"
                    onClick={() => {
                      toast({
                        title: "Fonctionnalité à venir",
                        description: "Fonctionnalité bientôt disponible.",
                      });
                    }}
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                    title="Supprimer"
                    onClick={() => handleDelete(f)}
                    disabled={f.students.length > 0}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Email:</span>
                  <p className="font-medium">{f.email}</p>
                </div>
                <div>
                  <span className="text-gray-500">Téléphone:</span>
                  <p className="font-medium">{f.phone || "—"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Adresse:</span>
                  <p className="font-medium">
                    {f.address
                      ? `${f.address}, ${f.postal_code || ""} ${f.city || ""}`.trim()
                      : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Version desktop - Table */}
      <div className="hidden lg:block bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
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
              {families.map(f => (
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
                      <Button variant="outline" size="sm" title="Voir les détails" asChild>
                        <Link href={`/families/${f.id}/edit`}>
                          <Edit size={14} />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Gérer les paiements"
                        onClick={() => onPaymentManagement(f)}
                      >
                        <CreditCard size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Modifier"
                        onClick={() => {
                          toast({
                            title: "Fonctionnalité à venir",
                            description: "La modification des familles sera bientôt disponible.",
                          });
                        }}
                      >
                        <Eye size={14} />
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
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
