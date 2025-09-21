"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Eye, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import CompactClassCard from "./CompactClassCard";

interface Course {
  id: string;
  name: string;
  type: string;
  capacity: number;
  enrolled_count: number;
}

interface CompactClassesOverviewProps {
  courses: Course[];
}

export default function CompactClassesOverview({ courses }: CompactClassesOverviewProps) {
  const router = useRouter();

  const totalCapacity = courses.reduce((sum, course) => sum + course.capacity, 0);
  const totalEnrolled = courses.reduce((sum, course) => sum + course.enrolled_count, 0);
  const avgOccupancy = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  const available = courses.filter(c => c.enrolled_count / c.capacity < 0.75).length;
  const almostFull = courses.filter(
    c => c.enrolled_count / c.capacity >= 0.75 && c.enrolled_count / c.capacity < 1
  ).length;
  const full = courses.filter(c => c.enrolled_count >= c.capacity).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4 text-blue-600" />
            Classes ({courses.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs gap-1">
              <TrendingUp className="h-3 w-3" />
              {avgOccupancy}%
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push("/courses")}
              className="text-xs"
            >
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Stats rapides en une ligne */}
        <div className="flex justify-between text-center bg-slate-50 rounded-lg p-2">
          <div>
            <div className="text-sm font-bold text-green-600">{available}</div>
            <div className="text-xs text-muted-foreground">Libres</div>
          </div>
          <div>
            <div className="text-sm font-bold text-orange-600">{almostFull}</div>
            <div className="text-xs text-muted-foreground">Presque</div>
          </div>
          <div>
            <div className="text-sm font-bold text-red-600">{full}</div>
            <div className="text-xs text-muted-foreground">Pleines</div>
          </div>
          <div>
            <div className="text-sm font-bold text-blue-600">{totalEnrolled}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>

        {/* Grid compact des classes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {courses.map(course => (
            <CompactClassCard
              key={course.id}
              course={course}
              onClick={() => router.push(`/courses/${course.id}`)}
            />
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-1 opacity-50" />
            <p className="text-xs">Aucune classe</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
