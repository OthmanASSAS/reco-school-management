"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Save, CheckCircle, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getGrades } from "../actions/get-grades.server";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

interface GradeEntry {
  studentId: string;
  score: string;
  comment: string;
}

interface CollapsibleSubjectProps {
  subject: {
    id: string;
    name: string;
    course_id: string;
  };
  students: Student[];
  periodType: string;
  periodValue: string;
  schoolYearId: string;
  onSave: (subjectId: string, grades: GradeEntry[]) => Promise<void>;
}

export function CollapsibleSubject({
  subject,
  students,
  periodType,
  periodValue,
  schoolYearId,
  onSave,
}: CollapsibleSubjectProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [grades, setGrades] = useState<GradeEntry[]>(
    students.map(student => ({
      studentId: student.id,
      score: "",
      comment: "",
    }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingGrades, setExistingGrades] = useState<any[]>([]);
  const { toast } = useToast();

  // Charger les notes existantes quand le composant s'ouvre
  useEffect(() => {
    if (isExpanded && schoolYearId) {
      loadExistingGrades();
    }
  }, [isExpanded, subject.id, periodType, periodValue, schoolYearId]);

  const loadExistingGrades = async () => {
    setIsLoading(true);
    try {
      const result = await getGrades(subject.id, periodType, periodValue, schoolYearId);
      if (result.success) {
        setExistingGrades(result.data);

        // Mettre à jour les grades avec les données existantes
        const updatedGrades = students.map(student => {
          const existingGrade = result.data.find((g: any) => g.student_id === student.id);
          return {
            studentId: student.id,
            score: existingGrade ? existingGrade.score.toString() : "",
            comment: existingGrade ? existingGrade.comments || "" : "",
          };
        });
        setGrades(updatedGrades);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des notes:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des notes existantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeChange = (studentId: string, field: "score" | "comment", value: string) => {
    setGrades(prev =>
      prev.map(grade => (grade.studentId === studentId ? { ...grade, [field]: value } : grade))
    );
    setIsSaved(false);
  };

  const getScoreColor = (score: string) => {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return "border-gray-300";
    if (numScore >= 15) return "border-green-500 bg-green-50";
    if (numScore >= 10) return "border-yellow-500 bg-yellow-50";
    return "border-red-500 bg-red-50";
  };

  const getScoreIcon = (score: string) => {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return null;
    if (numScore >= 15) return "🟢";
    if (numScore >= 10) return "🟡";
    return "🔴";
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(subject.id, grades);
      setIsSaved(true);
      toast({
        title: "Notes sauvegardées",
        description: `Les notes pour ${subject.name} ont été sauvegardées avec succès.`,
      });
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde des notes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const validGrades = grades.filter(g => g.score.trim() !== "");
  const averageScore =
    validGrades.length > 0
      ? validGrades.reduce((sum, g) => sum + parseFloat(g.score), 0) / validGrades.length
      : 0;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 h-8 w-8"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <div>
              <h3 className="font-semibold text-lg">{subject.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{students.length} élève(s)</span>
                {existingGrades.length > 0 && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {existingGrades.length} note(s) existante(s)
                    </Badge>
                  </>
                )}
                {validGrades.length > 0 && (
                  <>
                    <span>•</span>
                    <span>Moyenne: {averageScore.toFixed(1)}/20</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isSaved && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Sauvegardé
              </Badge>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving || validGrades.length === 0}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Période</label>
                <div className="text-sm text-gray-600">
                  {periodType} - {periodValue}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Matière</label>
                <div className="text-sm text-gray-600">{subject.name}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Élèves</label>
                <div className="text-sm text-gray-600">
                  {validGrades.length}/{students.length} notés
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Élève</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Note (0-20)</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Commentaire</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => {
                    const grade = grades.find(g => g.studentId === student.id);
                    const existingGrade = existingGrades.find(g => g.student_id === student.id);
                    return (
                      <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2">
                            <div className="font-medium">
                              {student.first_name} {student.last_name}
                            </div>
                            {existingGrade && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                <User className="h-3 w-3 mr-1" />
                                Note existante
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              step="0.5"
                              value={grade?.score || ""}
                              onChange={e => handleGradeChange(student.id, "score", e.target.value)}
                              className={`w-20 ${getScoreColor(grade?.score || "")}`}
                              placeholder="0-20"
                            />
                            {getScoreIcon(grade?.score || "")}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <Textarea
                            value={grade?.comment || ""}
                            onChange={e => handleGradeChange(student.id, "comment", e.target.value)}
                            placeholder="Commentaire optionnel..."
                            className="min-h-[60px] resize-none"
                            rows={2}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
