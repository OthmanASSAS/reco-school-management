"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Edit, Trash2, Users, MapPin, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase";
import RoomFormModal from "./RoomFormModal";
import EditRoomModal from "./EditRoomModal";
import RoomDetailsModal from "./RoomDetailsModal";

interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  created_at: string;
}

interface RoomsListProps {
  initialRooms: Room[];
}

export default function RoomsList({ initialRooms }: RoomsListProps) {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [search, setSearch] = useState("");
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState<Room | null>(null);

  const handleDelete = async (room: Room) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la salle ${room.name} ?`)) {
      try {
        const { error } = await supabase.from("rooms").delete().eq("id", room.id);

        if (error) {
          setDeleteMessage(`Erreur lors de la suppression: ${error.message}`);
        } else {
          setRooms(rooms.filter(r => r.id !== room.id));
          setDeleteMessage("Salle supprimée avec succès !");
          toast({
            title: "Salle supprimée",
            description: "La salle a été supprimée avec succès.",
          });
        }
      } catch (error) {
        setDeleteMessage("Erreur lors de la suppression de la salle.");
      }

      setTimeout(() => setDeleteMessage(null), 5000);
    }
  };

  const handleRoomCreated = async () => {
    // Recharger les données
    const { data } = await supabase
      .from("rooms")
      .select("id, name, capacity, location, created_at")
      .order("name", { ascending: true });

    if (data) {
      setRooms(data);
    }
  };

  const handleRoomUpdated = async () => {
    // Recharger les données
    const { data } = await supabase
      .from("rooms")
      .select("id, name, capacity, location, created_at")
      .order("name", { ascending: true });

    if (data) {
      setRooms(data);
    }
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setEditModalOpen(true);
  };

  const handleViewDetails = (room: Room) => {
    setSelectedRoomForDetails(room);
    setDetailsModalOpen(true);
  };

  const filteredRooms = rooms.filter(
    room =>
      room.name.toLowerCase().includes(search.toLowerCase()) ||
      room.location.toLowerCase().includes(search.toLowerCase())
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
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">S</span>
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Salles</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredRooms.length} sur {rooms.length} salles
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Input
                  placeholder="Rechercher une salle..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full sm:w-80 pl-10 bg-white border-gray-200 focus:border-purple-300 focus:ring-purple-200"
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
                <RoomFormModal onRoomCreated={handleRoomCreated} />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Table pour Desktop */}
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-purple-100">
                <h3 className="text-lg font-semibold text-gray-900">Liste des salles</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredRooms.length} salle{filteredRooms.length > 1 ? "s" : ""} trouvée
                  {filteredRooms.length > 1 ? "s" : ""}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                        Salle
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                        Capacité
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                        Localisation
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
                    {filteredRooms.map((room, index) => (
                      <tr
                        key={room.id}
                        className="group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-200"
                      >
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-all duration-200">
                              {room.name
                                .split(" ")
                                .map(n => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                {room.name}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                Salle de cours
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-3 p-2 bg-blue-50/50 rounded-lg group-hover:bg-blue-100/50 transition-colors">
                            <div className="p-1 bg-blue-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                              <Users size={12} className="text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {room.capacity} personnes
                            </span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-3 p-2 bg-green-50/50 rounded-lg group-hover:bg-green-100/50 transition-colors">
                            <div className="p-1 bg-green-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                              <MapPin size={12} className="text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {room.location}
                            </span>
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
                                {new Date(room.created_at).toLocaleDateString("fr-FR")}
                              </div>
                              <div className="text-xs text-gray-500">Ajoutée le</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-all duration-200"
                              onClick={() => handleViewDetails(room)}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all duration-200"
                              onClick={() => handleEditRoom(room)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200"
                              onClick={() => handleDelete(room)}
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
              {filteredRooms.map(room => (
                <Card
                  key={room.id}
                  className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white overflow-hidden"
                >
                  <CardContent className="p-6">
                    {/* En-tête avec avatar et actions */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {room.name
                            .split(" ")
                            .map(n => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors truncate">
                            {room.name}
                          </h3>
                          <p className="text-sm text-gray-500">Salle de cours</p>
                        </div>
                      </div>
                    </div>

                    {/* Informations de la salle */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg group/contact hover:bg-blue-100 transition-colors">
                        <div className="p-1 bg-blue-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                          <Users size={12} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="text-sm font-medium text-gray-900">
                            {room.capacity} personnes
                          </div>
                          <div className="text-xs text-gray-500">Capacité</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg group/contact hover:bg-green-100 transition-colors">
                        <div className="p-1 bg-green-100 rounded-md flex-shrink-0 w-6 h-6 flex items-center justify-center">
                          <MapPin size={12} className="text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {room.location}
                          </div>
                          <div className="text-xs text-gray-500">Localisation</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 pt-4 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all text-xs px-2"
                        onClick={() => handleViewDetails(room)}
                      >
                        <Eye size={12} className="mr-1" />
                        <span className="hidden sm:inline">Détails</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all text-xs px-2"
                        onClick={() => handleEditRoom(room)}
                      >
                        <Edit size={12} className="mr-1" />
                        <span className="hidden sm:inline">Modifier</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all text-xs px-2 w-8 h-8 p-0"
                        onClick={() => handleDelete(room)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {filteredRooms.length === 0 && (
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {search ? "Aucune salle trouvée" : "Aucune salle enregistrée"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {search
                  ? "Essayez de modifier vos critères de recherche ou ajoutez une nouvelle salle."
                  : "Commencez par ajouter votre première salle de cours."}
              </p>
              {!search && <RoomFormModal onRoomCreated={handleRoomCreated} />}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRoom && (
        <EditRoomModal
          room={selectedRoom}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onRoomUpdated={handleRoomUpdated}
        />
      )}

      {selectedRoomForDetails && (
        <RoomDetailsModal
          room={selectedRoomForDetails}
          open={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
        />
      )}
    </div>
  );
}
