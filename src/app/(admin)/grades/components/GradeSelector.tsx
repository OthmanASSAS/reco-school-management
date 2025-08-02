import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GradeSelectorProps {
  schoolYears: { id: string; label: string; start_date: string; end_date: string }[];
  courses: { id: string; name: string }[];
  students: { id: string; first_name: string; last_name: string }[];
  onSelectionChange: (selection: {
    schoolYearId: string;
    courseId: string;
    studentId: string;
  }) => void;
}

export function GradeSelector({
  schoolYears,
  courses,
  students,
  onSelectionChange,
}: GradeSelectorProps) {
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const handleSchoolYearChange = (value: string) => {
    setSelectedSchoolYearId(value);
    onSelectionChange({
      schoolYearId: value,
      courseId: selectedCourseId,
      studentId: selectedStudentId,
    });
  };

  const handleCourseChange = (value: string) => {
    setSelectedCourseId(value);
    onSelectionChange({
      schoolYearId: selectedSchoolYearId,
      courseId: value,
      studentId: selectedStudentId,
    });
  };

  const handleStudentChange = (value: string) => {
    setSelectedStudentId(value);
    onSelectionChange({
      schoolYearId: selectedSchoolYearId,
      courseId: selectedCourseId,
      studentId: value,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="schoolYear">Année Scolaire</Label>
        <Select value={selectedSchoolYearId} onValueChange={handleSchoolYearChange}>
          <SelectTrigger id="schoolYear">
            <SelectValue placeholder="Sélectionner une année" />
          </SelectTrigger>
          <SelectContent>
            {schoolYears.map(year => (
              <SelectItem key={year.id} value={year.id}>
                {year.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="course">Cours</Label>
        <Select value={selectedCourseId} onValueChange={handleCourseChange}>
          <SelectTrigger id="course">
            <SelectValue placeholder="Sélectionner un cours" />
          </SelectTrigger>
          <SelectContent>
            {courses.map(course => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="student">Élève</Label>
        <Select value={selectedStudentId} onValueChange={handleStudentChange}>
          <SelectTrigger id="student">
            <SelectValue placeholder="Sélectionner un élève" />
          </SelectTrigger>
          <SelectContent>
            {students.map(student => (
              <SelectItem key={student.id} value={student.id}>
                {student.first_name} {student.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
