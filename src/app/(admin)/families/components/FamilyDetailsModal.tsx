"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Users, Loader2 } from "lucide-react";
import { Family } from "@/types/families";
import { useEffect, useState } from "react";
import { getFamilyDetails } from "../actions";

interface FamilyDetailsModalProps {
  family: Family;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FamilyDetailsModal({
  family: initialFamily,
  open,
  onOpenChange,
}: FamilyDetailsModalProps) {
  const [family, setFamily] = useState<Family>(initialFamily);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getFamilyDetails(initialFamily.id)
        .then(data => {
          if (data) {
            setFamily(data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [open, initialFamily.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[50vw] max-h-[95vh] flex flex-col p-4 sm:p-8">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Users size={24} />
            Famille {family.last_name.toUpperCase()}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
          </div>
        ) : (
          <div className="space-y-6 flex-1 overflow-y-auto">
            {/* Informations de la famille */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <User size={20} />
                Informations de contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nom complet</p>
                  <p className="font-medium">
                    {family.first_name} {family.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{family.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium">{family.phone || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Adresse</p>
                  <p className="font-medium">
                    {family.address ? (
                      <>
                        {family.address}
                        <br />
                        {family.postal_code} {family.city}
                      </>
                    ) : (
                      "Non renseignée"
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Étudiants */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <Users size={20} />
                Étudiants ({family.students.length})
              </h3>
              <div className="space-y-3">
                {family.students.map(student => (
                  <div key={student.id} className="bg-white rounded-lg p-3 border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {student.registration_type === "child" ? "Enfant" : "Adulte"}
                        </p>
                      </div>
                      <Badge variant="outline">{student.enrollments.length} cours</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Fermer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
