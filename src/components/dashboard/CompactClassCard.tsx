"use client";

import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface CompactClassCardProps {
  course: {
    id: string;
    name: string;
    type: string;
    capacity: number;
    enrolled_count: number;
  };
  onClick?: () => void;
}

export default function CompactClassCard({ course, onClick }: CompactClassCardProps) {
  const occupancyPercentage = Math.round((course.enrolled_count / course.capacity) * 100);
  const isComplete = course.enrolled_count >= course.capacity;

  const getStatusColor = () => {
    if (occupancyPercentage >= 100) return "border-red-500 bg-red-50";
    if (occupancyPercentage >= 90) return "border-orange-500 bg-orange-50";
    if (occupancyPercentage >= 75) return "border-yellow-500 bg-yellow-50";
    return "border-green-500 bg-green-50";
  };

  const getProgressColor = () => {
    if (occupancyPercentage >= 100) return "bg-red-500";
    if (occupancyPercentage >= 90) return "bg-orange-500";
    if (occupancyPercentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div
      className={`p-2 border rounded-lg cursor-pointer hover:shadow-sm transition-all ${getStatusColor()}`}
      onClick={onClick}
    >
      {/* Header compact */}
      <div className="flex items-start justify-between mb-1">
        <h4 className="font-medium text-xs truncate flex-1 mr-1">{course.name}</h4>
        <div className="flex items-center gap-1">
          {isComplete && <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />}
          <Badge
            variant={course.type === "enfants" ? "default" : "secondary"}
            className="text-xs px-1 py-0"
          >
            {course.type === "enfants" ? "E" : "A"}
          </Badge>
        </div>
      </div>

      {/* Effectif et barre */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {course.enrolled_count}/{course.capacity}
          </span>
          <span
            className={`font-medium ${
              occupancyPercentage >= 100
                ? "text-red-600"
                : occupancyPercentage >= 90
                  ? "text-orange-600"
                  : occupancyPercentage >= 75
                    ? "text-yellow-600"
                    : "text-green-600"
            }`}
          >
            {occupancyPercentage}%
          </span>
        </div>

        {/* Mini progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div
            className={`h-1 rounded-full transition-all ${getProgressColor()}`}
            style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
