"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase";

interface TeacherFormModalProps {
  onTeacherCreated: () => void;
}

export default function TeacherFormModal({ onTeacherCreated }: TeacherFormModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("teachers").insert([formData]);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: `Erreur lors de la création: ${error.message}`,
        });
      } else {
        toast({
          title: "Professeur créé",
          description: "Le professeur a été créé avec succès !",
        });
        setFormData({ full_name: "", email: "", phone: "" });
        setOpen(false);
        onTeacherCreated();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la création du professeur.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          Nouveau professeur
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Plus size={24} className="text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Ajouter un professeur
          </DialogTitle>
          <p className="text-gray-600 mt-2">Remplissez les informations du nouveau professeur</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                Nom complet *
              </Label>
              <Input
                id="name"
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Nom et prénom"
                className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemple.com"
                className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                Téléphone *
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="06 12 34 56 78"
                className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                required
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
                  <span className="hidden sm:inline">Création...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus size={16} />
                  <span className="hidden sm:inline">Créer le professeur</span>
                </div>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 px-6"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
