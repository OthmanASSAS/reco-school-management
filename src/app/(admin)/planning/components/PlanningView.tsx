// /Users/oassas/Projets/inscription-app/src/app/(admin)/planning/components/PlanningView.tsx
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  name: string;
  type: string;
  teacher_name: string | null;
  room_name: string | null;
  schedule: string | null;
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

export default function PlanningView({ initialCourses = [] }: { initialCourses?: any[] }) {
  const router = useRouter();
  const [selectedView, setSelectedView] = useState("week");
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  const timeBlocks = [
    { label: "Matin", start: "08:30", end: "12:30", short: "08:30-12:30" },
    { label: "Après-midi", start: "13:30", end: "17:30", short: "13:30-17:30" },
    { label: "Soir", start: "18:00", end: "22:00", short: "18:00-22:00" },
  ];

  const timeRows = weekDays.flatMap(day =>
    timeBlocks.map(block => ({
      day,
      block,
      label: `${day} ${block.short}`,
    }))
  );

  const getDayBackgroundColor = (day: string) => {
    const map: Record<string, string> = {
      Lundi: "bg-blue-50", Mardi: "bg-green-50", Mercredi: "bg-yellow-50", 
      Jeudi: "bg-purple-50", Vendredi: "bg-orange-50", Samedi: "bg-pink-50", Dimanche: "bg-red-50"
    };
    return map[day] || "bg-gray-50";
  };

  const schedule: ScheduleItem[] = useMemo(() => {
    return (initialCourses as Course[])
      .filter(course => course.schedule && course.status === "active")
      .map(course => {
        const parts = (course.schedule || "").split(" ");
        const day = parts[0];
        const times = (parts[1] || "").split("-");
        
        return {
          id: course.id,
          course: course.name,
          teacher: course.teacher_name || "Non assigné",
          room: course.room_name || "Non assignée",
          day: day,
          startTime: times[0] || "08:00",
          endTime: times[1] || "10:00",
          enrolled: course.enrolled_count,
          capacity: course.capacity,
          type: course.type,
        };
      });
  }, [initialCourses]);

  const rooms = useMemo(() => {
    return Array.from(new Set(schedule.map(s => s.room))).sort();
  }, [schedule]);

  return (
    <div className="space-y-6">
      <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="week">Vue par Jour</TabsTrigger>
            <TabsTrigger value="rooms">Vue par Salle</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() - 7)))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">Semaine du {currentWeek.toLocaleDateString('fr-FR')}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() + 7)))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" className="ml-2">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        </div>

        <TabsContent value="week" className="mt-0">
          <div className="grid grid-cols-1 gap-6">
            {weekDays.map(day => {
              const daySchedule = schedule.filter(s => s.day === day);
              if (daySchedule.length === 0) return null;

              return (
                <div key={day} className="space-y-3">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getDayBackgroundColor(day)} border border-current opacity-50`}></span>
                    {day}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {daySchedule.map(item => (
                      <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/courses/${item.id}`)}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="font-bold text-blue-700">{item.course}</div>
                            <Badge variant="secondary" className="text-[10px]">{item.type}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.startTime}-{item.endTime}</div>
                            <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.room}</div>
                            <div className="flex items-center gap-1"><Users className="h-3 w-3" /> {item.teacher}</div>
                            <div className="flex items-center gap-1"><Users className="h-3 w-3" /> {item.enrolled}/{item.capacity} places</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="rooms" className="mt-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border bg-gray-50 text-left text-sm font-medium text-gray-500 w-48">Période / Salle</th>
                  {rooms.map(room => (
                    <th key={room} className="p-2 border bg-gray-50 text-center text-sm font-medium text-gray-900 min-w-[150px]">
                      {room}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeRows.map((row, i) => (
                  <tr key={i}>
                    <td className={`p-2 border text-xs font-medium ${getDayBackgroundColor(row.day)}`}>
                      {row.label}
                    </td>
                    {rooms.map(room => {
                      const match = schedule.find(s => 
                        s.room === room && 
                        s.day === row.day && 
                        s.startTime >= row.block.start && 
                        s.startTime < row.block.end
                      );
                      return (
                        <td key={room} className="p-1 border h-16 align-top">
                          {match && (
                            <div className="bg-blue-100 border-l-4 border-blue-500 p-1 rounded text-[10px] h-full overflow-hidden shadow-sm">
                              <div className="font-bold truncate">{match.course}</div>
                              <div className="text-blue-700 font-medium">{match.startTime}-{match.endTime}</div>
                              <div className="truncate opacity-75">{match.teacher}</div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
