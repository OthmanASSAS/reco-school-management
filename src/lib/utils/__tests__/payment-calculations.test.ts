/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import {
  calculateFamilyTotal,
  calculatePaidAmount,
  filterEnrollmentsBySchoolYear,
  filterPaymentsBySchoolYear,
  type DiscountSettings,
} from "../payment-calculations";
import { Family, Payment, SchoolYear } from "@/types/families";

const mockSchoolYears: SchoolYear[] = [
  {
    id: "2024-2025",
    label: "2024-2025",
    start_date: "2024-09-01",
    end_date: "2025-08-31",
  },
  {
    id: "2023-2024",
    label: "2023-2024",
    start_date: "2023-09-01",
    end_date: "2024-08-31",
  },
];

const mockEnrollments: any[] = [
  {
    id: "enroll-1",
    status: "active",
    start_date: "2024-09-15",
    school_year_id: "2024-2025",
    courses: { id: "course-1", name: "Coran 1", price: 350 },
  },
  {
    id: "enroll-2",
    status: "active",
    start_date: "2024-10-01",
    school_year_id: "2024-2025",
    courses: { id: "course-2", name: "Arabe 1", price: 350 },
  },
  {
    id: "enroll-3",
    status: "active",
    start_date: "2024-11-01",
    school_year_id: "2024-2025",
    courses: { id: "course-3", name: "Coran 2", price: 350 },
  },
  {
    id: "enroll-4",
    status: "inactive",
    start_date: "2024-09-01",
    school_year_id: "2024-2025",
    courses: { id: "course-4", name: "Cours inactif", price: 350 },
  },
];

const mockPayments: Payment[] = [
  {
    id: "payment-1",
    amount_cash: 100,
    amount_card: 0,
    amount_transfer: 0,
    refund_amount: 0,
    cheques: [],
    school_year_id: "2024-2025",
    created_at: "2024-10-15T10:00:00Z",
  },
  {
    id: "payment-2",
    amount_cash: 0,
    amount_card: 200,
    amount_transfer: 0,
    refund_amount: 25,
    cheques: [{ count: 2, amount: 150, banque: "BNP", nom: "Dupont" }],
    school_year_id: "2024-2025",
    created_at: "2024-11-01T14:00:00Z",
  },
  {
    id: "payment-3",
    amount_cash: 50,
    amount_card: 0,
    amount_transfer: 100,
    refund_amount: 0,
    cheques: "[]",
    school_year_id: "2023-2024",
    created_at: "2024-02-15T10:00:00Z",
  },
];

const mockFamily: Family = {
  id: "family-1",
  first_name: "Jean",
  last_name: "Dupont",
  email: "jean@test.com",
  phone: "0123456789",
  address: "123 rue Test",
  postal_code: "75001",
  city: "Paris",
  students: [
    {
      id: "student-1",
      first_name: "Alice",
      last_name: "Dupont",
      birth_date: "2010-05-15",
      registration_type: "child",
      level: "débutant",
      notes: "",
      enrollments: mockEnrollments.slice(0, 2), // 2 cours
    },
    {
      id: "student-2",
      first_name: "Bob",
      last_name: "Dupont",
      birth_date: "2012-08-20",
      registration_type: "child",
      level: "débutant",
      notes: "",
      enrollments: mockEnrollments.slice(2, 3), // 1 cours
    },
  ],
  payments: mockPayments,
};

