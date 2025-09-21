import supabase from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, CreditCard, Home } from "lucide-react";
import CompactClassesOverview from "@/components/dashboard/CompactClassesOverview";
import StatsCard from "@/components/dashboard/StatsCard";
import Link from "next/link";

export default async function DashboardPage() {
  // 1. Nombre total d'élèves
  const { count: studentsCount } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true });

  // 2. Nombre total de familles
  const { count: familiesCount } = await supabase
    .from("families")
    .select("id", { count: "exact", head: true });

  // 3. Nombre de cours actifs
  const { count: coursesCount } = await supabase
    .from("courses")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  // 4. Revenus encaissés ce mois-ci
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const { data: payments } = await supabase
    .from("payments")
    .select("amount_cash, amount_card, amount_transfer, cheques, refund_amount, created_at")
    .gte("created_at", monthStart);
  let totalRevenue = 0;
  (payments || []).forEach(p => {
    totalRevenue += Number(p.amount_cash || 0);
    totalRevenue += Number(p.amount_card || 0);
    totalRevenue += Number(p.amount_transfer || 0);
    if (p.cheques) {
      let cheques = p.cheques;
      if (typeof cheques === "string") {
        try {
          cheques = JSON.parse(cheques);
        } catch {
          cheques = [];
        }
      }
      if (Array.isArray(cheques)) {
        totalRevenue += cheques.reduce((sum, lot) => sum + (lot.count || 0) * (lot.amount || 0), 0);
      }
    }
    totalRevenue -= Number(p.refund_amount || 0);
  });

  // 5. Paiements en retard (ex: créés il y a plus de 30 jours et pas de montant payé)
  const overdueDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { count: overduePayments } = await supabase
    .from("payments")
    .select("id", { count: "exact", head: true })
    .lt("created_at", overdueDate)
    .or("amount_cash.eq.0,amount_card.eq.0,amount_transfer.eq.0,cheques.is.null");

  // 6. Inscriptions récentes (7 derniers jours)
  const recentDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentStudents } = await supabase
    .from("students")
    .select("id, first_name, last_name, created_at")
    .gte("created_at", recentDate)
    .order("created_at", { ascending: false })
    .limit(5);

  // 7. Données des cours pour le composant Classes Overview
  const { data: coursesData } = await supabase
    .from("courses")
    .select(
      `
      id, name, type, capacity, schedule,
      teachers(full_name),
      enrollments(id)
    `
    )
    .eq("status", "active")
    .order("name");

  const courses = (coursesData || []).map((course: Record<string, unknown>) => ({
    id: course.id as string,
    name: course.name as string,
    type: course.type as string,
    capacity: course.capacity as number,
    enrolled_count: course.enrollments
      ? (course.enrollments as Record<string, unknown>[]).length
      : 0,
    teacher_name: (course.teachers?.full_name as string) || "Non assigné",
    schedule: (course.schedule as string) || "",
  }));

  // Calcul du taux d'occupation moyen
  let avgOccupancy = 0;
  if (courses.length > 0) {
    const total = courses.reduce((acc, c) => {
      return acc + (c.capacity ? Math.min(c.enrolled_count / c.capacity, 1) : 0);
    }, 0);
    avgOccupancy = Math.round((total / courses.length) * 100);
  }

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

          {/* Stats Cards cliquables */}
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
              title="Revenus ce mois"
              value={`${totalRevenue.toLocaleString()} €`}
              icon={<CreditCard size={24} className="text-purple-600" />}
              href="/payments"
              bgColor="bg-purple-100"
            />
          </div>

          {/* Vue compacte des classes */}
          <CompactClassesOverview courses={courses} />

          {/* Grille responsive pour les autres composants */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alerts dynamiques */}
            <Card>
              <CardContent className="space-y-3">
                <div className="font-semibold mb-2">Alertes</div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-700">
                    {overduePayments ?? 0} paiements en retard
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-700">
                    Occupation moyenne : {avgOccupancy}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Registrations */}
            <Card>
              <CardContent className="space-y-3">
                <div className="font-semibold mb-2">Inscriptions récentes</div>
                {(recentStudents || []).map((reg: Record<string, unknown>) => (
                  <div
                    key={reg.id as string}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {reg.first_name} {reg.last_name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(reg.created_at as string).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">Nouveau</Badge>
                  </div>
                ))}
                {(!recentStudents || recentStudents.length === 0) && (
                  <div className="text-xs text-gray-500">Aucune inscription récente</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
