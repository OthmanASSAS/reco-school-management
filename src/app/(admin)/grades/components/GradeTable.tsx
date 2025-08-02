import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface GradeTableProps {
  grades: any[]; // Define a proper type for grades later
}

export function GradeTable({ grades }: GradeTableProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Notes Existantes</h2>
      {grades.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matière</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Coefficient</TableHead>
              <TableHead>Commentaires</TableHead>
              <TableHead>Date d'évaluation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grades.map((grade) => (
              <TableRow key={grade.id}>
                <TableCell>{grade.subjects?.name || 'N/A'}</TableCell>
                <TableCell>{grade.period_type} - {grade.period_value}</TableCell>
                <TableCell>{grade.score}</TableCell>
                <TableCell>{grade.coefficient}</TableCell>
                <TableCell>{grade.comments}</TableCell>
                <TableCell>{new Date(grade.evaluation_date).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-center text-gray-500">Aucune note trouvée pour cette sélection.</p>
      )}
    </div>
  );
}