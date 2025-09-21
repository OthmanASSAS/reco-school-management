"use client";

import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface ClassesStatsProps {
  courses: Array<{
    capacity: number;
    enrolled_count: number;
  }>;
}

export default function ClassesStats({ courses }: ClassesStatsProps) {
  const totalCapacity = courses.reduce((sum, course) => sum + course.capacity, 0);
  const totalEnrolled = courses.reduce((sum, course) => sum + course.enrolled_count, 0);
  const avgOccupancy = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  const available = courses.filter(c => c.enrolled_count / c.capacity < 0.75).length;
  const almostFull = courses.filter(
    c => c.enrolled_count / c.capacity >= 0.75 && c.enrolled_count / c.capacity < 1
  ).length;
  const full = courses.filter(c => c.enrolled_count >= c.capacity).length;

  return (
    <div className="space-y-3">
      {/* Header avec statistiques globales */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {courses.length} classes • {totalEnrolled}/{totalCapacity} élèves
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <TrendingUp className="h-3 w-3" />
          {avgOccupancy}%
        </Badge>
      </div>

      {/* Stats rapides en grid mobile-friendly */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg">
        <div className="text-center">
          <div className="text-lg sm:text-xl font-bold text-green-600">{available}</div>
          <div className="text-xs text-muted-foreground">Disponibles</div>
        </div>
        <div className="text-center">
          <div className="text-lg sm:text-xl font-bold text-orange-600">{almostFull}</div>
          <div className="text-xs text-muted-foreground">Presque pleines</div>
        </div>
        <div className="text-center">
          <div className="text-lg sm:text-xl font-bold text-red-600">{full}</div>
          <div className="text-xs text-muted-foreground">Complètes</div>
        </div>
      </div>
    </div>
  );
}
