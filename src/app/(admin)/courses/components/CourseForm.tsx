"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, BookOpen, AlertCircle } from "lucide-react";
import supabase from "@/lib/supabase";

interface CourseFormProps {
  onCourseCreated: () => void;
  onCourseUpdated: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  course?: any;
  teachers?: { id: string; full_name: string }[];
  rooms?: { id: string; name: string }[];
}

interface Subject {
  id?: string;
  name: string;
  description: string;
  color: string;
  order_index: number;
}

export default function CourseForm({
  onCourseCreated,
  onCourseUpdated,
  course,
  teachers,
  rooms,
}: CourseFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Données du cours
  const [courseData, setCourseData] = useState({
    name: course?.name || "",
    label: course?.label || "",
    type: course?.type || "enfants",
    category: course?.category || "Arabe",
    description: course?.description || "",
    teacher_id: course?.teacher_id || "",
    room_id: course?.room_id || "",
    schedule: course?.schedule || "",
    capacity: course?.capacity || 15,
    price: course?.price || 350,
    status: course?.status || "active",
    audience: course?.audience || "Mixte",
  });

  // Matières du cours
  const [subjects, setSubjects] = useState<Subject[]>(course?.subjects || []);
  const [newSubject, setNewSubject] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
    order_index: 0,
  });

  const colors = [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#EF4444", // Red
    "#8B5CF6", // Purple
    "#06B6D4", // Cyan
    "#F97316", // Orange
    "#EC4899", // Pink
    "#059669", // Emerald
    "#DC2626", // Red
    "#7C3AED", // Violet
    "#EA580C", // Orange
  ];

  const loadCourseSubjects = useCallback(async () => {
    if (!course?.id) return;

    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("course_id", course.id)
        .order("order_index");

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des matières:", error);
    }
  }, [course?.id]);

  useEffect(() => {
    if (course) {
      loadCourseSubjects();
    }
  }, [course, loadCourseSubjects]);

  const addSubject = () => {
    if (!newSubject.name.trim()) return;

    const subject: Subject = {
      ...newSubject,
      order_index: subjects.length + 1,
    };

    setSubjects([...subjects, subject]);
    setNewSubject({
      name: "",
      description: "",
      color: "#3B82F6",
      order_index: 0,
    });
  };

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const updateSubjectOrder = (index: number, direction: "up" | "down") => {
    const newSubjects = [...subjects];
    if (direction === "up" && index > 0) {
      [newSubjects[index], newSubjects[index - 1]] = [newSubjects[index - 1], newSubjects[index]];
    } else if (direction === "down" && index < newSubjects.length - 1) {
      [newSubjects[index], newSubjects[index + 1]] = [newSubjects[index + 1], newSubjects[index]];
    }
    setSubjects(newSubjects);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      let courseId: string;

      if (course) {
        // Mise à jour du cours existant
        const { error: courseError } = await supabase
          .from("courses")
          .update(courseData)
          .eq("id", course.id);

        if (courseError) throw courseError;
        courseId = course.id;
      } else {
        // Création d'un nouveau cours
        const { data: newCourse, error: courseError } = await supabase
          .from("courses")
          .insert(courseData)
          .select()
          .single();

        if (courseError) throw courseError;
        courseId = newCourse.id;
      }

      // Gérer les matières
      if (courseId) {
        // Supprimer les anciennes matières
        await supabase.from("subjects").delete().eq("course_id", courseId);

        // Insérer les nouvelles matières
        if (subjects.length > 0) {
          const subjectsToInsert = subjects.map((subject, index) => ({
            course_id: courseId,
            name: subject.name,
            description: subject.description,
            color: subject.color,
            order_index: index + 1,
          }));

          const { error: subjectsError } = await supabase.from("subjects").insert(subjectsToInsert);

          if (subjectsError) throw subjectsError;
        }
      }

      setMessage({
        type: "success",
        text: course ? "Cours mis à jour avec succès !" : "Cours créé avec succès !",
      });
      setOpen(false);

      if (course) {
        onCourseUpdated();
      } else {
        onCourseCreated();
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessage({ type: "error", text: "Erreur lors de la sauvegarde" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          {course ? "Modifier le cours" : "Nouveau cours"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {course ? "Modifier le cours" : "Créer un nouveau cours"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <Alert
              className={
                message.type === "success"
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
              }
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Informations de base du cours */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du cours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom du cours</Label>
                  <Input
                    id="name"
                    value={courseData.name}
                    onChange={e => setCourseData({ ...courseData, name: e.target.value })}
                    placeholder="Ex: Arabe 1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="label">Label affiché</Label>
                  <Input
                    id="label"
                    value={courseData.label}
                    onChange={e => setCourseData({ ...courseData, label: e.target.value })}
                    placeholder="Ex: Arabe Débutant"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={courseData.type}
                    onValueChange={value => setCourseData({ ...courseData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enfants">Enfants</SelectItem>
                      <SelectItem value="adultes">Adultes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Select
                    value={courseData.category}
                    onValueChange={value => setCourseData({ ...courseData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arabe">Arabe</SelectItem>
                      <SelectItem value="Coran">Coran</SelectItem>
                      <SelectItem value="Maternelle">Maternelle</SelectItem>
                      <SelectItem value="Scolaire">Scolaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="teacher">Professeur</Label>
                  <Select
                    value={courseData.teacher_id}
                    onValueChange={value => setCourseData({ ...courseData, teacher_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un professeur" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers?.map(teacher => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="room">Salle</Label>
                  <Select
                    value={courseData.room_id}
                    onValueChange={value => setCourseData({ ...courseData, room_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une salle" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms?.map(room => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="schedule">Horaire</Label>
                  <Input
                    id="schedule"
                    value={courseData.schedule}
                    onChange={e => setCourseData({ ...courseData, schedule: e.target.value })}
                    placeholder="Ex: Mercredi 14h-16h"
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacité</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={courseData.capacity}
                    onChange={e =>
                      setCourseData({ ...courseData, capacity: parseInt(e.target.value) })
                    }
                    min="1"
                    max="50"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Prix (€)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={courseData.price}
                    onChange={e =>
                      setCourseData({ ...courseData, price: parseInt(e.target.value) })
                    }
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="audience">Public</Label>
                  <Select
                    value={courseData.audience}
                    onValueChange={value => setCourseData({ ...courseData, audience: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hommes">Hommes</SelectItem>
                      <SelectItem value="Femmes">Femmes</SelectItem>
                      <SelectItem value="Mixte">Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={courseData.description}
                  onChange={e => setCourseData({ ...courseData, description: e.target.value })}
                  placeholder="Description du cours..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Gestion des matières */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Matières du cours</span>
                <Badge variant="secondary">{subjects.length} matière(s)</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Ajouter une nouvelle matière */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3">Ajouter une matière</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <Label htmlFor="subject-name">Nom de la matière</Label>
                    <Input
                      id="subject-name"
                      value={newSubject.name}
                      onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
                      placeholder="Ex: Lecture"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject-description">Description</Label>
                    <Input
                      id="subject-description"
                      value={newSubject.description}
                      onChange={e => setNewSubject({ ...newSubject, description: e.target.value })}
                      placeholder="Ex: Lecture et compréhension"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject-color">Couleur</Label>
                    <div className="flex gap-1">
                      {colors.slice(0, 6).map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 ${
                            newSubject.color === color ? "border-gray-800" : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewSubject({ ...newSubject, color })}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={addSubject}
                      disabled={!newSubject.name.trim()}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              </div>

              {/* Liste des matières */}
              {subjects.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Matières configurées</h4>
                  {subjects.map((subject, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        <div>
                          <p className="font-medium">{subject.name}</p>
                          <p className="text-sm text-gray-600">{subject.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateSubjectOrder(index, "up")}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateSubjectOrder(index, "down")}
                          disabled={index === subjects.length - 1}
                        >
                          ↓
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSubject(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {subjects.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <p>Aucune matière configurée</p>
                  <p className="text-sm">Ajoutez des matières pour ce cours</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Sauvegarde..." : course ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
