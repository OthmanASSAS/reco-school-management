import RoomsList from "./components/RoomsList";
import supabase from "@/lib/supabase";

export default async function RoomsPage() {
  // Charger les données des salles côté serveur
  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, name, capacity, location, created_at")
    .order("name", { ascending: true });

  return (
    <div className="w-full p-4 md:p-6">
      <div className="w-full md:max-w-7xl md:mx-auto">
        <RoomsList initialRooms={rooms || []} />
      </div>
    </div>
  );
}
