import { getDashboardStats } from "@/lib/dal/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, CreditCard, Home } from "lucide-react";
import CompactClassesOverview from "@/components/dashboard/CompactClassesOverview";
import StatsCard from "@/components/dashboard/StatsCard";
import Link from "next/link";

export default async function DashboardPage() {
  const {
    studentsCount,
    familiesCount,
    coursesCount,
    totalRevenue,
    overduePayments,
    recentStudents,
    occupancyRate,
    courses,
  } = await getDashboardStats();

  // Mapping des cours pour le composant CompactClassesOverview (si les noms de champs diffèrent légèrement)
  const mappedCourses = courses.map(c => ({
    ...c,
    enrolled_count: c.enrolledCount,
    teacher_name: "Enseignant", // On simplifie pour l'instant
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Vue d&apos;ensemble de votre établissement</p>
            </div>
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              asChild
            >
              <Link href="/registration">Nouvelle inscription</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Élèves inscrits"
              value={studentsCount ?? "-"}
              icon={<Users size={24} className="text-blue-600" />}
              href="/students"
              bgColor="bg-blue-100"
            />
            <StatsCard
              title="Familles"
              value={familiesCount ?? "-"}
              icon={<Home size={24} className="text-emerald-600" />}
              href="/families"
              bgColor="bg-emerald-100"
            />
            <StatsCard
              title="Cours actifs"
              value={coursesCount ?? "-"}
              icon={<BookOpen size={24} className="text-green-600" />}
              href="/courses"
              bgColor="bg-green-100"
            />
            <StatsCard
              title="Revenus encaissés"
              value={`${totalRevenue.toLocaleString()} €`}
              icon={<CreditCard size={24} className="text-purple-600" />}
              href="/payments"
              bgColor="bg-purple-100"
            />
          </div>

          <CompactClassesOverview courses={mappedCourses} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="space-y-3">
                <div className="font-semibold mb-2">Alertes</div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-700">
                    {overduePayments} anomalies de paiement
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-700">
                    Occupation moyenne : {occupancyRate}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3">
                <div className="font-semibold mb-2">Inscriptions récentes</div>
                {recentStudents.map(reg => (
                  <div key={reg.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium text-sm">
                        {reg.firstName} {reg.lastName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">Inscrit</Badge>
                  </div>
                ))}
                {recentStudents.length === 0 && (
                  <div className="text-xs text-gray-500 text-center py-4">
                    Aucune inscription récente
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
