"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

// Interfaces (à adapter selon vos types de données réels)
interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Grade {
  studentId: string;
  subjectId: string;
  week: number;
  score: string;
}

interface GradesMatrixProps {
  students: Student[];
  subjects: Subject[];
}

export function GradesMatrix({ students, subjects }: GradesMatrixProps) {
  const [weeks, setWeeks] = useState([1]); // Commence avec une semaine
  const [grades, setGrades] = useState<Grade[]>([]);

  const addWeek = () => {
    setWeeks(prev => [...prev, prev.length + 1]);
  };

  const handleGradeChange = (studentId: string, subjectId: string, week: number, score: string) => {
    setGrades(prev => {
      const existingGradeIndex = prev.findIndex(
        g => g.studentId === studentId && g.subjectId === subjectId && g.week === week
      );

      if (existingGradeIndex > -1) {
        const updatedGrades = [...prev];
        updatedGrades[existingGradeIndex] = { ...updatedGrades[existingGradeIndex], score };
        return updatedGrades;
      } else {
        return [...prev, { studentId, subjectId, week, score }];
      }
    });
  };

  const getGrade = (studentId: string, subjectId: string, week: number) => {
    return grades.find(g => g.studentId === studentId && g.subjectId === subjectId && g.week === week)?.score || '';
  };

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <Button onClick={addWeek}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter une semaine
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="sticky left-0 bg-gray-100 p-2 border w-48 text-left">Élève / Matière</th>
              {weeks.map(week => (
                <th key={week} className="p-2 border min-w-[100px]">
                  Semaine {week}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subjects.map(subject => (
              <React.Fragment key={subject.id}>
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={weeks.length + 1} className="sticky left-0 bg-gray-50 p-2 border">
                    {subject.name}
                  </td>
                </tr>
                {students.map(student => (
                  <tr key={`${subject.id}-${student.id}`}>
                    <td className="sticky left-0 bg-white p-2 border w-48">
                      {student.first_name} {student.last_name}
                    </td>
                    {weeks.map(week => (
                      <td key={week} className="p-1 border">
                        <input
                          type="text"
                          className="w-full h-full p-1 text-center border-none focus:ring-1 focus:ring-blue-500 rounded-sm"
                          value={getGrade(student.id, subject.id, week)}
                          onChange={e => handleGradeChange(student.id, subject.id, week, e.target.value)}
                          placeholder="--"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
