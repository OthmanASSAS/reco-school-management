import supabase from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, CreditCard, TrendingUp, AlertCircle, Home } from "lucide-react";

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

  // 7. Taux d'occupation moyen des cours
  const { data: courses } = await supabase
    .from("courses")
    .select("id, capacity, enrollments(id)")
    .eq("status", "active");
  let avgOccupancy = 0;
  if (courses && courses.length > 0) {
    const total = courses.reduce((acc, c) => {
      const enrolled = c.enrollments ? c.enrollments.length : 0;
      return acc + (c.capacity ? Math.min(enrolled / c.capacity, 1) : 0);
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
              <p className="text-gray-600 mt-1">Vue d'ensemble de votre établissement</p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Nouvelle inscription
            </Button>
          </div>

          {/* Stats Cards dynamiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Élèves inscrits</p>
                    <p className="text-2xl font-bold text-gray-900">{studentsCount ?? "-"}</p>
                  </div>
                  <div className="p-3 rounded-full bg-gray-100 text-blue-600">
                    <Users size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Familles</p>
                    <p className="text-2xl font-bold text-gray-900">{familiesCount ?? "-"}</p>
                  </div>
                  <div className="p-3 rounded-full bg-gray-100 text-emerald-600">
                    <Home size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cours actifs</p>
                    <p className="text-2xl font-bold text-gray-900">{coursesCount ?? "-"}</p>
                  </div>
                  <div className="p-3 rounded-full bg-gray-100 text-green-600">
                    <BookOpen size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenus ce mois</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalRevenue.toLocaleString()} €
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-gray-100 text-purple-600">
                    <CreditCard size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Autres KPI et alertes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Alerts dynamiques */}
            <Card className="lg:col-span-2">
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-700">
                    {overduePayments ?? 0} paiements en retard (plus de 30 jours)
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-700">
                    Taux d'occupation moyen des cours : {avgOccupancy}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Registrations dynamiques */}
            <Card>
              <CardContent className="space-y-3">
                <div className="font-semibold mb-2">Inscriptions récentes</div>
                {(recentStudents || []).map((reg: any) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {reg.first_name} {reg.last_name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(reg.created_at).toLocaleDateString()}
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
