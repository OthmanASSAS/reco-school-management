"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Edit, Trash2, Mail, Phone, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase";
import TeacherFormModal from "./TeacherFormModal";
import EditTeacherModal from "./EditTeacherModal";
import TeacherDetailsModal from "./TeacherDetailsModal";

interface Teacher {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
}

interface TeachersListProps {
  initialTeachers: Teacher[];
}

export default function TeachersList({ initialTeachers }: TeachersListProps) {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [search, setSearch] = useState("");
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTeacherForDetails, setSelectedTeacherForDetails] = useState<Teacher | null>(null);

  const handleDelete = async (teacher: Teacher) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le professeur ${teacher.full_name} ?`)) {
      try {
        const { error } = await supabase.from("teachers").delete().eq("id", teacher.id);

        if (error) {
          setDeleteMessage(`Erreur lors de la suppression: ${error.message}`);
        } else {
          setTeachers(teachers.filter(t => t.id !== teacher.id));
          setDeleteMessage("Professeur supprimé avec succès !");
          toast({
            title: "Professeur supprimé",
            description: "Le professeur a été supprimé avec succès.",
          });
        }
      } catch (error) {
        setDeleteMessage("Erreur lors de la suppression du professeur.");
      }

      setTimeout(() => setDeleteMessage(null), 5000);
    }
  };

  const handleTeacherCreated = async () => {
    // Recharger les données
    const { data } = await supabase
      .from("teachers")
      .select("id, full_name, email, phone, created_at")
      .order("full_name", { ascending: true });

    if (data) {
      setTeachers(data);
    }
  };

  const handleTeacherUpdated = async () => {
    // Recharger les données
    const { data } = await supabase
      .from("teachers")
      .select("id, full_name, email, phone, created_at")
      .order("full_name", { ascending: true });

    if (data) {
      setTeachers(data);
    }
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setEditModalOpen(true);
  };

  const handleViewDetails = (teacher: Teacher) => {
    setSelectedTeacherForDetails(teacher);
    setDetailsModalOpen(true);
  };
  const filteredTeachers = teachers.filter(
    teacher =>
      teacher.full_name.toLowerCase().includes(search.toLowerCase()) ||
      teacher.email.toLowerCase().includes(search.toLowerCase()) ||
      teacher.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      {deleteMessage && (
        <Alert className={deleteMessage.includes("succès") ? "border-green-500" : "border-red-500"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{deleteMessage}</AlertDescription>
        </Alert>
      )}

      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">P</span>
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Professeurs</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredTeachers.length} sur {teachers.length} professeurs
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Input
                  placeholder="Rechercher un professeur..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full sm:w-80 pl-10 bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <TeacherFormModal onTeacherCreated={handleTeacherCreated} />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Table pour Desktop */}
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900">Liste des professeurs</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredTeachers.length} professeur{filteredTeachers.length > 1 ? "s" : ""}{" "}
                  trouvé{filteredTeachers.length > 1 ? "s" : ""}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                        Professeur
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                        Contact
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                        Date d'ajout
                      </th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTeachers.map((teacher, index) => (
                      <tr
                        key={teacher.id}
                        className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200"
                      >
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-all duration-200">
                              {teacher.full_name
                                .split(" ")
                                .map(n => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {teacher.full_name}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                Professeur
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="space-y-2">
                            {teacher.email && (
                              <div className="flex items-center gap-3 p-2 bg-blue-50/50 rounded-lg group-hover:bg-blue-100/50 transition-colors">
                                <div className="p-1 bg-blue-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                  <Mail size={12} className="text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-900 truncate">
                                  {teacher.email}
                                </span>
                              </div>
                            )}
                            {teacher.phone && (
                              <div className="flex items-center gap-3 p-2 bg-green-50/50 rounded-lg group-hover:bg-green-100/50 transition-colors">
                                <div className="p-1 bg-green-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                  <Phone size={12} className="text-green-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {teacher.phone}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <svg
                                className="w-4 h-4 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {new Date(teacher.created_at).toLocaleDateString("fr-FR")}
                              </div>
                              <div className="text-xs text-gray-500">Ajouté le</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-all duration-200"
                              onClick={() => handleViewDetails(teacher)}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all duration-200"
                              onClick={() => handleEditTeacher(teacher)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200"
                              onClick={() => handleDelete(teacher)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cartes pour Mobile/Tablette */}
          <div className="lg:hidden">
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTeachers.map(teacher => (
                <Card
                  key={teacher.id}
                  className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white overflow-hidden"
                >
                  <CardContent className="p-6">
                    {/* En-tête avec avatar et actions */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {teacher.full_name
                            .split(" ")
                            .map(n => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {teacher.full_name}
                          </h3>
                          <p className="text-sm text-gray-500">Professeur</p>
                        </div>
                      </div>
                    </div>

                    {/* Informations de contact */}
                    <div className="space-y-3 mb-4">
                      {teacher.email && (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group/contact hover:bg-blue-50 transition-colors">
                          <div className="p-1 bg-blue-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                            <Mail size={12} className="text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {teacher.email}
                            </div>
                            <div className="text-xs text-gray-500">Email</div>
                          </div>
                        </div>
                      )}

                      {teacher.phone && (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group/contact hover:bg-green-50 transition-colors">
                          <div className="p-1 bg-green-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                            <Phone size={12} className="text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {teacher.phone}
                            </div>
                            <div className="text-xs text-gray-500">Téléphone</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 pt-4 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all text-xs px-2"
                        onClick={() => handleViewDetails(teacher)}
                      >
                        <Eye size={12} className="mr-1" />
                        <span className="hidden sm:inline">Détails</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all text-xs px-2"
                        onClick={() => handleEditTeacher(teacher)}
                      >
                        <Edit size={12} className="mr-1" />
                        <span className="hidden sm:inline">Modifier</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all text-xs px-2 w-8 h-8 p-0"
                        onClick={() => handleDelete(teacher)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {filteredTeachers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {search ? "Aucun professeur trouvé" : "Aucun professeur enregistré"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {search
                  ? "Essayez de modifier vos critères de recherche ou ajoutez un nouveau professeur."
                  : "Commencez par ajouter votre premier professeur à l'équipe pédagogique."}
              </p>
              {!search && <TeacherFormModal onTeacherCreated={handleTeacherCreated} />}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTeacher && (
        <EditTeacherModal
          teacher={selectedTeacher}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onTeacherUpdated={handleTeacherUpdated}
        />
      )}

      {selectedTeacherForDetails && (
        <TeacherDetailsModal
          teacher={selectedTeacherForDetails}
          open={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
        />
      )}
    </div>
  );
}
