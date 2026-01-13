"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  createSubject,
  updateSubject,
  deleteSubject,
  copySubjectsFromTemplate,
  type Subject as ServerSubject,
} from "../actions/subjects-actions.server";

interface Subject {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  orderIndex: number;
  isActive: boolean;
}

interface Course {
  id: string;
  name: string;
  label: string;
}

interface SubjectsManagerProps {
  courseId: string;
  subjects: Subject[];
  allCourses: Course[];
}

const DEFAULT_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#EC4899", // Pink
];

export function SubjectsManager({ courseId, subjects, allCourses }: SubjectsManagerProps) {
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [, setEditingSubject] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState({
    name: "",
    description: "",
    color: DEFAULT_COLORS[0],
  });
  const { toast } = useToast();

  const handleAddSubject = async () => {
    if (!newSubject.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la matière est requis.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createSubject({
        name: newSubject.name,
        description: newSubject.description || undefined,
        color: newSubject.color,
        order_index: 0, // Sera calculé automatiquement
        is_active: true,
        course_id: courseId,
      });

      if (result.success) {
        toast({
          title: "Succès",
          description: result.message,
        });
        setNewSubject({ name: "", description: "", color: DEFAULT_COLORS[0] });
        setIsAddingSubject(false);
        // Recharger la page pour afficher les nouvelles données
        window.location.reload();
      } else {
        toast({
          title: "Erreur",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout de la matière.",
        variant: "destructive",
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEditSubject = async (subjectId: string, data: Partial<ServerSubject>) => {
    try {
      const result = await updateSubject(subjectId, data);

      if (result.success) {
        toast({
          title: "Succès",
          description: result.message,
        });
        setEditingSubject(null);
        window.location.reload();
      } else {
        toast({
          title: "Erreur",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette matière ?")) {
      return;
    }

    try {
      const result = await deleteSubject(subjectId);

      if (result.success) {
        toast({
          title: "Succès",
          description: result.message,
        });
        window.location.reload();
      } else {
        toast({
          title: "Erreur",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression.",
        variant: "destructive",
      });
    }
  };

  const handleCopyFromTemplate = async (templateCourseId: string) => {
    try {
      const result = await copySubjectsFromTemplate(courseId, templateCourseId);

      if (result.success) {
        toast({
          title: "Succès",
          description: result.message,
        });
        window.location.reload();
      } else {
        toast({
          title: "Erreur",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Erreur lors de la copie des matières.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Actions principales */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setIsAddingSubject(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une matière
          </Button>

          <Select onValueChange={handleCopyFromTemplate}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Copier depuis un template" />
            </SelectTrigger>
            <SelectContent>
              {allCourses
                .filter(course => course.id !== courseId)
                .map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-gray-500">{subjects.length} matière(s) configurée(s)</div>
      </div>

      {/* Formulaire d'ajout */}
      {isAddingSubject && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Nouvelle matière</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Nom de la matière
                </label>
                <Input
                  value={newSubject.name}
                  onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
                  placeholder="Ex: Lecture, Grammaire..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                <Textarea
                  value={newSubject.description}
                  onChange={e => setNewSubject({ ...newSubject, description: e.target.value })}
                  placeholder="Description optionnelle..."
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Couleur</label>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: newSubject.color }}
                  />
                  <Select
                    value={newSubject.color}
                    onValueChange={color => setNewSubject({ ...newSubject, color })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_COLORS.map(color => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                            <span>{color}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingSubject(false);
                  setNewSubject({ name: "", description: "", color: DEFAULT_COLORS[0] });
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleAddSubject} className="bg-blue-600 hover:bg-blue-700">
                Ajouter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des matières */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map(subject => (
          <Card key={subject.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: subject.color || "#3B82F6" }}
                  />
                  <div>
                    <CardTitle className="text-lg">{subject.name}</CardTitle>
                    {subject.description && (
                      <p className="text-sm text-gray-600 mt-1">{subject.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {!subject.isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Inactif
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setEditingSubject(subject.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSubject(subject.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Message si aucune matière */}
      {subjects.length === 0 && !isAddingSubject && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune matière configurée pour ce cours.</p>
              <p className="text-sm mt-2">
                Ajoutez des matières pour commencer à saisir les notes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
