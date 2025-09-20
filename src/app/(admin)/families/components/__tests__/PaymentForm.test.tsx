import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import PaymentForm from "../PaymentForm";

// Mock useToast
const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock Supabase
vi.mock("@/lib/supabase", () => {
  const mockSupabase = {
    from: vi.fn(() => mockSupabase),
    insert: vi.fn(),
  };
  return {
    default: mockSupabase,
  };
});

const mockFamily = {
  id: "family-123",
  first_name: "Jean",
  last_name: "Dupont",
  email: "jean.dupont@email.com",
  phone: "0123456789",
  address: "123 rue Test",
  postal_code: "75001",
  city: "Paris",
  students: [],
  payments: [],
};

const defaultProps = {
  family: mockFamily,
  currentSchoolYear: "2024-2025",
  onPaymentSaved: vi.fn(),
  onCancel: vi.fn(),
};

describe("PaymentForm - Tests essentiels", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { default: supabase } = await import("@/lib/supabase");
    mockSupabase = supabase;
    mockSupabase.insert.mockResolvedValue({ error: null });
  });

  describe("Validation des montants", () => {
    it("should show error when no payment amount is entered", async () => {
      const user = userEvent.setup();
      render(<PaymentForm {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: "Enregistrer le paiement" }));

      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Montant requis",
        description: "Veuillez saisir un montant à payer.",
      });
    });

    it("should allow payment with cash amount", async () => {
      const user = userEvent.setup();
      render(<PaymentForm {...defaultProps} />);

      const cashInput = screen.getByLabelText("Espèces (€)");
      await user.clear(cashInput);
      await user.type(cashInput, "100");

      await user.click(screen.getByRole("button", { name: "Enregistrer le paiement" }));

      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          family_id: "family-123",
          amount_cash: 100,
          amount_card: 0,
          amount_transfer: 0,
        })
      );
    });
  });

  describe("Gestion des années scolaires", () => {
    it("should include school_year_id when provided", async () => {
      const user = userEvent.setup();
      render(<PaymentForm {...defaultProps} />);

      const cashInput = screen.getByLabelText("Espèces (€)");
      await user.clear(cashInput);
      await user.type(cashInput, "100");

      await user.click(screen.getByRole("button", { name: "Enregistrer le paiement" }));

      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          school_year_id: "2024-2025",
        })
      );
    });
  });

  describe("Actions utilisateur", () => {
    it("should call onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(<PaymentForm {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: "Annuler" }));

      expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it("should call onPaymentSaved after successful payment", async () => {
      const user = userEvent.setup();
      render(<PaymentForm {...defaultProps} />);

      const cashInput = screen.getByLabelText("Espèces (€)");
      await user.clear(cashInput);
      await user.type(cashInput, "100");

      await user.click(screen.getByRole("button", { name: "Enregistrer le paiement" }));

      await waitFor(() => {
        expect(defaultProps.onPaymentSaved).toHaveBeenCalled();
      });
    });
  });
});
