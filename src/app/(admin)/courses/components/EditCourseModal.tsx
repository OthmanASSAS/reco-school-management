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
import supabase from "@/lib/supabase";

interface EditCourseModalProps {
  course: {
    id: string;
    name: string;
    type: string;
    teacher_id?: string;
    room_id?: string;
    price?: number;
    capacity?: number;
    schedule?: string;
  };
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function EditCourseModal({ course, open, onClose, onSaved }: EditCourseModalProps) {
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: teachersData } = await supabase.from("teachers").select("id, full_name");
      const { data: roomsData } = await supabase.from("rooms").select("id, name");
      setTeachers((teachersData || []).map((t: any) => ({ id: t.id, name: t.full_name })));
      setRooms((roomsData || []).map((r: any) => ({ id: r.id, name: r.name })));
      setLoading(false);
    }
    if (open) fetchData();
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const { error } = await supabase
      .from("courses")
      .update({
        name: formData.get("name"),
        teacher_id: formData.get("teacher_id"),
        room_id: formData.get("room_id"),
        price: formData.get("price") ? Number(formData.get("price")) : null,
        type: formData.get("type"),
        schedule: formData.get("schedule"),
        capacity: formData.get("capacity") ? Number(formData.get("capacity")) : null,
      })
      .eq("id", course.id);
    setSaving(false);
    if (error) {
      setError(error.message);
    } else {
      if (onSaved) onSaved();
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier le cours</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div>Chargement...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du cours</Label>
              <Input id="name" name="name" required defaultValue={course.name} />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select name="type" required defaultValue={course.type}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enfants">Enfants</SelectItem>
                  <SelectItem value="adultes">Adultes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="teacher_id">Professeur</Label>
              <Select name="teacher_id" required defaultValue={course.teacher_id ?? ""}>
                <SelectTrigger id="teacher_id">
                  <SelectValue placeholder="Sélectionner le professeur" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.length === 0 ? (
                    <SelectItem value="" disabled>
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
              <Label htmlFor="room_id">Salle</Label>
              <Select name="room_id" required defaultValue={course.room_id ?? ""}>
                <SelectTrigger id="room_id">
                  <SelectValue placeholder="Sélectionner la salle" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.length === 0 ? (
                    <SelectItem value="" disabled>
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
              <Label htmlFor="price">Prix (€)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min={0}
                step={1}
                required
                defaultValue={course.price ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacité</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min={1}
                step={1}
                required
                defaultValue={course.capacity ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="schedule">Description / horaires</Label>
              <Input id="schedule" name="schedule" defaultValue={course.schedule ?? ""} />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
