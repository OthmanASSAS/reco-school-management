"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Calendar, Clock, BookOpen } from "lucide-react";
import supabase from "@/lib/supabase";

interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  created_at: string;
}

interface Course {
  id: string;
  name: string;
  type: string;
  category: string;
  label: string;
  status: string;
  schedule?: string;
  teacher_name?: string;
  enrollments_count: number;
  school_year_label?: string;
}

interface RoomDetailsModalProps {
  room: Room | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RoomDetailsModal({ room, open, onOpenChange }: RoomDetailsModalProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (room && open) {
      fetchRoomCourses();
    }
  }, [room, open]);

  const fetchRoomCourses = async () => {
    if (!room) return;

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
          schedule,
          school_year_id
        `
        )
        .eq("room_id", room.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur lors du chargement des cours:", error);
        return;
      }

      // Transformer les données
      const transformedCourses = (data || []).map(course => ({
        id: course.id,
        name: course.name,
        type: course.type,
        category: course.category,
        label: course.label,
        status: course.status,
        schedule: course.schedule,
        teacher_name: "Professeur assigné", // Simplifié pour l'instant
        enrollments_count: 0, // Simplifié pour l'instant
        school_year_label: "2024-2025", // Simplifié pour l'instant
      }));

      setCourses(transformedCourses);
    } catch (error) {
      console.error("Erreur lors du chargement des cours:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        label: "Actif",
        variant: "default" as const,
        className: "bg-green-100 text-green-800",
      },
      inactive: {
        label: "Inactif",
        variant: "secondary" as const,
        className: "bg-gray-100 text-gray-800",
      },
      finished: {
        label: "Terminé",
        variant: "outline" as const,
        className: "bg-blue-100 text-blue-800",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      group: { label: "Groupe", className: "bg-purple-100 text-purple-800" },
      individual: { label: "Individuel", className: "bg-orange-100 text-orange-800" },
      online: { label: "En ligne", className: "bg-blue-100 text-blue-800" },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.group;

    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!room) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <DialogTitle className="text-3xl font-bold text-gray-900">{room.name}</DialogTitle>
          <p className="text-gray-600 mt-2">Détails de la salle de cours</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{room.capacity}</div>
                <div className="text-sm text-gray-600">Capacité</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin size={20} className="text-green-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{room.location}</div>
                <div className="text-sm text-gray-600">Localisation</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar size={20} className="text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatDate(room.created_at)}
                </div>
                <div className="text-sm text-gray-600">Ajoutée le</div>
              </div>
            </div>
          </div>

          {/* Cours associés */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen size={20} className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Cours associés</h3>
                <p className="text-sm text-gray-600">
                  {loading
                    ? "Chargement..."
                    : `${courses.length} cours trouvé${courses.length > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 mt-2">Chargement des cours...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Aucun cours associé</h4>
                <p className="text-gray-500">Cette salle n'a pas encore de cours assignés.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map(course => (
                  <Card key={course.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg text-gray-900">{course.name}</h4>
                            <div className="flex gap-1">
                              {getStatusBadge(course.status)}
                              {getTypeBadge(course.type)}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">
                            {course.label} • {course.category}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Users size={14} className="text-gray-400" />
                              <span className="text-gray-600">
                                {course.enrollments_count} inscrit
                                {course.enrollments_count > 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-gray-400" />
                              <span className="text-gray-600">
                                {course.schedule || "Horaires non définis"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {course.teacher_name}
                          </div>
                          <div className="text-xs text-gray-500">Professeur</div>
                          {course.school_year_label && (
                            <div className="text-xs text-purple-600 mt-1">
                              {course.school_year_label}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
