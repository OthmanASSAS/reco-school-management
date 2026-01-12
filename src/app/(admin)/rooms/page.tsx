import RoomsList from "./components/RoomsList";
import { getRooms } from "@/lib/dal/rooms";

export const dynamic = 'force-dynamic';

export default async function RoomsPage() {
  // Charger les données via le DAL Prisma (Architecture DDD)
  const rooms = await getRooms();

  return (
    <div className="w-full p-4 md:p-6">
      <div className="w-full md:max-w-7xl md:mx-auto">
        <RoomsList initialRooms={rooms} />
      </div>
    </div>
  );
}
