import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { saveGrade } from "../actions/actions.server";

interface SubjectGradeEntryTableProps {
  students: { id: string; first_name: string; last_name: string }[];
  selectedSubjectId: string;
  selectedSchoolYearId: string;
  // grades: any[]; // Existing grades for pre-filling
}

export function SubjectGradeEntryTable({
  students,
  selectedSubjectId,
  selectedSchoolYearId,
}: SubjectGradeEntryTableProps) {
  const periods = ["Semaine", "Mois", "Trimestre", "Semestre", "Annuel"];

  const handleSubmit = async (formData: FormData) => {
    formData.append("subjectId", selectedSubjectId);
    formData.append("schoolYearId", selectedSchoolYearId);
    // studentId will be appended for each grade entry
    await saveGrade(formData);
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">Saisie des Notes par Élève</h2>

      {/* Period Selection and Coefficient */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="periodType">Type de Période</Label>
          <Select name="periodType" required>
            <SelectTrigger id="periodType">
              <SelectValue placeholder="Sélectionner un type de période" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period} value={period}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="periodValue">Valeur de la Période</Label>
          <Input id="periodValue" name="periodValue" placeholder="Ex: Semaine 1, Janvier, Trimestre 1" required />
        </div>
        <div>
          <Label htmlFor="coefficient">Coefficient</Label>
          <Input id="coefficient" name="coefficient" type="number" min="1" defaultValue="1" required />
        </div>
      </div>

      {/* Grades Input Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Élève</TableHead>
            <TableHead>Note (0-20)</TableHead>
            <TableHead>Commentaires</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length > 0 ? (
            students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.first_name} {student.last_name}</TableCell>
                <TableCell>
                  <Input
                    name={`grade-${student.id}`}
                    type="number"
                    min="0"
                    max="20"
                    placeholder="Note"
                  />
                </TableCell>
                <TableCell>
                  <Textarea
                    name={`comment-${student.id}`}
                    placeholder="Commentaires (optionnel)"
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-gray-500">
                Aucun élève trouvé pour ce cours.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Button type="submit">Sauvegarder les Notes</Button>
    </form>
  );
}