describe("filterEnrollmentsBySchoolYear", () => {
  it("should filter by exact school_year_id when available", () => {
    const result = filterEnrollmentsBySchoolYear(mockEnrollments, "2024-2025", mockSchoolYears);

    expect(result).toHaveLength(3); // Les 3 premiers sont actifs avec school_year_id 2024-2025
    expect(result.map(e => e.id)).toEqual(["enroll-1", "enroll-2", "enroll-3"]);
  });

  it("should filter out inactive enrollments", () => {
    const result = filterEnrollmentsBySchoolYear(mockEnrollments, "2024-2025", mockSchoolYears);

    expect(result.every(e => e.status === "active")).toBe(true);
  });

  it("should return active enrollments when no school year specified", () => {
    const result = filterEnrollmentsBySchoolYear(mockEnrollments, null, mockSchoolYears);

    expect(result).toHaveLength(3);
    expect(result.every(e => e.status === "active")).toBe(true);
  });

  it("should return empty array for unknown school year", () => {
    const result = filterEnrollmentsBySchoolYear(mockEnrollments, "unknown-year", mockSchoolYears);

    expect(result).toHaveLength(0);
  });

  it("should handle fallback date logic for enrollments without school_year_id", () => {
    const enrollmentsWithoutYear = [
      {
        id: "enroll-no-year",
        status: "active",
        start_date: "2024-10-01", // Octobre 2024 = année scolaire 2024-2025
        courses: { price: "350" },
      },
      {
        id: "enroll-no-year-2",
        status: "active",
        start_date: "2024-02-01", // Février 2024 = année scolaire 2023-2024
        courses: { price: "350" },
      },
    ];

    const result2024 = filterEnrollmentsBySchoolYear(
      enrollmentsWithoutYear as any,
      "2024-2025",
      mockSchoolYears
    );
    expect(result2024).toHaveLength(1);
    expect(result2024[0].id).toBe("enroll-no-year");

    const result2023 = filterEnrollmentsBySchoolYear(
      enrollmentsWithoutYear as any,
      "2023-2024",
      mockSchoolYears
    );
    expect(result2023).toHaveLength(1);
    expect(result2023[0].id).toBe("enroll-no-year-2");
  });
});

describe("calculateFamilyTotal", () => {
  const discountSettings: DiscountSettings = {
    startAt: 3,
    step: 50,
    mode: "fixed",
  };

  it("should calculate total without discount for fewer than startAt courses", () => {
    const familyWithTwoCourses = {
      ...mockFamily,
      students: [
        {
          ...mockFamily.students[0],
          enrollments: mockEnrollments.slice(0, 2), // 2 cours à 350€ chacun
        },
      ],
    };

    const total = calculateFamilyTotal(
      familyWithTwoCourses,
      "2024-2025",
      mockSchoolYears,
      discountSettings
    );

    expect(total).toBe(700); // 2 * 350€, pas de dégressivité
  });

  it("should apply fixed discount from startAt course", () => {
    const total = calculateFamilyTotal(mockFamily, "2024-2025", mockSchoolYears, discountSettings);

    // mockFamily a 3 cours actifs: 2 pour student-1 + 1 pour student-2
    // Avec startAt=3, step=50, mode=fixed:
    // Cours 1: 350€ (prix plein)
    // Cours 2: 350€ (prix plein)
    // Cours 3: 350 - 50 = 300€ (réduction fixe)
    // Total: 350 + 350 + 300 = 1000€
    expect(total).toBe(1000);
  });

  it("should apply cumulative discount correctly", () => {
    const cumulativeSettings: DiscountSettings = {
      startAt: 2,
      step: 30,
      mode: "cumulative",
    };

    const total = calculateFamilyTotal(
      mockFamily,
      "2024-2025",
      mockSchoolYears,
      cumulativeSettings
    );

    // 3 cours avec dégressivité cumulative à partir du 2e:
    // Cours 1: 350€ (prix plein)
    // Cours 2: 350 - 30 = 320€ (1ère réduction)
    // Cours 3: 350 - 60 = 290€ (2e réduction)
    expect(total).toBe(960);
  });

  it("should handle zero or negative prices after discount", () => {
    const highDiscountSettings: DiscountSettings = {
      startAt: 2,
      step: 400,
      mode: "fixed",
    };

    const total = calculateFamilyTotal(
      mockFamily,
      "2024-2025",
      mockSchoolYears,
      highDiscountSettings
    );

    // 3 cours: 350 + max(0, 350-400) + max(0, 350-400) = 350€
    expect(total).toBe(350);
  });

  it("should handle enrollments with string prices", () => {
    const familyWithStringPrices = {
      ...mockFamily,
      students: [
        {
          ...mockFamily.students[0],
          enrollments: [
            {
              ...mockEnrollments[0],
              courses: { ...mockEnrollments[0].courses, price: "300.50" },
            },
            {
              ...mockEnrollments[1],
              courses: { ...mockEnrollments[1].courses, price: "400" },
            },
          ],
        },
      ],
    };

    const total = calculateFamilyTotal(
      familyWithStringPrices,
      "2024-2025",
      mockSchoolYears,
      discountSettings
    );

    expect(total).toBe(700.5); // 300.50 + 400, pas de dégressivité (seulement 2 cours)
  });

  it("should handle missing or invalid prices", () => {
    const familyWithMissingPrices = {
      ...mockFamily,
      students: [
        {
          ...mockFamily.students[0],
          enrollments: [
            {
              ...mockEnrollments[0],
              courses: { ...mockEnrollments[0].courses, price: null },
            },
            {
              ...mockEnrollments[1],
              courses: null,
            },
          ],
        },
      ],
    };

    const total = calculateFamilyTotal(
      familyWithMissingPrices,
      "2024-2025",
      mockSchoolYears,
      discountSettings
    );

    expect(total).toBe(0); // Prices invalides = 0
  });
});

