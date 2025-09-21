"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { StudentListItem, EnrollmentWithCourse } from "@/lib/students";
import { Course } from "@/types/families";
import { useSchoolYear } from "../../SchoolYearProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  BarChart3,
  BookOpen,
  Calendar,
  Eye,
  Filter,
  History,
  Search,
  User,
  Users,
} from "lucide-react";

interface StudentsListProps {
  initialStudents: StudentListItem[];
  availableCourses: Course[];
}

type ViewMode = "tous" | "classes" | "statistiques";

type StudentWithView = {
  base: StudentListItem;
  view: ViewAggregates;
};

type ViewAggregates = {
  activeEnrollments: EnrollmentWithCourse[];
  finishedEnrollments: EnrollmentWithCourse[];
  activeCoursesCount: number;
  hasHistory: boolean;
  hasMultipleCourses: boolean;
  primaryCourseLabel: string;
};

function computeAggregates(student: StudentListItem, schoolYearId: string | "all"): ViewAggregates {
  const filterByYear = (enrollment: EnrollmentWithCourse) => {
    if (schoolYearId === "all") return true;
    return enrollment.school_year_id === schoolYearId;
  };

  const activeEnrollments = student.enrollments.filter(
    enrollment => enrollment.status === "active" && filterByYear(enrollment)
  ) as EnrollmentWithCourse[];

  const finishedEnrollments = student.enrollments.filter(
    enrollment => enrollment.status === "finished" && filterByYear(enrollment)
  ) as EnrollmentWithCourse[];

  const primaryCourseLabel =
    activeEnrollments[0]?.courses?.label ||
    activeEnrollments[0]?.courses?.name ||
    student.primaryCourseLabel;

  return {
    activeEnrollments,
    finishedEnrollments,
    activeCoursesCount: activeEnrollments.length,
    hasHistory: finishedEnrollments.length > 0,
    hasMultipleCourses: activeEnrollments.length > 1,
    primaryCourseLabel,
  };
}

