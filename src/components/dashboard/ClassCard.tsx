"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Clock, AlertCircle, Plus } from "lucide-react";

interface ClassCardProps {
  course: {
    id: string;
    name: string;
    type: string;
    capacity: number;
    enrolled_count: number;
    teacher_name: string;
    schedule: string;
  };
  onClick?: () => void;
}

export default function ClassCard({ course, onClick }: ClassCardProps) {
  const occupancyPercentage = Math.round((course.enrolled_count / course.capacity) * 100);
  const isComplete = course.enrolled_count >= course.capacity;
  const availableSpots = course.capacity - course.enrolled_count;

  const getStatusColor = () => {
    if (occupancyPercentage >= 90) return "border-red-200 bg-red-50";
    if (occupancyPercentage >= 75) return "border-orange-200 bg-orange-50";
    if (occupancyPercentage >= 50) return "border-yellow-200 bg-yellow-50";
    return "border-green-200 bg-green-50";
  };

  return (
    <div
      className={`p-3 border rounded-lg transition-all hover:shadow-md cursor-pointer ${getStatusColor()}`}
      onClick={onClick}
    >
      {/* Header mobile-first */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{course.name}</h3>
          <Badge
            variant={course.type === "enfants" ? "default" : "secondary"}
            className="text-xs mt-1"
          >
            {course.type}
          </Badge>
        </div>
        <div className="flex items-center gap-1 ml-2">
          {isComplete && <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />}
          <Badge variant={isComplete ? "destructive" : "outline"} className="text-xs">
            {course.enrolled_count}/{course.capacity}
          </Badge>
        </div>
      </div>

      {/* Info compacte pour mobile */}
      <div className="space-y-1 mb-2">
        {course.teacher_name && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{course.teacher_name}</span>
          </p>
        )}
        {course.schedule && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{course.schedule}</span>
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Occupation</span>
          <span
            className={`font-medium ${
              occupancyPercentage >= 90
                ? "text-red-600"
                : occupancyPercentage >= 75
                  ? "text-orange-600"
                  : occupancyPercentage >= 50
                    ? "text-yellow-600"
                    : "text-green-600"
            }`}
          >
            {occupancyPercentage}%
          </span>
        </div>
        <Progress value={occupancyPercentage} className="h-1.5" max={100} />

        {/* Status message */}
        {isComplete ? (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            Complet
          </div>
        ) : availableSpots <= 3 ? (
          <div className="flex items-center gap-1 text-xs text-orange-600">
            <AlertCircle className="h-3 w-3" />
            Plus que {availableSpots} places
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <Plus className="h-3 w-3" />
            {availableSpots} places libres
          </div>
        )}
      </div>
    </div>
  );
}
