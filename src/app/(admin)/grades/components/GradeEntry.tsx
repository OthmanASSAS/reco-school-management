"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  TrendingUp,
  Save,
  Plus,
  Edit3,
  Check,
  X,
  Loader2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getGradesForSubject } from "../actions/get-grades.server";
import { saveGradesFromOverview } from "../actions/save-grades.server";

interface GradeEntryProps {
  courses: any[];
  subjects: any[];
  students: any[];
  schoolYears: any[];
  enrollments?: any[];
  onSaveGrades?: (
    subjectId: string,
    grades: any[],
    periodType: string,
    periodValue: string,
    schoolYearId: string
  ) => Promise<any>;
}

interface GradeInput {
  studentId: string;
  subjectId: string;
  periodType: string;
  periodValue: string;
  score: number;
  coefficient: number;
  comments?: string;
}

export function GradeEntry({
  courses,
  subjects,
  students,
  schoolYears,
  enrollments = [],
}: GradeEntryProps) {
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<string>(
    schoolYears.length > 0 ? schoolYears[0].id : ""
  );
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses.length > 0 ? courses[0].id : ""
  );
  const [weeks, setWeeks] = useState<number[]>([1]); // Commence avec une semaine
  const [allGrades, setAllGrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingGrades, setEditingGrades] = useState<GradeInput[]>([]);
  const [collapsedSubjects, setCollapsedSubjects] = useState<Set<string>>(() => {
    // Par défaut, toutes les matières sont repliées sauf la première
    const initialCollapsed = new Set<string>();
    if (subjects.length > 0) {
      // Replier toutes les matières sauf la première
      subjects.forEach((subject, index) => {
        if (index > 0) {
          initialCollapsed.add(subject.id);
        }
      });
    }
    return initialCollapsed;
  });
  const { toast } = useToast();

  const courseSubjects = subjects.filter(subject => subject.course_id === selectedCourseId);

  // Filtrer les étudiants inscrits au cours sélectionné pour l'année scolaire sélectionnée
  const courseStudents = useMemo(() => {
    if (!selectedCourseId || !selectedSchoolYearId) return students;

    console.log("🔍 DEBUG - Filtrage des étudiants:");
    console.log(`   Cours sélectionné: ${selectedCourseId}`);
    console.log(`   Année sélectionnée: ${selectedSchoolYearId}`);
    console.log(`   Total inscriptions disponibles: ${enrollments.length}`);
    console.log(`   Total étudiants disponibles: ${students.length}`);

    // Trouver les inscriptions pour le cours et l'année scolaire sélectionnés
    const relevantEnrollments = enrollments.filter(
      e => e.course_id === selectedCourseId && e.school_year_id === selectedSchoolYearId
    );

    console.log(`   Inscriptions trouvées pour ce cours/année: ${relevantEnrollments.length}`);

    if (relevantEnrollments.length === 0) {
      console.log("❌ Aucune inscription trouvée pour ce cours et cette année scolaire");
      console.log("   Inscriptions disponibles:");
      enrollments.forEach(e => {
        console.log(
          `     - Cours: ${e.course_id}, Année: ${e.school_year_id}, Étudiant: ${e.student_id}`
        );
      });
      return [];
    }

    const studentIds = relevantEnrollments.map(e => e.student_id);
    const filteredStudents = students.filter(s => studentIds.includes(s.id));

    console.log(`   Étudiants filtrés: ${filteredStudents.length}`);
    filteredStudents.forEach(s => {
      console.log(`     - ${s.first_name} ${s.last_name} (${s.id})`);
    });

    return filteredStudents;
  }, [selectedCourseId, selectedSchoolYearId, enrollments, students]);

  useEffect(() => {
    if (selectedSchoolYearId && selectedCourseId) {
      loadAllGrades();
    }
  }, [selectedSchoolYearId, selectedCourseId]);

  const loadAllGrades = async () => {
    setIsLoading(true);
    try {
      console.log("🔄 Rechargement des notes...");
      const allGradesData: any[] = [];

      for (const subject of courseSubjects) {
        console.log(`   📚 Chargement des notes pour la matière: ${subject.name} (${subject.id})`);
        const result = await getGradesForSubject(subject.id, selectedSchoolYearId);
        if (result.success) {
          console.log(`   ✅ ${result.data.length} note(s) trouvée(s) pour ${subject.name}`);
          allGradesData.push(...result.data);
        } else {
          console.log(`   ❌ Erreur pour ${subject.name}:`, result);
        }
      }

      console.log(`📊 Total notes chargées: ${allGradesData.length}`);
      console.log("📋 Détail des notes chargées:", allGradesData);
      setAllGrades(allGradesData);
    } catch (error) {
      console.error("Erreur lors du chargement des notes:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des notes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStudentGradeForPeriod = (
    studentId: string,
    subjectId: string,
    periodType: string,
    periodValue: string
  ) => {
    return allGrades.find(
      grade =>
        grade.student_id === studentId &&
        grade.subject_id === subjectId &&
        grade.period_type === periodType &&
        grade.period_value === periodValue
    );
  };

  const getAvailablePeriods = (subjectId: string) => {
    const subjectGrades = allGrades.filter(grade => grade.subject_id === subjectId);
    const periods = new Set<string>();

    subjectGrades.forEach(grade => {
      periods.add(`${grade.period_type} ${grade.period_value}`);
    });

    return Array.from(periods).sort();
  };

  const getStudentSubjectAverage = (studentId: string, subjectId: string) => {
    const studentGrades = allGrades.filter(
      grade => grade.student_id === studentId && grade.subject_id === subjectId
    );
    if (studentGrades.length === 0) return null;

    const total = studentGrades.reduce((sum, grade) => sum + grade.score, 0);
    return (total / studentGrades.length).toFixed(1);
  };

  const getSubjectAverage = (subjectId: string) => {
    const subjectGrades = allGrades.filter(grade => grade.subject_id === subjectId);
    if (subjectGrades.length === 0) return "N/A";

    const total = subjectGrades.reduce((sum, grade) => sum + grade.score, 0);
    return (total / subjectGrades.length).toFixed(1);
  };

  const getScoreColor = (score: number) => {
    if (score >= 15) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 10) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const addWeek = () => {
    setWeeks(prev => [...prev, Math.max(...prev) + 1]);
  };

  const handleGradeChange = (studentId: string, subjectId: string, week: number, score: string) => {
    const numericScore = parseInt(score) || 0;

    console.log(
      `📝 Modification note: Étudiant ${studentId}, Matière ${subjectId}, Semaine ${week}, Score: ${numericScore}`
    );

    setEditingGrades(prev => {
      const existingIndex = prev.findIndex(
        g =>
          g.studentId === studentId &&
          g.subjectId === subjectId &&
          g.periodValue === `Semaine ${week}`
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], score: numericScore };
        console.log(`   ✅ Note mise à jour (index: ${existingIndex})`);
        return updated;
      } else {
        const newGrade = {
          studentId,
          subjectId,
          periodType: "Semaine",
          periodValue: `Semaine ${week}`,
          score: numericScore,
          coefficient: 1,
        };
        console.log(`   ➕ Nouvelle note ajoutée:`, newGrade);
        return [...prev, newGrade];
      }
    });
  };

  const getGrade = (studentId: string, subjectId: string, week: number) => {
    // D'abord chercher dans editingGrades (notes en cours de modification)
    const editingGrade = editingGrades.find(
      g =>
        g.studentId === studentId &&
        g.subjectId === subjectId &&
        g.periodValue === `Semaine ${week}`
    );

    if (editingGrade) {
      return editingGrade.score || "";
    }

    // Sinon chercher dans allGrades (notes sauvegardées)
    const savedGrade = allGrades.find(
      g =>
        g.student_id === studentId &&
        g.subject_id === subjectId &&
        g.period_value === `Semaine ${week}`
    );

    return savedGrade?.score || "";
  };

  // Fonction pour naviguer vers le prochain input (Entrée)
  const navigateToNextInput = (
    currentStudentIndex: number,
    currentSubjectIndex: number,
    currentWeek: number
  ) => {
    // Essayer de passer à l'étudiant suivant dans la même matière et semaine
    const nextInput = document.querySelector(
      `input[data-student-index="${currentStudentIndex + 1}"][data-subject-index="${currentSubjectIndex}"][data-week="${currentWeek}"]`
    ) as HTMLInputElement;

    if (nextInput) {
      nextInput.focus();
      nextInput.select();
    } else {
      // Si pas d'étudiant suivant, passer à la semaine suivante
      const nextWeekInput = document.querySelector(
        `input[data-student-index="0"][data-subject-index="${currentSubjectIndex}"][data-week="${currentWeek + 1}"]`
      ) as HTMLInputElement;

      if (nextWeekInput) {
        nextWeekInput.focus();
        nextWeekInput.select();
      } else {
        // Si pas de semaine suivante, passer à la matière suivante
        const nextSubjectInput = document.querySelector(
          `input[data-student-index="0"][data-subject-index="${currentSubjectIndex + 1}"][data-week="1"]`
        ) as HTMLInputElement;

        if (nextSubjectInput) {
          nextSubjectInput.focus();
          nextSubjectInput.select();
        }
      }
    }
  };

  // Fonction pour naviguer avec les flèches
  const navigateWithArrow = (
    currentStudentIndex: number,
    currentSubjectIndex: number,
    currentWeek: number,
    direction: "up" | "down" | "left" | "right"
  ) => {
    let targetStudentIndex = currentStudentIndex;
    let targetSubjectIndex = currentSubjectIndex;
    let targetWeek = currentWeek;

    switch (direction) {
      case "up":
        if (currentStudentIndex > 0) {
          targetStudentIndex = currentStudentIndex - 1;
        } else {
          // Si on est au premier étudiant, passer au dernier étudiant de la matière précédente
          if (currentSubjectIndex > 0) {
            targetSubjectIndex = currentSubjectIndex - 1;
            targetStudentIndex = courseStudents.length - 1;
          }
        }
        break;
      case "down":
        if (currentStudentIndex < courseStudents.length - 1) {
          targetStudentIndex = currentStudentIndex + 1;
        } else {
          // Si on est au dernier étudiant, passer au premier étudiant de la matière suivante
          if (currentSubjectIndex < courseSubjects.length - 1) {
            targetSubjectIndex = currentSubjectIndex + 1;
            targetStudentIndex = 0;
          }
        }
        break;
      case "left":
        if (currentWeek > 1) {
          targetWeek = currentWeek - 1;
        } else {
          // Passer à la semaine précédente de la matière précédente
          if (currentSubjectIndex > 0) {
            targetSubjectIndex = currentSubjectIndex - 1;
            targetWeek = weeks[weeks.length - 1];
          }
        }
        break;
      case "right":
        if (currentWeek < weeks[weeks.length - 1]) {
          targetWeek = currentWeek + 1;
        } else {
          // Passer à la première semaine de la matière suivante
          if (currentSubjectIndex < courseSubjects.length - 1) {
            targetSubjectIndex = currentSubjectIndex + 1;
            targetWeek = 1;
          }
        }
        break;
    }

    const targetInput = document.querySelector(
      `input[data-student-index="${targetStudentIndex}"][data-subject-index="${targetSubjectIndex}"][data-week="${targetWeek}"]`
    ) as HTMLInputElement;

    if (targetInput) {
      targetInput.focus();
      targetInput.select();
    }
  };

  const handleSaveGrades = async () => {
    setIsSaving(true);
    try {
      console.log("🔍 DEBUG - Sauvegarde des notes:");
      console.log(`   Notes en cours d'édition: ${editingGrades.length}`);
      console.log("   Détail des notes:", editingGrades);

      const gradesToSave = editingGrades.filter(grade => grade.score > 0);
      console.log(`   Notes à sauvegarder (score > 0): ${gradesToSave.length}`);
      console.log("   Notes à sauvegarder:", gradesToSave);

      if (gradesToSave.length === 0) {
        toast({
          title: "Aucune note à sauvegarder",
          description: "Veuillez saisir au moins une note valide (score > 0).",
          variant: "destructive",
        });
        return;
      }

      const result = await saveGradesFromOverview(gradesToSave, selectedSchoolYearId);
      console.log("   Résultat de la sauvegarde:", result);

      if (result.success) {
        toast({
          title: "Notes sauvegardées",
          description: `${gradesToSave.length} note(s) ont été sauvegardées avec succès.`,
        });
        setEditingGrades([]);
        loadAllGrades(); // Recharger les notes
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Erreur lors de la sauvegarde des notes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde des notes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header avec sélecteurs */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Vue d'ensemble des notes
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Saisissez et visualisez les notes par matière et par période
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-blue-200">
                {courseStudents.length} étudiant(s)
              </Badge>
              <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-indigo-200">
                {courseSubjects.length} matière(s)
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Année scolaire</Label>
              <Select value={selectedSchoolYearId} onValueChange={setSelectedSchoolYearId}>
                <SelectTrigger className="bg-white border-gray-200 hover:border-gray-300 transition-colors">
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

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Cours</Label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger className="bg-white border-gray-200 hover:border-gray-300 transition-colors">
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

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Périodes</Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  {weeks.length} semaine(s)
                </Badge>
                <Button
                  onClick={addWeek}
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-md"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleSaveGrades}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des notes */}
      {selectedSchoolYearId && selectedCourseId && courseSubjects.length > 0 && (
        <div className="space-y-6">
          {courseSubjects.map((subject, subjectIndex) => {
            const isCollapsed = collapsedSubjects.has(subject.id);

            return (
              <Card key={subject.id} className="border-0 shadow-xl overflow-hidden bg-white">
                <CardHeader
                  className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 cursor-pointer hover:bg-gradient-to-r hover:from-slate-100 hover:to-gray-100 transition-all duration-200"
                  onClick={() => {
                    setCollapsedSubjects(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(subject.id)) {
                        newSet.delete(subject.id);
                      } else {
                        newSet.add(subject.id);
                      }
                      return newSet;
                    });
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {isCollapsed ? (
                            <ChevronRight className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                          )}
                          <div>
                            <CardTitle className="text-xl font-bold text-gray-900">
                              {subject.name}
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                              {courseStudents.length} étudiant(s) • {weeks.length} période(s)
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="bg-white/80 backdrop-blur-sm border-gray-200"
                      >
                        Moyenne: {getSubjectAverage(subject.id)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                {!isCollapsed && (
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-3 text-gray-600">Chargement des notes...</p>
                      </div>
                    ) : courseStudents.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          Aucun étudiant inscrit à ce cours
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <tr>
                              <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Étudiant
                              </th>
                              {weeks.map(week => (
                                <th
                                  key={week}
                                  className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                >
                                  <div className="flex flex-col items-center gap-1">
                                    <span>Semaine {week}</span>
                                    <div className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
                                  </div>
                                </th>
                              ))}
                              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <div className="flex flex-col items-center gap-1">
                                  <span>Moyenne</span>
                                  <div className="w-8 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-100">
                            {courseStudents.map((student, studentIndex) => (
                              <tr
                                key={student.id}
                                className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200"
                              >
                                <td className="px-8 py-6 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                        <span className="text-sm font-bold text-white">
                                          {student.first_name?.[0]}
                                          {student.last_name?.[0]}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-semibold text-gray-900">
                                        {student.first_name} {student.last_name}
                                      </div>
                                      <div className="text-sm text-gray-500">{student.email}</div>
                                    </div>
                                  </div>
                                </td>
                                {weeks.map(week => (
                                  <td key={week} className="px-6 py-6 whitespace-nowrap">
                                    <div className="flex justify-center">
                                      <Input
                                        type="number"
                                        min="0"
                                        max="20"
                                        value={getGrade(student.id, subject.id, week)}
                                        onChange={e =>
                                          handleGradeChange(
                                            student.id,
                                            subject.id,
                                            week,
                                            e.target.value
                                          )
                                        }
                                        className="w-20 text-center text-sm font-semibold border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                                        data-student-index={studentIndex}
                                        data-subject-index={subjectIndex}
                                        data-week={week}
                                        onKeyDown={e => {
                                          if (e.key === "Enter") {
                                            e.preventDefault();
                                            navigateToNextInput(studentIndex, subjectIndex, week);
                                          } else if (e.key.startsWith("Arrow")) {
                                            e.preventDefault();
                                            navigateWithArrow(
                                              studentIndex,
                                              subjectIndex,
                                              week,
                                              e.key as any
                                            );
                                          }
                                        }}
                                      />
                                    </div>
                                  </td>
                                ))}
                                <td className="px-6 py-6 whitespace-nowrap text-center">
                                  <Badge
                                    variant="outline"
                                    className={`text-sm font-semibold px-3 py-1 ${
                                      getStudentSubjectAverage(student.id, subject.id)
                                        ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200"
                                        : "bg-gray-50 text-gray-500 border-gray-200"
                                    }`}
                                  >
                                    {getStudentSubjectAverage(student.id, subject.id) || "N/A"}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Statistiques */}
      {allGrades.length > 0 && (
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span>Statistiques</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
                <div className="text-3xl font-bold text-blue-600">{allGrades.length}</div>
                <div className="text-sm text-blue-700 font-medium">Notes saisies</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm">
                <div className="text-3xl font-bold text-green-600">
                  {allGrades.filter(g => g.score >= 15).length}
                </div>
                <div className="text-sm text-green-700 font-medium">Notes ≥ 15/20</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 shadow-sm">
                <div className="text-3xl font-bold text-yellow-600">
                  {allGrades.filter(g => g.score >= 10 && g.score < 15).length}
                </div>
                <div className="text-sm text-yellow-700 font-medium">Notes 10-14/20</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 shadow-sm">
                <div className="text-3xl font-bold text-red-600">
                  {allGrades.filter(g => g.score < 10).length}
                </div>
                <div className="text-sm text-red-700 font-medium">Notes &lt; 10/20</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
