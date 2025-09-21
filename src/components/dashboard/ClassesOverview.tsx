"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Eye, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import ClassCard from "./ClassCard";
import ClassesStats from "./ClassesStats";

interface Course {
  id: string;
  name: string;
  type: string;
  capacity: number;
  enrolled_count: number;
  teacher_name: string;
  schedule: string;
}

interface ClassesOverviewProps {
  courses: Course[];
}

export default function ClassesOverview({ courses }: ClassesOverviewProps) {
  const router = useRouter();

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BookOpen className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <span className="truncate">Classes & Effectifs</span>
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push("/courses")}
              className="gap-1 text-xs"
            >
              <Eye className="h-3 w-3" />
              <span className="hidden sm:inline">Voir tout</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ClassesStats courses={courses} />

        {/* Liste des classes avec scroll mobile-friendly */}
        <div className="space-y-2 max-h-80 sm:max-h-96 overflow-y-auto">
          {courses.map(course => (
            <ClassCard
              key={course.id}
              course={course}
              onClick={() => router.push(`/courses/${course.id}`)}
            />
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune classe trouvée</p>
            <Button size="sm" className="mt-2 gap-1" onClick={() => router.push("/courses")}>
              <Plus className="h-4 w-4" />
              Créer une classe
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
