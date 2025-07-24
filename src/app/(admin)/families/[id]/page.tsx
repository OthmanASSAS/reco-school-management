import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, UserPlus, BookOpen, CreditCard, Info } from "lucide-react";
import supabase from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function FamilyDetailPage({ params }: { params: { id: string } }) {
  // Fetch famille + membres dynamiquement
  const { data: family, error } = await supabase
    .from("families")
    .select(
      `id, last_name, first_name, email, phone, address, status, students(
        id, first_name, last_name, birth_date, registration_type, level, notes
      )`
    )
    .eq("id", params.id)
    .single();

  if (error || !family) return notFound();

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header famille */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Famille {family.first_name} {family.last_name}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2 text-gray-600 text-sm">
            <span>{family.email}</span>
            <span>•</span>
            <span>{family.phone}</span>
            <span>•</span>
            <span>{family.address}</span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant={family.status === "active" ? "default" : "secondary"}>
            {family.status === "active" ? "Active" : "Inactive"}
          </Badge>
          <Button variant="outline" size="sm" className="flex gap-2 items-center">
            <Edit size={16} /> Éditer la famille
          </Button>
        </div>
      </div>

      {/* Tabs navigation */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="members" className="flex gap-2 items-center">
            <UserPlus size={16} /> Membres
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex gap-2 items-center">
            <BookOpen size={16} /> Cours & historique
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex gap-2 items-center">
            <CreditCard size={16} /> Paiements
          </TabsTrigger>
          <TabsTrigger value="info" className="flex gap-2 items-center">
            <Info size={16} /> Infos famille
          </TabsTrigger>
        </TabsList>

        {/* Tab Membres */}
        <TabsContent value="members">
          <Card>
            <CardContent className="p-6">
              {/* Liste des membres/enfants */}
              <div className="flex flex-col gap-4">
                {family.students.length === 0 && (
                  <div className="text-gray-500">Aucun membre pour cette famille.</div>
                )}
                {family.students.map((student: any) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {student.first_name} {student.last_name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {student.birth_date} • {student.registration_type} • {student.level}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Edit size={14} className="mr-1" /> Éditer
                    </Button>
                  </div>
                ))}
                <Button className="mt-2 w-full sm:w-auto" variant="default">
                  <UserPlus size={16} className="mr-2" /> Ajouter un membre
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Cours & historique */}
        <TabsContent value="courses">
          <Card>
            <CardContent className="p-6">
              {/* TODO: Attribution de cours, année courante, historique */}
              <div className="text-gray-500">Cours et historique à venir…</div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Paiements */}
        <TabsContent value="payments">
          <Card>
            <CardContent className="p-6">
              {/* TODO: Paiements, reste à payer, historique paiements */}
              <div className="text-gray-500">Paiements à venir…</div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Infos famille */}
        <TabsContent value="info">
          <Card>
            <CardContent className="p-6">
              {/* TODO: Formulaire d'édition des infos famille */}
              <div className="text-gray-500">Édition des infos famille à venir…</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
