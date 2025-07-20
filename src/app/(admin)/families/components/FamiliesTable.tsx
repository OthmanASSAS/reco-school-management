"use client";

import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, CreditCard } from "lucide-react";
import { deleteFamily } from "@/lib/actions/families";
import { useToast } from "@/hooks/use-toast";
import { Family } from "@/types/families";

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

  return (
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
                {f.address ? `${f.address}, ${f.postal_code || ""} ${f.city || ""}`.trim() : "-"}
              </td>
              <td className="p-3">
                <div className="flex justify-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    title="Voir les détails"
                    onClick={() => onFamilyDetails(f)}
                  >
                    <Eye size={14} />
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
          {families.length === 0 && (
            <tr>
              <td colSpan={6} className="p-8 text-center text-gray-500">
                Aucune famille trouvée pour cette recherche.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
