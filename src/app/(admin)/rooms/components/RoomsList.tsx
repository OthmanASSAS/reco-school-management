"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Edit, Trash2, Users, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase";
import RoomFormModal from "./RoomFormModal";

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

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>
            Salles ({filteredRooms.length}/{rooms.length})
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
            <Input
              placeholder="Rechercher une salle..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:max-w-xs"
            />
            <div className="w-full sm:w-auto">
              <RoomFormModal onRoomCreated={handleRoomCreated} />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map(room => (
              <Card key={room.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                        {room.name}
                      </CardTitle>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users size={14} />
                          <span>Capacité: {room.capacity} personnes</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin size={14} />
                          <span>{room.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                        title="Modifier"
                        onClick={() => {
                          toast({
                            title: "Fonctionnalité à venir",
                            description: "La modification sera bientôt disponible.",
                          });
                        }}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                        title="Supprimer"
                        onClick={() => handleDelete(room)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {filteredRooms.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {search ? "Aucune salle trouvée pour cette recherche." : "Aucune salle enregistrée."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
