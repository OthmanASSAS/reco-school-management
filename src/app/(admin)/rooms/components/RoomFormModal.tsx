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
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          Nouvelle salle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter une salle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom de la salle *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Salle Al-Fatiha"
              required
            />
          </div>
          <div>
            <Label htmlFor="capacity">Capacité *</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={e => setFormData({ ...formData, capacity: e.target.value })}
              placeholder="20"
              required
            />
          </div>
          <div>
            <Label htmlFor="location">Emplacement *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ex: Rez-de-chaussée, 1er étage"
              required
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Création..." : "Créer la salle"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
