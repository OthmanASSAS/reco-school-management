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

interface RoomFormModalProps {
  onRoomCreated: () => void;
}

export default function RoomFormModal({ onRoomCreated }: RoomFormModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const roomData = {
        ...formData,
        capacity: parseInt(formData.capacity) || 0,
      };

      const { error } = await supabase.from("rooms").insert([roomData]);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: `Erreur lors de la création: ${error.message}`,
        });
      } else {
        toast({
          title: "Salle créée",
          description: "La salle a été créée avec succès !",
        });
        setFormData({ name: "", capacity: "", location: "" });
        setOpen(false);
        onRoomCreated();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la création de la salle.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Plus size={16} />
          Nouvelle salle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <Plus size={24} className="text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">Ajouter une salle</DialogTitle>
          <p className="text-gray-600 mt-2">Remplissez les informations de la nouvelle salle</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                Nom de la salle *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Salle Al-Fatiha"
                className="h-11 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                required
              />
            </div>
            <div>
              <Label htmlFor="capacity" className="text-sm font-medium text-gray-700 mb-2 block">
                Capacité *
              </Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="20"
                className="h-11 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                required
              />
            </div>
            <div>
              <Label htmlFor="location" className="text-sm font-medium text-gray-700 mb-2 block">
                Emplacement *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Rez-de-chaussée, 1er étage"
                className="h-11 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                required
              />
            </div>
          </div>
          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <Button
              type="submit"
              className="flex-1 h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
                  <span className="hidden sm:inline">Créer la salle</span>
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
