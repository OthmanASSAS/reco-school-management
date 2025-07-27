"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Download,
  BookOpen,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import supabase from "@/lib/supabase";

interface Course {
  id: string;
  name: string;
  type: string;
  teacher_name: string | null;
  room_name: string | null;
  schedule: string;
  enrolled_count: number;
  capacity: number;
  status: string;
}

interface ScheduleItem {
  id: string;
  course: string;
  teacher: string;
  room: string;
  day: string;
  startTime: string;
  endTime: string;
  enrolled: number;
  capacity: number;
  type: string;
}

export default function PlanningView() {
  const [selectedView, setSelectedView] = useState("week");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [rooms, setRooms] = useState<string[]>([]);

  const weekDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  // Créer les blocs de 4h
  const timeBlocks = [
    { label: "Matin", start: "08:30", end: "12:30", short: "08:30-12:30" },
    { label: "Après-midi", start: "13:30", end: "17:30", short: "13:30-17:30" },
    { label: "Soir", start: "18:00", end: "22:00", short: "18:00-22:00" },
  ];

  // Créer les lignes combinées (jour + bloc horaire)
  const timeRows = weekDays.flatMap(day =>
    timeBlocks.map(block => ({
      day,
      block,
      label: `${day} ${block.short}`,
    }))
  );

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // Récupérer les cours
      const { data: coursesData, error: coursesError } = await supabase.from("courses").select(`
          id, name, type, status, capacity, schedule, room_id, teacher_id,
          teachers(full_name), enrollments(id)
        `);

      if (coursesError) throw coursesError;

      // Récupérer toutes les salles
      const { data: roomsData, error: roomsError } = await supabase
        .from("rooms")
        .select("id, name");
      if (roomsError) throw roomsError;

      console.log("🏫 Salles disponibles:", roomsData);

      // Créer un map des salles
      const roomsMap = new Map(roomsData?.map(room => [room.id, room.name]) || []);

      const coursesWithDetails = (coursesData || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        teacher_name: c.teachers?.[0]?.full_name ?? "Non assigné",
        room_name: c.room_id ? roomsMap.get(c.room_id) || "Salle inconnue" : "Non assignée",
        schedule: c.schedule || "",
        enrolled_count: c.enrollments ? c.enrollments.length : 0,
        capacity: c.capacity,
        status: c.status,
      }));

      console.log("📊 Données reçues de Supabase:");
      console.log("   - Nombre de cours:", coursesData?.length);
      console.log("   - Premier cours:", coursesData?.[0]);
      console.log("   - Cours avec détails:", coursesWithDetails);

      // Extraire les salles uniques des cours
      const uniqueRooms = Array.from(
        new Set(
          coursesWithDetails
            .filter(course => course.room_name && course.room_name !== "Non assignée")
            .map(course => course.room_name)
        )
      ).sort();

      console.log("🏫 Salles utilisées:", uniqueRooms);

      // Si aucune salle trouvée, utiliser toutes les salles disponibles
      if (uniqueRooms.length === 0) {
        console.log("⚠️ Aucune salle utilisée, affichage de toutes les salles");
        setRooms(roomsData?.map(room => room.name) || []);
      } else {
        setRooms(uniqueRooms);
      }
      setCourses(coursesWithDetails);
    } catch (error) {
      console.error("Erreur lors du chargement des cours:", error);
    } finally {
      setLoading(false);
    }
  };

  // Convertir les cours en éléments de planning
  const schedule: ScheduleItem[] = courses
    .filter(course => {
      console.log(`🔍 Filtrage cours "${course.name}":`);
      console.log(`   - Status: ${course.status}`);
      console.log(`   - Schedule: "${course.schedule}"`);
      console.log(
        `   - Active avec schedule: ${course.status === "active" && course.schedule ? "✅" : "❌"}`
      );
      return course.schedule && course.status === "active";
    })
    .map(course => {
      console.log(`📅 Parsing schedule pour "${course.name}": "${course.schedule}"`);

      // Parse simple du schedule (format: "Lundi 09:00-12:00" ou "Lundi 9:00-12:00")
      const scheduleMatch = course.schedule.match(/(\w+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
      if (!scheduleMatch) {
        console.log(`   ❌ Schedule non parsé: "${course.schedule}"`);
        return null;
      }

      const [, day, startTime, endTime] = scheduleMatch;
      console.log(`   ✅ Schedule parsé: ${day} ${startTime}-${endTime}`);

      // Normaliser les heures (ajouter un 0 si nécessaire)
      const normalizeTime = (time: string) => {
        const [hours, minutes] = time.split(":");
        return `${hours.padStart(2, "0")}:${minutes}`;
      };

      return {
        id: course.id,
        course: course.name,
        teacher: course.teacher_name,
        room: course.room_name,
        day: day,
        startTime: normalizeTime(startTime),
        endTime: normalizeTime(endTime),
        enrolled: course.enrolled_count,
        capacity: course.capacity,
        type: course.type,
      };
    })
    .filter(Boolean) as ScheduleItem[];

  const getOccupancyColor = (enrolled: number, capacity: number) => {
    const rate = enrolled / capacity;
    if (rate >= 0.9) return "bg-red-100 border-red-300 text-red-800";
    if (rate >= 0.7) return "bg-orange-100 border-orange-300 text-orange-800";
    return "bg-green-100 border-green-300 text-green-800";
  };

  const getCourseHeight = (startTime: string, endTime: string) => {
    const start = parseInt(startTime.split(":")[0]);
    const end = parseInt(endTime.split(":")[0]);
    return Math.max((end - start) * 20, 80); // Minimum 80px height, 20px per hour for 4h blocks
  };

  const getCoursePosition = (startTime: string) => {
    const hour = parseInt(startTime.split(":")[0]);
    return (hour - 8) * 60; // Start from 8AM, 60px per hour
  };

  const formatWeekRange = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday

    const end = new Date(start);
    end.setDate(end.getDate() + 5); // Saturday

    return `${start.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} au ${end.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`;
  };

  const changeWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeek(newDate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <span className="text-gray-600">Chargement du planning...</span>
        </div>
      </div>
    );
  }

  // Debug: afficher les informations
  console.log("🔍 Debug PlanningView:");
  console.log("   - Courses:", courses.length);
  console.log("   - Schedule items:", schedule.length);
  console.log("   - Schedule details:", schedule);

  // Message d'information si aucun cours avec schedule
  if (schedule.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Planning des cours</h2>
            <p className="text-gray-600">Semaine du {formatWeekRange(currentWeek)}</p>
          </div>
        </div>

        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun planning disponible</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Pour voir votre planning, ajoutez des horaires à vos cours dans le format :
            <br />
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">"Lundi 09:00-12:00"</code>
          </p>
          <Button variant="outline" onClick={() => (window.location.href = "/courses")}>
            Aller aux cours
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Planning des cours</h2>
          <p className="text-gray-600">Semaine du {formatWeekRange(currentWeek)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => changeWeek("prev")}>
            <ChevronLeft size={16} className="mr-1" />
            Précédente
          </Button>
          <Button variant="outline" size="sm" onClick={() => changeWeek("next")}>
            Suivante
            <ChevronRight size={16} className="ml-1" />
          </Button>
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="week">Vue semaine</TabsTrigger>
          <TabsTrigger value="day">Vue jour</TabsTrigger>
          <TabsTrigger value="room">Par salle</TabsTrigger>
        </TabsList>

        <TabsContent value="week" className="space-y-4">
          <div className="bg-white rounded-lg border overflow-x-auto shadow-sm">
            <div
              className={`grid min-w-[1200px]`}
              style={{ gridTemplateColumns: `200px repeat(${rooms.length}, 1fr)` }}
            >
              {/* Header avec salles */}
              <div className="p-4 border-b border-r bg-gradient-to-r from-blue-50 to-indigo-50">
                <span className="text-sm font-semibold text-gray-700">Jours / Horaires</span>
              </div>
              {rooms.map(room => (
                <div
                  key={room}
                  className="p-4 border-b border-r bg-gradient-to-r from-blue-50 to-indigo-50 text-center"
                >
                  <span className="text-sm font-semibold text-gray-900">{room}</span>
                </div>
              ))}

              {/* Grille des jours/horaires */}
              {timeRows.map(row => (
                <div key={row.label} className="contents">
                  <div className="p-3 border-r bg-gray-50 text-xs text-gray-600 flex items-center justify-center font-medium">
                    {row.label}
                  </div>
                  {rooms.map(room => {
                    const coursesInRoom = schedule.filter(
                      course =>
                        (course.room === room ||
                          (room === "Non assignée" && course.room === "Non assignée")) &&
                        course.day === row.day &&
                        parseInt(course.startTime.split(":")[0]) >=
                          parseInt(row.block.start.split(":")[0]) &&
                        parseInt(course.startTime.split(":")[0]) <
                          parseInt(row.block.end.split(":")[0])
                    );

                    return (
                      <div
                        key={`${room}-${row.label}`}
                        className="relative p-1 border-r border-b min-h-[120px] bg-gray-25 hover:bg-gray-50 transition-colors"
                      >
                        {coursesInRoom.map(course => (
                          <div
                            key={course.id}
                            className={`absolute left-1 right-1 p-3 rounded-lg border-2 ${getOccupancyColor(course.enrolled, course.capacity)} shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group`}
                            style={{
                              top: "4px",
                              height: `${getCourseHeight(course.startTime, course.endTime)}px`,
                              zIndex: 10,
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm truncate mb-1">
                                  {course.course}
                                </div>
                                <div className="text-xs opacity-80 truncate mb-1">
                                  👨‍🏫 {course.teacher}
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-xs font-medium">
                                    {course.enrolled}/{course.capacity} élèves
                                  </div>
                                  <div
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      course.type === "enfants"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-purple-100 text-purple-800"
                                    }`}
                                  >
                                    {course.type}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="day" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedule
              .filter(item => item.day === "Lundi") // Example: show Monday's schedule
              .map(course => (
                <Card
                  key={course.id}
                  className="hover:shadow-md transition-shadow border-0 shadow-sm"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{course.course}</CardTitle>
                      <Badge
                        variant={course.type === "enfants" ? "default" : "secondary"}
                        className={
                          course.type === "enfants"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }
                      >
                        {course.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={14} />
                      <span>
                        {course.startTime} - {course.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={14} />
                      <span>{course.room}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users size={14} />
                      <span>{course.teacher}</span>
                    </div>
                    <div
                      className={`text-sm px-2 py-1 rounded-full ${getOccupancyColor(course.enrolled, course.capacity)} w-fit`}
                    >
                      {course.enrolled}/{course.capacity} élèves
                    </div>
                  </CardContent>
                </Card>
              ))}
            {schedule.filter(item => item.day === "Lundi").length === 0 && (
              <div className="col-span-full text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun cours programmé pour ce jour</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="room" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from(new Set(schedule.map(course => course.room))).map(room => {
              const roomSchedule = schedule.filter(course => course.room === room);
              return (
                <Card key={room} className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin size={18} />
                      {room}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {roomSchedule.map(course => (
                      <div key={course.id} className="p-3 border rounded-lg bg-gray-50/50">
                        <div className="font-medium">{course.course}</div>
                        <div className="text-sm text-gray-600">
                          {course.day} {course.startTime}-{course.endTime}
                        </div>
                        <div className="text-sm text-gray-600">{course.teacher}</div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${getOccupancyColor(course.enrolled, course.capacity)} w-fit mt-2`}
                        >
                          {course.enrolled}/{course.capacity}
                        </div>
                      </div>
                    ))}
                    {roomSchedule.length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-4">
                        Aucun cours programmé
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
