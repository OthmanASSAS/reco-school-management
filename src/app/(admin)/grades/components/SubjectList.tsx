import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SubjectListProps {
  subjects: { id: string; name: string; course_id: string }[];
  onSelectSubject: (subjectId: string) => void;
  selectedSubjectId: string | null;
}

export function SubjectList({
  subjects,
  onSelectSubject,
  selectedSubjectId,
}: SubjectListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Matières du Cours</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {subjects.length > 0 ? (
          subjects.map((subject) => (
            <Button
              key={subject.id}
              variant={selectedSubjectId === subject.id ? "default" : "outline"}
              onClick={() => onSelectSubject(subject.id)}
              className="justify-start"
            >
              {subject.name}
            </Button>
          ))
        ) : (
          <p className="text-gray-500">Aucune matière trouvée pour ce cours.</p>
        )}
      </CardContent>
    </Card>
  );
}
