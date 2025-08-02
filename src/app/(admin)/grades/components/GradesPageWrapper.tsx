"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GradeEntry } from "./GradeEntry";
import { GradesOverview } from "./GradesOverview";

// Interfaces (assurez-vous qu'elles correspondent à vos types de données)
interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

interface Subject {
  id: string;
  name: string;
  course_id: string;
}

interface Course {
  id: string;
  name: string;
}

interface SchoolYear {
  id: string;
  label: string;
  start_date: string;
  end_date: string;
}

interface Enrollment {
  student_id: string;
  course_id: string;
  school_year_id: string;
}

interface GradesPageWrapperProps {
  courses: Course[];
  subjects: Subject[];
  students: Student[];
  schoolYears: SchoolYear[];
  enrollments: Enrollment[];
  onSaveGrades: (
    subjectId: string,
    grades: any[],
    periodType: string,
    periodValue: string,
    schoolYearId: string
  ) => Promise<any>;
}

export function GradesPageWrapper({
  courses,
  subjects,
  students,
  schoolYears,
  enrollments,
  onSaveGrades,
}: GradesPageWrapperProps) {
  const [activeView, setActiveView] = useState<"overview" | "entry">("overview");

  // Filtre les étudiants en fonction du cours et de l'année scolaire sélectionnés
  const getFilteredStudents = (selectedCourseId: string, selectedSchoolYearId: string) => {
    if (!selectedCourseId || !selectedSchoolYearId) return students;
    const studentIds = enrollments
      .filter(e => e.course_id === selectedCourseId && e.school_year_id === selectedSchoolYearId)
      .map(e => e.student_id);
    return students.filter(s => studentIds.includes(s.id));
  };

  return (
    <div>
      <Tabs
        value={activeView}
        onValueChange={value => setActiveView(value as "overview" | "entry")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="entry">Saisie des notes</TabsTrigger>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="space-y-6">
          <GradeEntry
            courses={courses}
            subjects={subjects}
            students={students}
            schoolYears={schoolYears}
            enrollments={enrollments}
            onSaveGrades={onSaveGrades}
          />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <GradesOverview
            courses={courses}
            subjects={subjects}
            students={students}
            schoolYears={schoolYears}
            enrollments={enrollments}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
