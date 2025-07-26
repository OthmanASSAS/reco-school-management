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
import { filterEnrollmentsBySchoolYear } from "@/lib/utils/payment-calculations";
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

  // Fonction utilitaire pour filtrer les paiements par année scolaire
  const filterPaymentsBySchoolYear = (payments: any[], schoolYear: any) => {
    if (!schoolYear) return payments;

    // Utiliser la logique scolaire (septembre-août) pour les paiements
    const schoolYearStart = new Date(schoolYear.start_date).getFullYear();
    const schoolYearEnd = schoolYear.end_date
      ? new Date(schoolYear.end_date).getFullYear()
      : schoolYearStart + 1;

    return payments.filter(payment => {
      const paymentDate = new Date(payment.created_at);
      const paymentMonth = paymentDate.getMonth() + 1; // 1-12
      const paymentYear = paymentDate.getFullYear();

      // Logique scolaire : si paiement entre septembre (9) et août (8)
      const paymentSchoolYear = paymentMonth >= 9 ? paymentYear : paymentYear - 1;
      return paymentSchoolYear === schoolYearStart;
    });
  };

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
          first_name,
          last_name,
          birth_date,
          registration_type,
          level,
          notes,
          enrollments(
            id,
            course_id,
            status,
            start_date,
            end_date,
            created_at,
            school_year_id,
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

    // Log removed for cleaner output

    // Fusionner les données détaillées avec les données de base
    const mergedFamilies = initialFamilies.map(family => {
      const details = data?.find(d => d.id === family.id);

      return {
        ...family,
        payments: (details?.payments || []) as Payment[],
        students: (details?.students || []).map(detailedStudent => {
          const enrichedEnrollments = (detailedStudent.enrollments || []).map(e => ({
            ...e,
            courses: e.courses,
          }));

          return {
            ...detailedStudent,
            enrollments: enrichedEnrollments as any, // Type assertion pour éviter les erreurs
          };
        }),
      };
    });

    // ✅ FILTRAGE: Par année scolaire pour enrollments et payments
    const selectedSchoolYear = schoolYears.find(year => year.id === currentSchoolYear);

    const filteredData = mergedFamilies.map(family => ({
      ...family,
      // Filtrer les paiements par année scolaire
      payments: filterPaymentsBySchoolYear(family.payments, selectedSchoolYear),
    })) as EnrichedFamily[];

    setFamilies(filteredData);
  }

  const handlePaymentManagement = async (family: Family) => {
    // S'assurer que les données détaillées sont chargées
    await fetchFamilyDetails();

    // Trouver la famille mise à jour dans la liste
    const updatedFamily = families.find(f => f.id === family.id);
    if (updatedFamily) {
      setSelectedFamily(updatedFamily);
      setPaymentModalOpen(true);
    } else {
      // Fallback: utiliser la famille originale
      setSelectedFamily(family);
      setPaymentModalOpen(true);
    }
  };

  const handleFamilyDetails = (family: Family) => {
    setSelectedFamilyForDetails(family);
    setFamilyDetailsModalOpen(true);
  };

  // Fonction pour vérifier si une famille a des enrollments pour une année
  const hasEnrollmentsForYear = (family: EnrichedFamily, schoolYearId: string | null) => {
    if (!schoolYearId) return true;

    return family.students?.some(student =>
      student.enrollments?.some(enrollment => {
        return enrollment.school_year_id === schoolYearId;
      })
    );
  };

  // Compter les familles qui ont des enrollments pour l'année sélectionnée
  const familiesForCurrentYear = families.filter(f =>
    hasEnrollmentsForYear(f, currentSchoolYear)
  ).length;

  // Filtrer les familles par année scolaire ET par recherche
  const filtered = families.filter(f => {
    // Filtre par recherche
    const fullName = `${f?.first_name || ""} ${f?.last_name || ""}`.trim().toLowerCase();
    const email = (f?.email || "").toLowerCase();
    const phone = f?.phone || "";

    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase()) ||
      phone.includes(search);

    if (!matchesSearch) return false;

    // Si aucune année scolaire n'est sélectionnée, montrer toutes les familles
    if (!currentSchoolYear) return true;

    // Filtrer par année scolaire
    return hasEnrollmentsForYear(f, currentSchoolYear);
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
          <CardTitle>
            Familles ({filtered.length}/
            {currentSchoolYear ? familiesForCurrentYear : families.length})
            {currentSchoolYear && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                • {schoolYears.find(y => y.id === currentSchoolYear)?.label}
              </span>
            )}
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
            <Select
              value={currentSchoolYear || "all"}
              onValueChange={value => {
                setCurrentSchoolYear(value === "all" ? null : value);
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Toutes les années" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les années</SelectItem>
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
            schoolYears={schoolYears}
            currentSchoolYear={currentSchoolYear}
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
