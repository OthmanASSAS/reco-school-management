import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import NewCourseModal from "../NewCourseModal";
import "@testing-library/jest-dom";

window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock the useRouter hook
const mockRouter = {
  refresh: vi.fn(),
  push: vi.fn(),
};
vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

// Mock the useToast hook
const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

vi.mock("@/lib/supabase", () => ({
  default: {
    from: vi.fn((table: string) => {
      if (table === "teachers") {
        return {
          select: vi
            .fn()
            .mockResolvedValue({ data: [{ id: "1", full_name: "Teacher 1" }], error: null }),
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      if (table === "rooms") {
        return {
          select: vi.fn().mockResolvedValue({ data: [{ id: "1", name: "Room 1" }], error: null }),
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
    }),
  },
}));

describe("NewCourseModal", () => {
  it("renders the modal and form elements correctly", async () => {
    const onCourseCreated = vi.fn();
    render(<NewCourseModal onCourseCreated={onCourseCreated} />);

    // Open the modal
    fireEvent.click(screen.getByText("Nouveau cours"));

    // Check if modal content is displayed
    expect(screen.getByText("Créer un nouveau cours")).toBeInTheDocument();
    expect(screen.getByLabelText("Nom du cours *")).toBeInTheDocument();
    expect(screen.getByText("Type *")).toBeInTheDocument();
    expect(screen.getByText("Professeur *")).toBeInTheDocument();
    expect(screen.getByText("Salle *")).toBeInTheDocument();
    expect(screen.getByLabelText("Prix (€) *")).toBeInTheDocument();
    expect(screen.getByLabelText("Capacité *")).toBeInTheDocument();

    // Fill in required form fields
    fireEvent.change(screen.getByLabelText("Nom du cours *"), { target: { value: "Test Course" } });
    fireEvent.change(screen.getByLabelText("Prix (€) *"), { target: { value: "100" } });
    fireEvent.change(screen.getByLabelText("Capacité *"), { target: { value: "20" } });

    expect(screen.getByDisplayValue("Test Course")).toBeInTheDocument();
    expect(screen.getByDisplayValue("100")).toBeInTheDocument();
    expect(screen.getByDisplayValue("20")).toBeInTheDocument();
  });
});
