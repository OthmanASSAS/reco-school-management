export type Course = {
  id: string;
  name: string;
  type: "enfants" | "adultes";
  teacher_id: string | null;
  teacher_name?: string | null;
  room_id: string | null;
  room_name?: string | null;
  schedule_id: string | null;
  schedule_label?: string | null;
  capacity: number;
  price: number;
  label: string;
  category: string;
  audience: string;
  created_at?: string;
};
