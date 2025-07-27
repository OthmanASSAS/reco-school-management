"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase";

interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  created_at: string;
}

interface EditRoomModalProps {
  room: Room | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomUpdated: () => void;
}

export default function EditRoomModal({
  room,
  open,
  onOpenChange,
  onRoomUpdated,
}: EditRoomModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    location: "",
  });

  // Mettre à jour le formulaire quand la salle change
  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name,
        capacity: room.capacity.toString(),
        location: room.location || "",
      });
    }
  }, [room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("rooms")
        .update({
          name: formData.name,
          capacity: parseInt(formData.capacity),
          location: formData.location,
        })
        .eq("id", room.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: `Erreur lors de la modification: ${error.message}`,
        });
      } else {
        toast({
          title: "Salle modifiée",
          description: "Les informations de la salle ont été mises à jour avec succès !",
        });
        onOpenChange(false);
        onRoomUpdated();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la modification de la salle.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
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
          <DialogTitle className="text-2xl font-bold text-gray-900">Modifier la salle</DialogTitle>
          <p className="text-gray-600 mt-2">Mettez à jour les informations de la salle</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700 mb-2 block">
                Nom de la salle *
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Salle Al-Fatiha"
                className="h-11 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                required
              />
            </div>

            <div>
              <Label
                htmlFor="edit-capacity"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Capacité *
              </Label>
              <Input
                id="edit-capacity"
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
              <Label
                htmlFor="edit-location"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Emplacement *
              </Label>
              <Input
                id="edit-location"
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
                  <span className="hidden sm:inline">Modifier la salle</span>
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
