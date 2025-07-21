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
import { createCourse } from "../actions/actions";
import supabase from "@/lib/supabase";

export default async function NewCourseModal({
  onCourseCreated,
}: {
  onCourseCreated?: () => void;
}) {
  // Charger les profs et salles côté serveur
  const { data: teachersData } = await supabase.from("teachers").select("id, full_name");
  const { data: roomsData } = await supabase.from("rooms").select("id, name");
  const teachers = (teachersData || []).map((t: any) => ({ id: t.id, name: t.full_name }));
  const rooms = (roomsData || []).map((r: any) => ({ id: r.id, name: r.name }));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="ml-4">Nouveau cours</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Créer un nouveau cours</DialogTitle>
        </DialogHeader>
        <form action={createCourse} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom du cours</Label>
            <Input id="name" name="name" required placeholder="Nom du cours" />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Select name="type" required>
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
            <Select name="teacher_id" required>
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
            <Select name="room_id" required>
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
              placeholder="Prix du cours"
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
              placeholder="Nombre de places"
            />
          </div>
          <div>
            <Label htmlFor="schedule">Description / horaires</Label>
            <Input id="schedule" name="schedule" placeholder="Ex: Lundi 18h-20h" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit">Créer le cours</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
