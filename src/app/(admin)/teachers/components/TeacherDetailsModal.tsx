"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, BookOpen, Users, MapPin, Calendar, Euro, Clock, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase";

interface Teacher {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
}

interface Course {
  id: string;
  name: string;
  type: string;
  category: string;
  label: string;
  status: string;
  capacity: number;
  schedule?: string;
  room_name?: string;
  school_year_id?: string;
  school_year_label?: string;
  enrollments: Enrollment[];
  created_at: string;
}

interface Enrollment {
  id: string;
  status: string;
  school_year_id?: string;
}

interface TeacherDetailsModalProps {
  teacher: Teacher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TeacherDetailsModal({
  teacher,
  open,
  onOpenChange,
}: TeacherDetailsModalProps) {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les cours du professeur
  useEffect(() => {
    if (teacher && open) {
      fetchTeacherCourses();
    }
  }, [teacher, open]);

  const fetchTeacherCourses = async () => {
    if (!teacher) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select(
          `
          id,
          name,
          type,
          category,
          label,
          status,
          capacity,
          schedule,
          created_at,
          school_year_id,
          rooms(name),
          enrollments(
            id,
            status,
            school_year_id
          ),
          school_years(label)
        `
        )
        .eq("teacher_id", teacher.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Erreur lors du chargement des cours.",
        });
        return;
      }

      // Transformer les données
      const transformedCourses = (data || []).map((course: any) => ({
        id: course.id,
        name: course.name,
        type: course.type,
        category: course.category,
        label: course.label,
        status: course.status,
        capacity: course.capacity,
        schedule: course.schedule,
        room_name: course.rooms?.name,
        school_year_id: course.school_year_id,
        school_year_label: course.school_years?.label,
        enrollments: course.enrollments || [],
        created_at: course.created_at,
      }));

      setCourses(transformedCourses);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors du chargement des cours.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Actif
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        Inactif
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    return type === "enfants" ? (
      <Badge variant="outline" className="border-blue-200 text-blue-700">
        Enfants
      </Badge>
    ) : (
      <Badge variant="outline" className="border-purple-200 text-purple-700">
        Adultes
      </Badge>
    );
  };

  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Détails du professeur</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations du professeur */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                {teacher.full_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={16} />
                <span>{teacher.email || "Aucun email"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={16} />
                <span>{teacher.phone || "Aucun téléphone"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} />
                <span>Membre depuis {formatDate(teacher.created_at)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
                  <div className="text-sm text-gray-600">Classes total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {courses.filter(c => c.status === "active").length}
                  </div>
                  <div className="text-sm text-gray-600">Classes actives</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {courses.reduce((sum, c) => sum + c.enrollments.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Élèves total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {new Set(courses.map(c => c.school_year_label)).size}
                  </div>
                  <div className="text-sm text-gray-600">Années scolaires</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Classes du professeur */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen size={20} />
                Classes ({courses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Chargement des cours...</div>
              ) : courses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucun cours assigné à ce professeur.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Grouper les cours par année scolaire */}
                  {(() => {
                    // Grouper les cours par année scolaire
                    const coursesByYear = courses.reduce(
                      (acc, course) => {
                        const year = course.school_year_label || "Année non définie";
                        if (!acc[year]) {
                          acc[year] = [];
                        }
                        acc[year].push(course);
                        return acc;
                      },
                      {} as Record<string, typeof courses>
                    );

                    // Trier les années (plus récentes en premier)
                    const sortedYears = Object.keys(coursesByYear).sort((a, b) => {
                      if (a === "Année non définie") return 1;
                      if (b === "Année non définie") return -1;
                      return b.localeCompare(a); // Ordre décroissant
                    });

                    return sortedYears.map(year => (
                      <div key={year} className="space-y-4">
                        {/* En-tête de l'année avec design amélioré */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Calendar size={20} className="text-blue-600" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">{year}</h3>
                                <p className="text-sm text-gray-600">Année scolaire</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="bg-blue-600 text-white px-3 py-1">
                                {coursesByYear[year].length} classe
                                {coursesByYear[year].length > 1 ? "s" : ""}
                              </Badge>
                              <div className="text-sm text-gray-500">
                                {coursesByYear[year].reduce(
                                  (sum, c) => sum + c.enrollments.length,
                                  0
                                )}{" "}
                                élèves total
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Cartes en pleine largeur */}
                        <div className="space-y-4">
                          {coursesByYear[year].map(course => (
                            <Card
                              key={course.id}
                              className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white"
                            >
                              <CardContent className="p-6">
                                {/* En-tête de la classe */}
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {course.name}
                                      </h3>
                                      <div className="flex gap-1">
                                        {getStatusBadge(course.status)}
                                        {getTypeBadge(course.type)}
                                      </div>
                                    </div>
                                    <p className="text-gray-600 text-sm font-medium">
                                      {course.label} • {course.category}
                                    </p>
                                  </div>

                                  {/* Statistiques principales */}
                                  <div className="text-center sm:text-right">
                                    <div className="text-2xl font-bold text-green-600 mb-1">
                                      {course.enrollments.length}
                                    </div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                                      inscrits
                                    </div>
                                  </div>
                                </div>

                                {/* Barre de progression pour le taux de remplissage */}
                                <div className="mb-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">
                                      Taux de remplissage
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      {Math.round(
                                        (course.enrollments.length / course.capacity) * 100
                                      )}
                                      %
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${Math.min((course.enrollments.length / course.capacity) * 100, 100)}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>

                                {/* Informations détaillées */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <div className="p-1 bg-blue-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                      <Users size={12} className="text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                      <div className="font-medium text-gray-900 truncate">
                                        {course.enrollments.length}/{course.capacity}
                                      </div>
                                      <div className="text-gray-500">élèves</div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <div className="p-1 bg-purple-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                      <MapPin size={12} className="text-purple-600" />
                                    </div>
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                      <div className="font-medium text-gray-900 truncate">
                                        {course.room_name || "Non assignée"}
                                      </div>
                                      <div className="text-gray-500">salle</div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg sm:col-span-2">
                                    <div className="p-1 bg-orange-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                      <Clock size={12} className="text-orange-600" />
                                    </div>
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                      <div className="font-medium text-gray-900 truncate">
                                        {course.schedule || "Non définis"}
                                      </div>
                                      <div className="text-gray-500">horaires</div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
