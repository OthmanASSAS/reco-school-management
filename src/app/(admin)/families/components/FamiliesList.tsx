"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { Family, SchoolYear, Student, Enrollment, Course, Payment } from "@/types/families";
import FamiliesTable from "./FamiliesTable";
import FamilyFormModal from "./FamilyFormModal";
import PaymentModal from "./PaymentModal";
import FamilyDetailsModal from "./FamilyDetailsModal";

interface FamiliesListProps {
  initialFamilies: Family[];
  initialSchoolYears: SchoolYear[];
}

interface EnrichedEnrollment extends Omit<Enrollment, "courses"> {
  courses: Course;
}

interface EnrichedStudent extends Omit<Student, "enrollments"> {
  enrollments: EnrichedEnrollment[];
}

interface EnrichedFamily extends Omit<Family, "students"> {
  students: EnrichedStudent[];
}

export default function FamiliesList({ initialFamilies, initialSchoolYears }: FamiliesListProps) {
  const { toast } = useToast();
  const [families, setFamilies] = useState<EnrichedFamily[]>(initialFamilies as EnrichedFamily[]);
  const [search, setSearch] = useState("");
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<EnrichedFamily | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [currentSchoolYear, setCurrentSchoolYear] = useState<string | null>(
    initialSchoolYears?.[0]?.id || null
  );
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>(initialSchoolYears || []);
  const [familyDetailsModalOpen, setFamilyDetailsModalOpen] = useState(false);
  const [selectedFamilyForDetails, setSelectedFamilyForDetails] = useState<EnrichedFamily | null>(
    null
  );

  useEffect(() => {
    if (currentSchoolYear) {
      fetchFamilyDetails();
    }
  }, [currentSchoolYear]);

  async function fetchFamilyDetails() {
    if (!currentSchoolYear) return;

    const { data, error } = await supabase.from("families").select(`
        id,
        payments!payments_family_id_fkey(
          id,
          amount_cash,
          amount_card,
          amount_transfer,
          refund_amount,
          books,
          remarks,
          cheques,
          created_at
        ),
        students(
          id,
          enrollments(
            id,
            status,
            start_date,
            end_date,
            created_at,
            courses:course_id(
              id,
              name,
              price,
              type,
              category,
              label,
              status
            )
          )
        )
      `);

    if (error) {
      console.error(error);
      return;
    }

    // Fusionner les données détaillées avec les données de base
    const mergedFamilies = initialFamilies.map(family => {
      const details = data?.find(d => d.id === family.id);
      return {
        ...family,
        payments: (details?.payments || []) as Payment[],
        students: family.students.map(student => {
          const detailedStudent = details?.students?.find(s => s.id === student.id);
          const enrichedEnrollments = (detailedStudent?.enrollments || []).map(e => ({
            ...e,
            courses: e.courses, // plus besoin de [0], c'est un objet
          }));
          return {
            ...student,
            enrollments: enrichedEnrollments as EnrichedEnrollment[],
          };
        }),
      };
    });

    // ✅ FILTRAGE: Par année scolaire pour enrollments et payments
    const selectedSchoolYear = schoolYears.find(year => year.id === currentSchoolYear);
    const schoolYearStart = selectedSchoolYear
      ? new Date(selectedSchoolYear.start_date).getFullYear()
      : new Date().getFullYear();

    const filteredData = mergedFamilies.map(family => ({
      ...family,
      // Filtrer les étudiants et leurs cours par année
      students: family.students.map(student => ({
        ...student,
        enrollments: student.enrollments.filter(enrollment => {
          const enrollmentYear = new Date(enrollment.start_date).getFullYear();
          return enrollment.status === "active" && enrollmentYear === schoolYearStart;
        }),
      })),
      // Filtrer les paiements par année
      payments: family.payments.filter(payment => {
        const paymentYear = new Date(payment.created_at).getFullYear();
        return paymentYear === schoolYearStart;
      }),
    })) as EnrichedFamily[];

    setFamilies(filteredData);
  }

  const handlePaymentManagement = (family: Family) => {
    setSelectedFamily(family);
    setPaymentModalOpen(true);
  };

  const handleFamilyDetails = (family: Family) => {
    setSelectedFamilyForDetails(family);
    setFamilyDetailsModalOpen(true);
  };

  const filtered = families.filter(f => {
    const fullName = `${f?.first_name || ""} ${f?.last_name || ""}`.trim().toLowerCase();
    const email = (f?.email || "").toLowerCase();
    const phone = f?.phone || "";

    return (
      fullName.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase()) ||
      phone.includes(search)
    );
  });

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
          <CardTitle>Familles ({families.length})</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
            <Select value={currentSchoolYear || ""} onValueChange={setCurrentSchoolYear}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sélectionner l'année" />
              </SelectTrigger>
              <SelectContent>
                {schoolYears.map(year => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.label ||
                      `${new Date(year.start_date).getFullYear()}-${new Date(year.start_date).getFullYear() + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:max-w-xs"
            />
            <div className="w-full sm:w-auto">
              <FamilyFormModal onFamilyCreated={fetchFamilyDetails} />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <FamiliesTable
            families={filtered}
            onPaymentManagement={handlePaymentManagement}
            onFamilyDetails={handleFamilyDetails}
            onRefresh={fetchFamilyDetails}
            setDeleteMessage={setDeleteMessage}
          />
        </CardContent>
      </Card>

      {selectedFamily && (
        <PaymentModal
          family={selectedFamily}
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          onPaymentSaved={fetchFamilyDetails}
          currentSchoolYear={currentSchoolYear}
          schoolYears={schoolYears}
        />
      )}

      {selectedFamilyForDetails && (
        <FamilyDetailsModal
          family={selectedFamilyForDetails}
          open={familyDetailsModalOpen}
          onOpenChange={setFamilyDetailsModalOpen}
        />
      )}
    </div>
  );
}
