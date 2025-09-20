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
// import { useToast } from "@/hooks/use-toast";

import { Family, SchoolYear, Student, Enrollment, Course, Payment } from "@/types/families";
// import { filterEnrollmentsBySchoolYear } from "@/lib/utils/payment-calculations";
import FamiliesTable from "./FamiliesTable";
import PaymentModal from "./PaymentModal";
import FamilyDetailsModal from "./FamilyDetailsModal";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

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
  // const { toast } = useToast();
  const [families, setFamilies] = useState<EnrichedFamily[]>(initialFamilies as EnrichedFamily[]);
  const [search, setSearch] = useState("");
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<EnrichedFamily | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [currentSchoolYear, setCurrentSchoolYear] = useState<string | null>(
    initialSchoolYears?.[0]?.id || null
  );
  const [schoolYears] = useState<SchoolYear[]>(initialSchoolYears || []);
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
  const filterPaymentsBySchoolYear = (payments: Payment[], schoolYear: SchoolYear | null) => {
    if (!schoolYear) return payments;

    // Utiliser la logique scolaire (septembre-août) pour les paiements
    const schoolYearStart = new Date(schoolYear.start_date).getFullYear();

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
            enrollments: enrichedEnrollments as unknown as EnrichedEnrollment[],
          };
        }),
      };
    });

    // ✅ FILTRAGE: Par année scolaire pour enrollments et payments
    const selectedSchoolYear = schoolYears.find(year => year.id === currentSchoolYear) || null;

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
        // Inclure les enrollments sans school_year_id (nouveaux) ET ceux avec le bon school_year_id
        return enrollment.school_year_id === schoolYearId || enrollment.school_year_id === null;
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
        <Alert
          className={
            deleteMessage.includes("succès")
              ? "border-green-500 bg-green-50"
              : "border-red-500 bg-red-50"
          }
        >
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
                  <span className="text-white text-sm font-bold">F</span>
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Familles</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {filtered.length} sur {families.length} familles
                  {currentSchoolYear && (
                    <span className="ml-2 text-blue-600">
                      • {schoolYears.find(y => y.id === currentSchoolYear)?.label}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
              <Select
                value={currentSchoolYear || "all"}
                onValueChange={value => {
                  setCurrentSchoolYear(value === "all" ? null : value);
                }}
              >
                <SelectTrigger className="w-full sm:w-48 bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200">
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
              <div className="relative flex-1 sm:flex-initial z-30">
                <Input
                  placeholder="Rechercher une famille..."
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
                <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link href="/pre-registration" target="_blank">
                    <UserPlus size={16} className="mr-2" />
                    Nouvelle famille
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <FamiliesTable
            families={filtered}
            schoolYears={schoolYears}
            currentSchoolYear={currentSchoolYear}
            onPaymentManagement={handlePaymentManagement}
            // onFamilyDetails={handleFamilyDetails}
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
