// /Users/oassas/Projets/inscription-app/src/app/(admin)/planning/page.tsx
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlanningView from "./components/PlanningView";
import { getCoursesWithDetails } from "@/lib/dal/courses";

export default async function PlanningPage() {
  // Chargement des données via Prisma au niveau serveur
  // Évite les erreurs de fetch Supabase côté client
  const courses = await getCoursesWithDetails();

  return (
    <div className="w-full p-4 md:p-6">
      <div className="w-full md:max-w-7xl md:mx-auto space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Planning</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <PlanningView initialCourses={courses} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
