"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase";

interface Teacher {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
}

interface EditTeacherModalProps {
  teacher: Teacher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeacherUpdated: () => void;
}

export default function EditTeacherModal({
  teacher,
  open,
  onOpenChange,
  onTeacherUpdated,
}: EditTeacherModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  // Mettre à jour le formulaire quand le professeur change
  useEffect(() => {
    if (teacher) {
      setFormData({
        full_name: teacher.full_name,
        email: teacher.email || "",
        phone: teacher.phone || "",
      });
    }
  }, [teacher]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;

    setLoading(true);

    try {
      const { error } = await supabase.from("teachers").update(formData).eq("id", teacher.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: `Erreur lors de la modification: ${error.message}`,
        });
      } else {
        toast({
          title: "Professeur modifié",
          description: "Les informations du professeur ont été mises à jour avec succès !",
        });
        onOpenChange(false);
        onTeacherUpdated();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la modification du professeur.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Modifier le professeur
          </DialogTitle>
          <p className="text-gray-600 mt-2">Mettez à jour les informations du professeur</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700 mb-2 block">
                Nom complet *
              </Label>
              <Input
                id="edit-name"
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Nom et prénom"
                className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-email" className="text-sm font-medium text-gray-700 mb-2 block">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemple.com"
                className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              />
            </div>

            <div>
              <Label htmlFor="edit-phone" className="text-sm font-medium text-gray-700 mb-2 block">
                Téléphone
              </Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="06 12 34 56 78"
                className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <Button
              type="submit"
              className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Modification...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="hidden sm:inline">Modifier le professeur</span>
                </div>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 px-6"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
