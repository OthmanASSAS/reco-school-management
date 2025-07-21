export interface Family {
  id: string;
  last_name: string;
  first_name: string;
  email: string;
  phone: string;
  address: string;
  postal_code: string;
  city: string;
  students: Student[];
  payments?: Payment[]; // Ajouté pour les paiements globaux famille
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  registration_type: string;
  enrollments: Enrollment[];
  payments: Payment[];
}

export interface Payment {
  id: string;
  student_id?: string;
  amount_cash?: number;
  amount_card?: number;
  amount_transfer?: number;
  refund_amount?: number;
  books?: boolean;
  remarks?: string;
  cheques?: ChequeLot[] | string;
  created_at: string;
}

export interface Enrollment {
  id: string;
  status: string;
  start_date: string;
  courses: {
    id: string;
    name: string;
    price: number;
    type: string;
  };
}

export interface ChequeLot {
  count: number;
  amount: number;
  banque: string;
  nom: string;
}
