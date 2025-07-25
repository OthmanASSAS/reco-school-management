import { MemberFormFieldsProps } from "@/app/(admin)/families/[id]/edit/page";

export interface Course {
  id: string;
  name: string;
  price: number;
  type: string;
  label?: string;
  category?: string;
}

export interface Enrollment {
  id: string;
  course_id: string; // La clé étrangère vers le cours
  school_year_id?: string; // La clé étrangère vers l'année scolaire
  status: string;
  start_date: string;
  end_date?: string;
  created_at: string;
  courses: Course; // L'objet cours imbriqué retourné par la requête
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  registration_type: MemberFormFieldsProps["memberType"];
  level?: string;
  notes?: string;
  enrollments: Enrollment[];
}

export interface Payment {
  id: string;
  amount_cash?: number;
  amount_card?: number;
  amount_transfer?: number;
  refund_amount?: number;
  books?: boolean;
  remarks?: string;
  cheques?: string | any[];
  created_at: string;
}

export interface Family {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  students: Student[];
  payments: Payment[];
}

export interface SchoolYear {
  id: string;
  label: string;
  start_date: string;
}