describe("calculatePaidAmount", () => {
  it("should calculate total paid for specific school year", () => {
    const paid = calculatePaidAmount(mockFamily, "2024-2025", mockSchoolYears);

    // Payment 1: 100€ cash
    // Payment 2: 200€ card + (2 * 150€ cheques) - 25€ refund = 200 + 300 - 25 = 475€
    // Total: 100 + 475 = 575€
    expect(paid).toBe(575);
  });

  it("should calculate total paid for different school year", () => {
    const paid = calculatePaidAmount(mockFamily, "2023-2024", mockSchoolYears);

    // Payment 3: 50€ cash + 100€ transfer = 150€
    expect(paid).toBe(150);
  });

  it("should handle string format cheques", () => {
    const familyWithStringCheques = {
      ...mockFamily,
      payments: [
        {
          ...mockPayments[0],
          cheques: '[{"count": 3, "amount": 100}]', // String JSON format
        },
      ],
    };

    const paid = calculatePaidAmount(familyWithStringCheques, "2024-2025", mockSchoolYears);

    // 100€ cash + (3 * 100€ cheques) = 400€
    expect(paid).toBe(400);
  });

  it("should handle malformed cheques JSON", () => {
    const familyWithMalformedCheques = {
      ...mockFamily,
      payments: [
        {
          ...mockPayments[0],
          cheques: "invalid-json", // JSON invalide
        },
      ],
    };

    expect(() => {
      calculatePaidAmount(familyWithMalformedCheques, "2024-2025", mockSchoolYears);
    }).toThrow();
  });

  it("should handle null or undefined cheques", () => {
    const familyWithNullCheques = {
      ...mockFamily,
      payments: [
        {
          ...mockPayments[0],
          cheques: undefined,
        },
        {
          ...mockPayments[0],
          cheques: undefined,
        },
      ],
    };

    const paid = calculatePaidAmount(familyWithNullCheques, "2024-2025", mockSchoolYears);

    // 2 * 100€ cash = 200€
    expect(paid).toBe(200);
  });

  it("should calculate all payments when no school year specified", () => {
    const paid = calculatePaidAmount(mockFamily, null, mockSchoolYears);

    // Tous les paiements:
    // Payment 1: 100€
    // Payment 2: 200 + 300 - 25 = 475€
    // Payment 3: 50 + 100 = 150€
    // Total: 725€
    expect(paid).toBe(725);
  });

  it("should handle payments without school_year_id using date fallback", () => {
    const familyWithDateFallback = {
      ...mockFamily,
      payments: [
        {
          id: "payment-no-year",
          amount_cash: 100,
          amount_card: 0,
          amount_transfer: 0,
          refund_amount: 0,
          cheques: [],
          school_year_id: null, // Pas d'année définie
          created_at: "2024-10-15T10:00:00Z", // Date dans l'année 2024-2025
        },
      ],
    };

    const paid = calculatePaidAmount(familyWithDateFallback, "2024-2025", mockSchoolYears);

    expect(paid).toBe(100);
  });

  it("should include recent payments even if date doesn't match", () => {
    const now = new Date();
    const recentDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 jours ago

    const familyWithRecentPayment = {
      ...mockFamily,
      payments: [
        {
          id: "recent-payment",
          amount_cash: 100,
          amount_card: 0,
          amount_transfer: 0,
          refund_amount: 0,
          cheques: [],
          school_year_id: null,
          created_at: recentDate.toISOString(),
        },
      ],
    };

    const paid = calculatePaidAmount(familyWithRecentPayment, "2024-2025", mockSchoolYears);

    expect(paid).toBe(100); // Inclus car récent
  });
});