function formatDate(dateString: string | null) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function calculateAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function StudentsList({ initialStudents, availableCourses }: StudentsListProps) {
  const router = useRouter();
  const { schoolYears, currentSchoolYearId } = useSchoolYear();

  const [viewMode, setViewMode] = useState<ViewMode>("tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>("all");
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<string | "all">("all");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const manualSchoolYearOverride = useRef(false);

  useEffect(() => {
    if (currentSchoolYearId && !manualSchoolYearOverride.current) {
      setSelectedSchoolYearId(currentSchoolYearId);
    }
  }, [currentSchoolYearId]);

  const studentsWithView = useMemo<StudentWithView[]>(
    () =>
      initialStudents.map(student => ({
        base: student,
        view: computeAggregates(student, selectedSchoolYearId),
      })),
    [initialStudents, selectedSchoolYearId]
  );

  const familiesOptions = useMemo(() => {
    const unique = new Map<string, { id: string; label: string }>();
    initialStudents.forEach(student => {
      unique.set(student.family.id, {
        id: student.family.id,
        label: student.family.name,
      });
    });
    return Array.from(unique.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [initialStudents]);

  const totals = useMemo(() => {
    const dataset = studentsWithView;
    return {
      total: dataset.length,
      active: dataset.filter(item => item.view.activeCoursesCount > 0).length,
      withoutCourse: dataset.filter(item => item.view.activeCoursesCount === 0).length,
      multiple: dataset.filter(item => item.view.hasMultipleCourses).length,
      history: dataset.filter(item => item.view.hasHistory).length,
    };
  }, [studentsWithView]);

  const filteredStudents = useMemo(() => {
    return studentsWithView
      .filter(({ base, view }) => {
        const search = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !search ||
          `${base.first_name} ${base.last_name}`.toLowerCase().includes(search) ||
          base.family.name.toLowerCase().includes(search) ||
          view.primaryCourseLabel.toLowerCase().includes(search);

        const matchesFamily = selectedFamilyId === "all" || base.family.id === selectedFamilyId;

        const matchesCourse = (() => {
          if (selectedCourseId === "all") return true;
          if (selectedCourseId === "none") return view.activeCoursesCount === 0;
          return view.activeEnrollments.some(
            enrollment => enrollment.courses?.id === selectedCourseId
          );
        })();

        const matchesStatus =
          selectedStatus === "all" ||
          (selectedStatus === "active" && view.activeCoursesCount > 0) ||
          (selectedStatus === "no_course" && view.activeCoursesCount === 0) ||
          (selectedStatus === "multiple" && view.hasMultipleCourses) ||
          (selectedStatus === "history" && view.hasHistory);

        return matchesSearch && matchesFamily && matchesCourse && matchesStatus;
      })
      .sort((a, b) => a.base.last_name.localeCompare(b.base.last_name));
  }, [searchTerm, selectedFamilyId, selectedCourseId, selectedStatus, studentsWithView]);

  const groupedByClass = useMemo(() => {
    const groups = new Map<
      string,
      { courseId: string | null; label: string; students: StudentWithView[] }
    >();

    availableCourses.forEach(course => {
      groups.set(course.id, {
        courseId: course.id,
        label: course.label || course.name,
        students: [],
      });
    });

    groups.set("__unassigned__", {
      courseId: null,
      label: "Sans cours",
      students: [],
    });

    filteredStudents.forEach(entry => {
      const appendedTo = new Set<string>();

      if (entry.view.activeEnrollments.length === 0) {
        groups.get("__unassigned__")?.students.push(entry);
        return;
      }

      entry.view.activeEnrollments.forEach(enrollment => {
        const key = enrollment.courses?.id || "__unassigned__";
        if (appendedTo.has(key)) return;
        if (!groups.has(key)) {
          groups.set(key, {
            courseId: enrollment.courses?.id || null,
            label: enrollment.courses?.label || enrollment.courses?.name || "Sans cours",
            students: [],
          });
        }
        groups.get(key)?.students.push(entry);
        appendedTo.add(key);
      });
    });

    return Array.from(groups.values()).sort((a, b) => {
      if (a.courseId === null) return 1;
      if (b.courseId === null) return -1;
      return a.label.localeCompare(b.label);
    });
  }, [availableCourses, filteredStudents]);

  const selectedStudentBase = useMemo(
    () =>
      selectedStudentId
        ? initialStudents.find(student => student.id === selectedStudentId) || null
        : null,
    [selectedStudentId, initialStudents]
  );

  const selectedStudentView = useMemo(
    () =>
      selectedStudentId
        ? studentsWithView.find(student => student.base.id === selectedStudentId) || null
        : null,
    [selectedStudentId, studentsWithView]
  );

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCourseId("all");
    setSelectedStatus("all");
    setSelectedFamilyId("all");
    manualSchoolYearOverride.current = false;
    setSelectedSchoolYearId(currentSchoolYearId || "all");
  };

  const openDetails = (studentId: string) => {
    setSelectedStudentId(studentId);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="border border-emerald-100 shadow-sm">
        <CardHeader className="border-b border-emerald-100 bg-emerald-50/60">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-200 rounded-lg text-emerald-900">
                  <Users size={20} />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Élèves et classes
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {filteredStudents.length} élèves affichés sur {totals.total}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Input
                    placeholder="Rechercher par nom, famille ou cours"
                    value={searchTerm}
                    onChange={event => setSearchTerm(event.target.value)}
                    className="pl-10 h-11"
                  />
                  <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <Button variant="outline" onClick={resetFilters} className="h-11">
                  <Filter className="mr-2 h-4 w-4" />
                  Réinitialiser
                </Button>
              </div>
            </div>

            {viewMode === "tous" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Select
                  value={selectedSchoolYearId}
                  onValueChange={value => {
                    manualSchoolYearOverride.current = value !== (currentSchoolYearId || "all");
                    setSelectedSchoolYearId(value);
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Année scolaire" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les années</SelectItem>
                    {schoolYears.map(year => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedCourseId}
                  onValueChange={value => setSelectedCourseId(value)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Cours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les cours</SelectItem>
                    <SelectItem value="none">Sans cours</SelectItem>
                    {availableCourses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.label || course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={value => setSelectedStatus(value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="active">Cours actifs</SelectItem>
                    <SelectItem value="no_course">Sans cours</SelectItem>
                    <SelectItem value="multiple">Cours multiples</SelectItem>
                    <SelectItem value="history">Historique</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedFamilyId}
                  onValueChange={value => setSelectedFamilyId(value)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Famille" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les familles</SelectItem>
                    {familiesOptions.map(family => (
                      <SelectItem key={family.id} value={family.id}>
                        {family.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
              <Users className="h-5 w-5 text-emerald-700" />
              <div>
                <p className="text-xs uppercase text-emerald-600 tracking-wide">Total</p>
                <p className="text-xl font-semibold text-emerald-900">{totals.total}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
              <BookOpen className="h-5 w-5 text-blue-700" />
              <div>
                <p className="text-xs uppercase text-blue-600 tracking-wide">Cours actifs</p>
                <p className="text-xl font-semibold text-blue-900">{totals.active}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-orange-100 bg-orange-50 p-4">
              <BarChart3 className="h-5 w-5 text-orange-700" />
              <div>
                <p className="text-xs uppercase text-orange-600 tracking-wide">Sans cours</p>
                <p className="text-xl font-semibold text-orange-900">{totals.withoutCourse}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-purple-100 bg-purple-50 p-4">
              <Calendar className="h-5 w-5 text-purple-700" />
              <div>
                <p className="text-xs uppercase text-purple-600 tracking-wide">Cours multiples</p>
                <p className="text-xl font-semibold text-purple-900">{totals.multiple}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-rose-100 bg-rose-50 p-4">
              <History className="h-5 w-5 text-rose-700" />
              <div>
                <p className="text-xs uppercase text-rose-600 tracking-wide">Historique</p>
                <p className="text-xl font-semibold text-rose-900">{totals.history}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Tabs value={viewMode} onValueChange={value => setViewMode(value as ViewMode)}>
              <TabsList>
                <TabsTrigger value="tous">Tous les élèves</TabsTrigger>
                <TabsTrigger value="classes">Par classe</TabsTrigger>
                <TabsTrigger value="statistiques">Statistiques</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              onClick={() => router.push("/pre-registration")}
              variant="secondary"
              className="gap-2"
            >
              Nouvelle préinscription
            </Button>
          </div>

          <Tabs value={viewMode}>
            <TabsContent value="tous" className="space-y-3">
              <div className="overflow-hidden rounded-lg border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="px-4 py-3 text-left">Élève</th>
                      <th className="px-4 py-3 text-left">Famille</th>
                      <th className="px-4 py-3 text-left">Cours</th>
                      <th className="px-4 py-3 text-left">Statut</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredStudents.map(({ base, view }) => {
                      const age = calculateAge(base.birth_date);
                      return (
                        <tr key={base.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900">
                                {base.first_name} {base.last_name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {base.registration_type === "adult"
                                  ? "Adulte"
                                  : age
                                    ? `${age} ans`
                                    : "Enfant"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{base.family.name}</td>
                          <td className="px-4 py-3 text-gray-700">
                            {view.activeEnrollments.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {view.activeEnrollments.map(enrollment => {
                                  const isFocused =
                                    selectedCourseId !== "all" &&
                                    selectedCourseId !== "none" &&
                                    enrollment.courses?.id === selectedCourseId;
                                  return (
                                    <Badge
                                      key={enrollment.id}
                                      variant={isFocused ? "default" : "secondary"}
                                      className={
                                        isFocused
                                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent"
                                          : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                      }
                                    >
                                      {enrollment.courses?.label || enrollment.courses?.name}
                                    </Badge>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-gray-400">Sans cours</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {view.activeCoursesCount > 0 ? (
                                <Badge
                                  variant="outline"
                                  className="border-emerald-300 text-emerald-700"
                                >
                                  Actif
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-gray-300 text-gray-600">
                                  Sans cours
                                </Badge>
                              )}
                              {view.hasHistory && (
                                <Badge
                                  variant="outline"
                                  className="border-purple-300 text-purple-600"
                                >
                                  Historique
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700"
                              onClick={() => openDetails(base.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredStudents.length === 0 && (
                <div className="text-center py-10 text-gray-500 border border-dashed border-gray-200 rounded-lg">
                  Aucun élève ne correspond aux filtres sélectionnés.
                </div>
              )}
            </TabsContent>

            <TabsContent value="classes" className="space-y-4">
              {groupedByClass.map(group => (
                <Card key={group.courseId ?? "__unassigned__"} className="border border-gray-100">
                  <CardHeader className="flex flex-row items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {group.label}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        {group.students.length} élève{group.students.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {group.students.length === 0 && (
                      <p className="text-sm text-gray-400">Aucun élève assigné.</p>
                    )}
                    {group.students.map(({ base, view }) => (
                      <div
                        key={`${group.courseId ?? "__unassigned__"}-${base.id}`}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between border border-gray-100 rounded-lg px-4 py-3 bg-white"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {base.first_name} {base.last_name}
                          </p>
                          <p className="text-xs text-gray-500">Famille {base.family.name}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          {view.hasHistory && (
                            <Badge variant="outline" className="border-purple-200 text-purple-600">
                              Historique
                            </Badge>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => openDetails(base.id)}>
                            Détails
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="statistiques" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Répartition par type d'élève */}
                <Card className="border border-blue-100">
                  <CardHeader className="bg-blue-50/60 border-b border-blue-100">
                    <CardTitle className="text-lg text-blue-900">Répartition par type</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {(() => {
                      const adults = filteredStudents.filter(
                        s => s.base.registration_type === "adult"
                      ).length;
                      const children = filteredStudents.filter(
                        s => s.base.registration_type === "child"
                      ).length;
                      return (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Adultes</span>
                            <span className="font-semibold text-blue-700">{adults}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Enfants</span>
                            <span className="font-semibold text-blue-700">{children}</span>
                          </div>
                          <div className="border-t pt-3">
                            <div className="flex justify-between items-center font-semibold">
                              <span className="text-gray-900">Total</span>
                              <span className="text-blue-700">{adults + children}</span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Répartition par cours */}
                <Card className="border border-green-100">
                  <CardHeader className="bg-green-50/60 border-b border-green-100">
                    <CardTitle className="text-lg text-green-900">Top 5 cours</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {(() => {
                      const courseStats = groupedByClass
                        .filter(group => group.courseId !== null)
                        .sort((a, b) => b.students.length - a.students.length)
                        .slice(0, 5);

                      return courseStats.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">Aucun cours avec des élèves</p>
                      ) : (
                        courseStats.map((group, index) => (
                          <div key={group.courseId} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 truncate" title={group.label}>
                              {index + 1}. {group.label}
                            </span>
                            <span className="font-semibold text-green-700">
                              {group.students.length}
                            </span>
                          </div>
                        ))
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Répartition par âge (enfants seulement) */}
                <Card className="border border-purple-100">
                  <CardHeader className="bg-purple-50/60 border-b border-purple-100">
                    <CardTitle className="text-lg text-purple-900">
                      Tranches d&apos;âge (enfants)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {(() => {
                      const children = filteredStudents.filter(
                        s => s.base.registration_type === "child"
                      );
                      const ageRanges = {
                        "3-5 ans": children.filter(s => {
                          const age = calculateAge(s.base.birth_date);
                          return age && age >= 3 && age <= 5;
                        }).length,
                        "6-8 ans": children.filter(s => {
                          const age = calculateAge(s.base.birth_date);
                          return age && age >= 6 && age <= 8;
                        }).length,
                        "9-12 ans": children.filter(s => {
                          const age = calculateAge(s.base.birth_date);
                          return age && age >= 9 && age <= 12;
                        }).length,
                        "13+ ans": children.filter(s => {
                          const age = calculateAge(s.base.birth_date);
                          return age && age >= 13;
                        }).length,
                      };

                      return Object.entries(ageRanges).map(([range, count]) => (
                        <div key={range} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{range}</span>
                          <span className="font-semibold text-purple-700">{count}</span>
                        </div>
                      ));
                    })()}
                  </CardContent>
                </Card>
              </div>

              {/* Graphique de répartition par famille */}
              <Card className="border border-orange-100">
                <CardHeader className="bg-orange-50/60 border-b border-orange-100">
                  <CardTitle className="text-lg text-orange-900">
                    Familles avec plusieurs élèves
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {(() => {
                    const familyStats = new Map<string, { name: string; count: number }>();
                    filteredStudents.forEach(({ base }) => {
                      const existing = familyStats.get(base.family.id);
                      familyStats.set(base.family.id, {
                        name: base.family.name,
                        count: (existing?.count || 0) + 1,
                      });
                    });

                    const multipleFamilies = Array.from(familyStats.values())
                      .filter(family => family.count > 1)
                      .sort((a, b) => b.count - a.count);

                    return multipleFamilies.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        Aucune famille avec plusieurs élèves
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {multipleFamilies.slice(0, 10).map(family => (
                          <div
                            key={family.name}
                            className="flex justify-between items-center py-2 border-b border-orange-100 last:border-0"
                          >
                            <span className="text-sm text-gray-700">{family.name}</span>
                            <Badge variant="outline" className="border-orange-300 text-orange-700">
                              {family.count} élèves
                            </Badge>
                          </div>
                        ))}
                        {multipleFamilies.length > 10 && (
                          <p className="text-xs text-gray-500 mt-3">
                            ... et {multipleFamilies.length - 10} autres familles
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={open => setDetailOpen(open)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              Dossier élève
            </DialogTitle>
          </DialogHeader>

          {selectedStudentBase && selectedStudentView && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-100 p-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Élève
                  </h3>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {selectedStudentBase.first_name} {selectedStudentBase.last_name}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Date de naissance : {formatDate(selectedStudentBase.birth_date)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedStudentBase.registration_type === "adult"
                      ? "Adulte"
                      : (() => {
                          const age = calculateAge(selectedStudentBase.birth_date);
                          return age ? `${age} ans` : "Enfant";
                        })()}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-100 p-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Famille
                  </h3>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {selectedStudentBase.family.name}
                  </p>
                  <div className="text-sm text-gray-500 mt-2">
                    <p>{selectedStudentBase.family.email}</p>
                    {selectedStudentBase.family.phone && <p>{selectedStudentBase.family.phone}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 px-2"
                    onClick={() => router.push(`/families/${selectedStudentBase.family.id}`)}
                  >
                    Voir la famille
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-gray-100">
                <div className="border-b border-gray-100 px-4 py-3">
                  <h3 className="font-semibold text-gray-800">Cours actifs</h3>
                </div>
                <div className="p-4 space-y-3">
                  {selectedStudentView.view.activeEnrollments.length === 0 && (
                    <p className="text-sm text-gray-500">
                      Aucun cours actif pour la période sélectionnée.
                    </p>
                  )}
                  {selectedStudentView.view.activeEnrollments.map(enrollment => {
                    const isFocused =
                      selectedCourseId !== "all" &&
                      selectedCourseId !== "none" &&
                      enrollment.courses?.id === selectedCourseId;

                    return (
                      <div
                        key={enrollment.id}
                        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg px-4 py-3 transition-colors ${
                          isFocused
                            ? "border border-emerald-400 bg-emerald-100"
                            : "border border-emerald-100 bg-emerald-50"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-emerald-900">
                            {enrollment.courses?.label || enrollment.courses?.name}
                          </p>
                          <p className="text-xs text-emerald-700">
                            Depuis le {formatDate(enrollment.start_date || null)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-gray-100">
                <div className="border-b border-gray-100 px-4 py-3">
                  <h3 className="font-semibold text-gray-800">Historique</h3>
                </div>
                <div className="p-4 space-y-3">
                  {selectedStudentView.view.finishedEnrollments.length === 0 && (
                    <p className="text-sm text-gray-500">
                      Aucun historique pour la période sélectionnée.
                    </p>
                  )}
                  {selectedStudentView.view.finishedEnrollments.map(enrollment => (
                    <div
                      key={enrollment.id}
                      className="rounded-lg border border-gray-100 px-4 py-3 bg-white"
                    >
                      <p className="font-medium text-gray-900">
                        {enrollment.courses?.label || enrollment.courses?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(enrollment.start_date || null)} –{" "}
                        {formatDate(enrollment.end_date || null)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
