"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase";

interface EditCourseModalProps {
  course: {
    id: string;
    name: string;
    type: string;
    teacher_id: string | null;
    room_id: string | null;
    price: number | null;
    capacity: number | null;
    schedule: string | null;
  };
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function EditCourseModal({ course, open, onClose, onSaved }: EditCourseModalProps) {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: course.name,
    type: course.type,
    teacher_id: course.teacher_id || "",
    room_id: course.room_id || "",
    price: course.price?.toString() || "",
    capacity: course.capacity?.toString() || "",
    schedule: course.schedule || "",
  });

  useEffect(() => {
    if (open) {
      fetchData();
      setFormData({
        name: course.name,
        type: course.type,
        teacher_id: course.teacher_id || "",
        room_id: course.room_id || "",
        price: course.price?.toString() || "",
        capacity: course.capacity?.toString() || "",
        schedule: course.schedule || "",
      });
    }
  }, [open, course]);

  async function fetchData() {
    setLoading(true);
    try {
      const [teachersResponse, roomsResponse] = await Promise.all([
        supabase.from("teachers").select("id, full_name"),
        supabase.from("rooms").select("id, name"),
      ]);

      if (teachersResponse.data) {
        setTeachers(
          (teachersResponse.data as { id: string; full_name: string }[]).map(t => ({
            id: t.id,
            name: t.full_name,
          }))
        );
      }

      if (roomsResponse.data) {
        setRooms(
          (roomsResponse.data as { id: string; name: string }[]).map(r => ({
            id: r.id,
            name: r.name,
          }))
        );
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("courses")
        .update({
          name: formData.name,
          teacher_id: formData.teacher_id,
          room_id: formData.room_id,
          price: formData.price ? Number(formData.price) : null,
          type: formData.type,
          schedule: formData.schedule,
          capacity: formData.capacity ? Number(formData.capacity) : null,
        })
        .eq("id", course.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: `Erreur lors de la modification: ${error.message}`,
        });
      } else {
        toast({
          title: "Cours modifié",
          description: "Les informations du cours ont été mises à jour avec succès !",
        });
        if (onSaved) onSaved();
        onClose();
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la modification du cours.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
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
          <DialogTitle className="text-2xl font-bold text-gray-900">Modifier le cours</DialogTitle>
          <p className="text-gray-600 mt-2">Mettez à jour les informations du cours</p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 mt-2">Chargement...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700 mb-2 block">
                  Nom du cours *
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Arabe Débutant"
                  className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-type" className="text-sm font-medium text-gray-700 mb-2 block">
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
                  <SelectContent>
                    <SelectItem value="enfants">Enfants</SelectItem>
                    <SelectItem value="adultes">Adultes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="edit-teacher_id"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
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
                  <SelectContent>
                    {teachers.length === 0 ? (
                      <SelectItem value="no-teacher" disabled>
                        Aucun professeur
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
                <Label
                  htmlFor="edit-room_id"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
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
                  <SelectContent>
                    {rooms.length === 0 ? (
                      <SelectItem value="no-room" disabled>
                        Aucune salle
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
                <Label
                  htmlFor="edit-price"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Prix (€) *
                </Label>
                <Input
                  id="edit-price"
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
                <Label
                  htmlFor="edit-capacity"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Capacité *
                </Label>
                <Input
                  id="edit-capacity"
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
              <Label
                htmlFor="edit-schedule"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Horaires / Description
              </Label>
              <Input
                id="edit-schedule"
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
                disabled={saving}
              >
                {saving ? (
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
                    <span className="hidden sm:inline">Modifier le cours</span>
                  </div>
                )}
              </Button>
              <Button type="button" variant="outline" className="h-11 px-6" onClick={onClose}>
                Annuler
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
