"use client"
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, Calendar, CreditCard, TrendingUp, AlertCircle } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";


const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const stats = [
    {
      title: "Élèves inscrits",
      value: "247",
      change: "+12%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Cours actifs",
      value: "18",
      change: "+2",
      icon: BookOpen,
      color: "text-green-600"
    },
    {
      title: "Revenus du mois",
      value: "86 450 €",
      change: "+8.2%",
      icon: CreditCard,
      color: "text-purple-600"
    },
    {
      title: "Taux d'occupation",
      value: "89%",
      change: "+5%",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  const alerts = [
    { id: 1, message: "Classe CE1-A complète (25/25)", type: "warning" },
    { id: 2, message: "3 paiements en retard", type: "error" },
    { id: 3, message: "Nouvelle inscription en attente", type: "info" }
  ];

  const recentRegistrations = [
    { id: 1, name: "Sophie Martin", course: "CE1-A", date: "2024-06-20", status: "confirmed" },
    { id: 2, name: "Lucas Dubois", course: "Adulte - Anglais", date: "2024-06-19", status: "pending" },
    { id: 3, name: "Emma Rousseau", course: "CM2-B", date: "2024-06-18", status: "confirmed" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex w-full">
       {/*  <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} /> */}
        
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {activeTab === "dashboard" && "Dashboard"}
                  {activeTab === "courses" && "Gestion des cours"}
                  {activeTab === "students" && "Gestion des élèves"}
                  {activeTab === "planning" && "Planning"}
                  {activeTab === "registration" && "Nouvelle inscription"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {activeTab === "dashboard" && "Vue d'ensemble de votre établissement"}
                  {activeTab === "courses" && "Gérez vos cours et classes"}
                  {activeTab === "students" && "Gérez vos élèves et familles"}
                  {activeTab === "planning" && "Planification des salles et créneaux"}
                  {activeTab === "registration" && "Inscrire un nouvel élève"}
                </p>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Nouvelle inscription
              </Button>
            </div>

            {activeTab === "dashboard" && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                              {stat.change} vs mois dernier
                            </p>
                          </div>
                          <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                            <stat.icon size={24} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Alerts */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="text-amber-500" size={20} />
                        Alertes et notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {alerts.map((alert) => (
                        <div key={alert.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                          <div className={`w-2 h-2 rounded-full ${
                            alert.type === 'warning' ? 'bg-amber-500' :
                            alert.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                          }`} />
                          <span className="text-sm text-gray-700">{alert.message}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Recent Registrations */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Inscriptions récentes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {recentRegistrations.map((reg) => (
                        <div key={reg.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                          <div>
                            <p className="font-medium text-sm">{reg.name}</p>
                            <p className="text-xs text-gray-600">{reg.course}</p>
                          </div>
                          <Badge variant={reg.status === 'confirmed' ? 'default' : 'secondary'}>
                            {reg.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* {activeTab === "courses" && <CoursesManager />}
            {activeTab === "students" && <StudentsManager />}
            {activeTab === "planning" && <PlanningView />}
            {activeTab === "registration" && <RegistrationForm />} */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;