import { Button } from "@/components/ui/button";
import { generateBulletin } from "../actions/actions.server";

interface BulletinGeneratorProps {
  selectedStudentId: string;
  selectedSchoolYearId: string;
}

export function BulletinGenerator({ selectedStudentId, selectedSchoolYearId }: BulletinGeneratorProps) {
  const handleGenerate = async () => {
    if (selectedStudentId && selectedSchoolYearId) {
      await generateBulletin(selectedStudentId, selectedSchoolYearId);
      alert("Génération du bulletin lancée !"); // Temporary feedback
    } else {
      alert("Veuillez sélectionner un élève et une année scolaire.");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Générer le Bulletin</h2>
      <Button onClick={handleGenerate}>Générer le Bulletin PDF</Button>
    </div>
  );
}