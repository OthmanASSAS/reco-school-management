import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { getGradeHistory } from "../actions/actions.server";

interface GradeHistoryProps {
  selectedStudentId: string;
}

export function GradeHistory({ selectedStudentId }: GradeHistoryProps) {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (selectedStudentId) {
        const fetchedHistory = await getGradeHistory(selectedStudentId);
        setHistory(fetchedHistory);
      }
    };
    fetchHistory();
  }, [selectedStudentId]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Historique des Notes</h2>
      {history.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Année Scolaire</TableHead>
              <TableHead>Matière</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Coefficient</TableHead>
              <TableHead>Commentaires</TableHead>
              <TableHead>Date d'évaluation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((grade: any) => (
              <TableRow key={grade.id}>
                <TableCell>{grade.school_years?.label || "N/A"}</TableCell>
                <TableCell>{grade.subjects?.name || "N/A"}</TableCell>
                <TableCell>
                  {grade.period_type} - {grade.period_value}
                </TableCell>
                <TableCell>{grade.score}</TableCell>
                <TableCell>{grade.coefficient}</TableCell>
                <TableCell>{grade.comments}</TableCell>
                <TableCell>{new Date(grade.evaluation_date).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-center text-gray-500">
          Aucun historique de notes trouvé pour cet élève.
        </p>
      )}
    </div>
  );
}
