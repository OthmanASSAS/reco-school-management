"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase";

interface Teacher {
  id: string;
  name: string;
}

interface Room {
  id: string;
  name: string;
}

interface NewCourseModalProps {
  onCourseCreated?: () => void;
}

export default function NewCourseModal({ onCourseCreated }: NewCourseModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    teacher_id: "",
    room_id: "",
    price: "",
    capacity: "",
    schedule: "",
  });

  // Fonction pour rafraîchir la page
  const refreshPage = () => {
    // Utiliser router.refresh() si disponible, sinon window.location.reload()
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  useEffect(() => {
    if (open) {
      fetchTeachersAndRooms();
    }
  }, [open]);

  const fetchTeachersAndRooms = async () => {
    try {
      const [teachersResponse, roomsResponse] = await Promise.all([
        supabase.from("teachers").select("id, full_name"),
        supabase.from("rooms").select("id, name"),
      ]);

      if (teachersResponse.data) {
        const teachersData = (teachersResponse.data as { id: string; full_name: string }[]).map(
          t => ({
            id: t.id,
            name: t.full_name,
          })
        );
        console.log("Teachers loaded:", teachersData);
        setTeachers(teachersData);
      } else {
        console.log("No teachers data or error:", teachersResponse.error);
      }

      if (roomsResponse.data) {
        const roomsData = (roomsResponse.data as { id: string; name: string }[]).map(r => ({
          id: r.id,
          name: r.name,
        }));
        console.log("Rooms loaded:", roomsData);
        setRooms(roomsData);
      } else {
        console.log("No rooms data or error:", roomsResponse.error);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("courses").insert([
        {
          name: formData.name,
          type: formData.type,
          teacher_id: formData.teacher_id || null,
          room_id: formData.room_id || null,
          price: parseInt(formData.price),
          capacity: parseInt(formData.capacity),
          schedule: formData.schedule,
          status: "active",
        },
      ]);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: `Erreur lors de la création: ${error.message}`,
        });
      } else {
        toast({
          title: "Cours créé",
          description: "Le cours a été créé avec succès !",
        });
        setFormData({
          name: "",
          type: "",
          teacher_id: "",
          room_id: "",
          price: "",
          capacity: "",
          schedule: "",
        });
        setOpen(false);
        // Appeler le callback pour rafraîchir les données
        if (onCourseCreated) {
          onCourseCreated();
        } else {
          // Fallback: recharger la page
          refreshPage();
        }
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la création du cours.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Plus size={16} />
          Nouveau cours
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] z-40">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Plus size={24} className="text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Créer un nouveau cours
          </DialogTitle>
          <p className="text-gray-600 mt-2">Remplissez les informations du nouveau cours</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                Nom du cours *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Arabe Débutant"
                className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                required
              />
            </div>

            <div>
              <Label htmlFor="type" className="text-sm font-medium text-gray-700 mb-2 block">
                Type *
              </Label>
              <Select
                value={formData.type}
                onValueChange={value => setFormData({ ...formData, type: value })}
                required
              >
                <SelectTrigger className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200">
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent className="z-50" position="popper">
                  <SelectItem value="enfants">Enfants</SelectItem>
                  <SelectItem value="adultes">Adultes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="teacher_id" className="text-sm font-medium text-gray-700 mb-2 block">
                Professeur *
              </Label>
              <Select
                value={formData.teacher_id}
                onValueChange={value => setFormData({ ...formData, teacher_id: value })}
                required
              >
                <SelectTrigger className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200">
                  <SelectValue placeholder="Sélectionner le professeur" />
                </SelectTrigger>
                <SelectContent className="z-50" position="popper">
                  {teachers.length === 0 ? (
                    <SelectItem value="no-teacher" disabled>
                      Aucun professeur disponible
                    </SelectItem>
                  ) : (
                    teachers.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="room_id" className="text-sm font-medium text-gray-700 mb-2 block">
                Salle *
              </Label>
              <Select
                value={formData.room_id}
                onValueChange={value => setFormData({ ...formData, room_id: value })}
                required
              >
                <SelectTrigger className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200">
                  <SelectValue placeholder="Sélectionner la salle" />
                </SelectTrigger>
                <SelectContent className="z-50" position="popper">
                  {rooms.length === 0 ? (
                    <SelectItem value="no-room" disabled>
                      Aucune salle disponible
                    </SelectItem>
                  ) : (
                    rooms.map(r => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price" className="text-sm font-medium text-gray-700 mb-2 block">
                Prix (€) *
              </Label>
              <Input
                id="price"
                type="number"
                min={0}
                step={1}
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                placeholder="150"
                className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
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
                min={1}
                step={1}
                value={formData.capacity}
                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="20"
                className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="schedule" className="text-sm font-medium text-gray-700 mb-2 block">
              Horaires / Description
            </Label>
            <Input
              id="schedule"
              value={formData.schedule}
              onChange={e => setFormData({ ...formData, schedule: e.target.value })}
              placeholder="Ex: Lundi 18h-20h"
              className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
            />
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
                  <span className="hidden sm:inline">Créer le cours</span>
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
