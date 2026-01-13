"use client";

import { Button } from "@/components/ui/button";
import { Eye, CreditCard, Edit, Trash2, Users } from "lucide-react";
import { Family, SchoolYear } from "@/types/families";
import { deleteFamily } from "@/lib/actions/families";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface FamiliesTableProps {
  families: Family[];
  schoolYears: SchoolYear[];
  currentSchoolYear: string | null;
  onPaymentManagement: (family: Family) => void;
  // onFamilyDetails: (family: Family) => void;
  onRefresh: () => void;
  setDeleteMessage: (message: string | null) => void;
}

export default function FamiliesTable({
  families,
  schoolYears,
  currentSchoolYear,
  onPaymentManagement,
  // onFamilyDetails,
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
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune famille trouvée</h3>
          <p className="text-gray-500">Commencez par ajouter votre première famille.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Table pour Desktop */}
      <div className="hidden lg:block">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900">Liste des familles</h3>
            <p className="text-sm text-gray-600 mt-1">
              {families.length} famille{families.length > 1 ? "s" : ""} trouvée
              {families.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Famille
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Contact
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Étudiants
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Année scolaire
                  </th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {families.map(f => (
                  <tr
                    key={f.id}
                    className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200"
                  >
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-all duration-200">
                          {f.last_name
                            .split(" ")
                            .map(n => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            Famille {f.last_name.toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            {f.first_name} {f.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-900">{f.email}</span>
                        </div>
                        {f.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span>{f.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3 p-2 bg-purple-50/50 rounded-lg group-hover:bg-purple-100/50 transition-colors">
                        <div className="p-1 bg-purple-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                          <Users size={12} className="text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {f.students.length} étudiant{f.students.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      {currentSchoolYear ? (
                        <div className="flex items-center gap-3 p-2 bg-green-50/50 rounded-lg group-hover:bg-green-100/50 transition-colors">
                          <div className="p-1 bg-green-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {schoolYears.find(y => y.id === currentSchoolYear)?.label}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Toutes les années</span>
                      )}
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
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
                          className="text-green-600 hover:text-green-800 hover:bg-green-50"
                          title="Gérer les paiements"
                          onClick={() => onPaymentManagement(f)}
                        >
                          <CreditCard size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-orange-600 hover:text-orange-800 hover:bg-orange-50"
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
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          title="Supprimer"
                          onClick={() => handleDelete(f)}
                          disabled={f.students.length > 0}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Version mobile - Cartes */}
      <div className="block lg:hidden space-y-4">
        {families.map(f => (
          <Card
            key={f.id}
            className="w-full hover:shadow-lg transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                    Famille {f.last_name.toUpperCase()}
                  </CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {f.students.length} étudiant{f.students.length > 1 ? "s" : ""}
                    </Badge>
                    {/* Badge année scolaire */}
                    {currentSchoolYear &&
                      (() => {
                        // Afficher l'année sélectionnée
                        const selectedYearLabel = schoolYears.find(
                          y => y.id === currentSchoolYear
                        )?.label;

                        return selectedYearLabel ? (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-100 text-green-800"
                          >
                            {selectedYearLabel}
                          </Badge>
                        ) : null;
                      })()}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
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
                    className="text-green-600 hover:text-green-800 hover:bg-green-50"
                    title="Gérer les paiements"
                    onClick={() => onPaymentManagement(f)}
                  >
                    <CreditCard size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-orange-600 hover:text-orange-800 hover:bg-orange-50"
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
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
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
    </>
  );
}
