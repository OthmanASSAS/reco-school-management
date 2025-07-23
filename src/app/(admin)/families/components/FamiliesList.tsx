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

import { Family } from "@/types/families";
import FamiliesTable from "./FamiliesTable";
import FamilyFormModal from "./FamilyFormModal";
import PaymentModal from "./PaymentModal";
import FamilyDetailsModal from "./FamilyDetailsModal";

export default function FamiliesList() {
  const { toast } = useToast();
  const [families, setFamilies] = useState<Family[]>([]);
  const [search, setSearch] = useState("");
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [currentSchoolYear, setCurrentSchoolYear] = useState<string | null>(null);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [familyDetailsModalOpen, setFamilyDetailsModalOpen] = useState(false);
  const [selectedFamilyForDetails, setSelectedFamilyForDetails] = useState<Family | null>(null);

  useEffect(() => {
    fetchSchoolYears();
  }, []);

  useEffect(() => {
    if (currentSchoolYear) {
      fetchFamilies();
    }
  }, [currentSchoolYear]);

  async function fetchSchoolYears() {
    const { data, error } = await supabase
      .from("school_years")
      .select("id, label, start_date")
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Erreur récupération années scolaires:", error);
    } else {
      setSchoolYears(data || []);
      if (data && data.length > 0) {
        setCurrentSchoolYear(data[0].id);
      }
    }
  }

  async function fetchFamilies() {
    if (!currentSchoolYear) return;

    const { data, error } = await supabase
      .from("families")
      .select(
        `
        id, 
        last_name, 
        first_name, 
        email, 
        phone, 
        address, 
        postal_code, 
        city,
        payments!payments_family_id_fkey(
          id,
          family_id,
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
          enrollments(
            id,
            status,
            start_date,
            courses(
              id,
              name,
              price,
              type
            )
          )
        )
      `
      )
      .order("last_name", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      // ✅ FILTRAGE: Par année scolaire pour enrollments et payments
      const selectedSchoolYear = schoolYears.find(year => year.id === currentSchoolYear);
      const schoolYearStart = selectedSchoolYear
        ? new Date(selectedSchoolYear.start_date).getFullYear()
        : new Date().getFullYear();

      const filteredData = ((data as any[]) || []).map(family => ({
        ...family,
        // Filtrer les étudiants et leurs cours par année
        students: family.students.map((student: any) => ({
          ...student,
          enrollments: student.enrollments.filter((enrollment: any) => {
            const enrollmentYear = new Date(enrollment.start_date).getFullYear();
            return enrollment.status === "active" && enrollmentYear === schoolYearStart;
          }),
        })),
        // Filtrer les paiements par année
        payments: family.payments.filter((payment: any) => {
          const paymentYear = new Date(payment.created_at).getFullYear();
          return paymentYear === schoolYearStart;
        }),
      }));

      setFamilies(filteredData);
    }
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Familles ({families.length})</CardTitle>
          <div className="flex gap-3 items-center">
            <Select value={currentSchoolYear || ""} onValueChange={setCurrentSchoolYear}>
              <SelectTrigger className="w-48">
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
              className="max-w-xs"
            />
            <FamilyFormModal onFamilyCreated={fetchFamilies} />
          </div>
        </CardHeader>

        <CardContent>
          <FamiliesTable
            families={filtered}
            onPaymentManagement={handlePaymentManagement}
            onFamilyDetails={handleFamilyDetails}
            onRefresh={fetchFamilies}
            setDeleteMessage={setDeleteMessage}
          />
        </CardContent>
      </Card>

      {selectedFamily && (
        <PaymentModal
          family={selectedFamily}
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          onPaymentSaved={fetchFamilies}
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
