"use client";

import { useState, useEffect } from "react";
import { GradeSelector } from "./GradeSelector";
import { SubjectList } from "./SubjectList";
import { SubjectGradeEntryTable } from "./SubjectGradeEntryTable";
import { GradeTable } from "./GradeTable";
import { BulletinGenerator } from "./BulletinGenerator";
import { GradeHistory } from "./GradeHistory";
import { getGrades, getGradeHistory } from "../actions/actions.server";

interface GradesClientContentProps {
  schoolYears: { id: string; label: string; start_date: string; end_date: string }[];
  courses: { id: string; name: string }[];
  students: { id: string; first_name: string; last_name: string }[];
  subjects: { id: string; name: string; course_id: string }[];
}

interface Grade {
  id: string;
  score: number;
  coefficient: number;
  period_type: string;
  period_value: string;
  comments: string | null;
  evaluation_date: string;
  subjects: { id: string; name: string; course_id: string }[];
}

export function GradesClientContent({
  schoolYears,
  courses,
  students,
  subjects,
}: GradesClientContentProps) {
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState(""); // New state for selected subject
  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    const fetchGradesData = async () => {
      if (selectedStudentId && selectedCourseId && selectedSchoolYearId) {
        const fetchedGrades = await getGrades(
          selectedStudentId,
          selectedCourseId,
          selectedSchoolYearId,
          selectedSubjectId
        );
        setGrades(fetchedGrades);
      }
    };
    fetchGradesData();
  }, [selectedStudentId, selectedCourseId, selectedSchoolYearId]);

  const handleSelectionChange = (selection: {
    schoolYearId: string;
    courseId: string;
    studentId: string;
  }) => {
    setSelectedSchoolYearId(selection.schoolYearId);
    setSelectedCourseId(selection.courseId);
    setSelectedStudentId(selection.studentId);
    setSelectedSubjectId(""); // Reset subject selection when course changes
    console.log("GradesClientContent - Selected Course ID after change:", selection.courseId);
  };

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
  };

  const filteredSubjects =
    subjects?.filter(subject =>
      selectedCourseId ? subject.course_id === selectedCourseId : true
    ) || [];
  console.log("GradesClientContent - Filtered Subjects:", filteredSubjects);

  return (
    <div className="w-full md:max-w-7xl md:mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Gestion des Notes et Bulletins</h1>

      <GradeSelector
        schoolYears={schoolYears || []}
        courses={courses || []}
        students={students || []}
        onSelectionChange={handleSelectionChange}
      />

      {selectedCourseId && (
        <SubjectList
          subjects={filteredSubjects}
          onSelectSubject={handleSubjectSelect}
          selectedSubjectId={selectedSubjectId}
        />
      )}

      {selectedStudentId && selectedCourseId && selectedSchoolYearId && selectedSubjectId ? (
        <>
          <SubjectGradeEntryTable
            students={students || []}
            selectedSubjectId={selectedSubjectId}
            selectedSchoolYearId={selectedSchoolYearId}
          />
          <GradeTable grades={grades} />
          <BulletinGenerator
            selectedStudentId={selectedStudentId}
            selectedSchoolYearId={selectedSchoolYearId}
          />
          <GradeHistory selectedStudentId={selectedStudentId} />
        </>
      ) : selectedCourseId ? (
        <p className="text-center text-gray-500">
          Veuillez sélectionner une matière pour saisir les notes.
        </p>
      ) : (
        <p className="text-center text-gray-500">
          Veuillez sélectionner une année scolaire, un cours et un élève pour gérer les notes.
        </p>
      )}
    </div>
  );
}