describe("filterPaymentsBySchoolYear", () => {
  it("should filter payments by school_year_id when available", () => {
    const filtered = filterPaymentsBySchoolYear(mockPayments, mockSchoolYears[0]);

    expect(filtered).toHaveLength(2);
    expect(filtered.map(p => p.id)).toEqual(["payment-1", "payment-2"]);
  });

  it("should filter payments by date when school_year_id not available", () => {
    // Utiliser des dates plus anciennes pour éviter la logique "recent payments"
    const paymentsWithoutYear = [
      {
        id: "payment-no-year-1",
        amount_cash: 100,
        amount_card: 0,
        amount_transfer: 0,
        refund_amount: 0,
        cheques: [],
        school_year_id: null,
        created_at: "2024-03-15T10:00:00Z", // 2024 année scolaire 2023-2024 (end year)
      },
      {
        id: "payment-no-year-2",
        amount_cash: 50,
        amount_card: 0,
        amount_transfer: 0,
        refund_amount: 0,
        cheques: [],
        school_year_id: null,
        created_at: "2022-11-15T10:00:00Z", // 2022 année scolaire 2022-2023 (plus ancien)
      },
    ];

    // Filtrer avec 2024-2025 devrait inclure le paiement de mars 2024
    const filtered2024 = filterPaymentsBySchoolYear(paymentsWithoutYear, mockSchoolYears[0]); // 2024-2025
    expect(filtered2024).toHaveLength(1);
    expect(filtered2024[0].id).toBe("payment-no-year-1");

    // Filtrer avec 2023-2024 devrait inclure le paiement de mars 2024 aussi (car dans la plage)
    const filtered2023 = filterPaymentsBySchoolYear(paymentsWithoutYear, mockSchoolYears[1]); // 2023-2024
    expect(filtered2023).toHaveLength(1);
    expect(filtered2023[0].id).toBe("payment-no-year-1");
  });

  it("should include recent payments regardless of date logic", () => {
    const now = new Date();
    const recentDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 jours ago

    const paymentsWithRecent = [
      {
        ...mockPayments[0],
        school_year_id: null,
        created_at: recentDate.toISOString(), // Récent
      },
    ];

    const filtered = filterPaymentsBySchoolYear(paymentsWithRecent, mockSchoolYears[0]);

    expect(filtered).toHaveLength(1); // Inclus car récent
  });

  it("should return all payments when no school year provided", () => {
    const filtered = filterPaymentsBySchoolYear(mockPayments, null as any);

    expect(filtered).toEqual(mockPayments);
  });
});

describe("Payment calculations edge cases", () => {
  it("should handle family with no students", () => {
    const emptyFamily = {
      ...mockFamily,
      students: [],
    };

    const total = calculateFamilyTotal(emptyFamily, "2024-2025", mockSchoolYears, {
      startAt: 3,
      step: 50,
      mode: "fixed",
    });

    expect(total).toBe(0);
  });

  it("should handle family with no payments", () => {
    const familyNoPay = {
      ...mockFamily,
      payments: [],
    };

    const paid = calculatePaidAmount(familyNoPay, "2024-2025", mockSchoolYears);

    expect(paid).toBe(0);
  });

  it("should handle negative refund amounts", () => {
    const familyNegativeRefund = {
      ...mockFamily,
      payments: [
        {
          ...mockPayments[0],
          refund_amount: -50, // Refund négatif (erreur de saisie)
        },
      ],
    };

    const paid = calculatePaidAmount(familyNegativeRefund, "2024-2025", mockSchoolYears);

    // 100€ cash - (-50€) refund = 150€
    expect(paid).toBe(150);
  });

  it("should handle very large numbers", () => {
    const familyLargeAmount = {
      ...mockFamily,
      payments: [
        {
          ...mockPayments[0],
          amount_cash: 999999,
        },
      ],
    };

    const paid = calculatePaidAmount(familyLargeAmount, "2024-2025", mockSchoolYears);

    expect(paid).toBe(999999);
  });
});
