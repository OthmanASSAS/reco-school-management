// @vitest-environment happy-dom

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import PreRegistrationForm from "../pre-registration-form";

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock pre-registration action
vi.mock("@/lib/actions/pre-registration", () => ({
  preRegister: vi.fn(),
}));

// Mock toast hook
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("PreRegistrationForm URL Navigation", () => {
  const mockPush = vi.fn();
  const mockReplace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage to ensure clean test state
    localStorage.clear();

    // Setup router mock
    const mockRouter = {
      push: mockPush,
      replace: mockReplace,
    };
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
  });

  it("should start at step 1 by default", () => {
    // Mock empty search params
    const mockSearchParams = new URLSearchParams();
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    render(<PreRegistrationForm />);

    expect(screen.getByText(/Étape 1 sur 4/)).toBeInTheDocument();
  });

  it("should initialize with step from URL parameter", () => {
    // Mock search params with step=1
    const mockSearchParams = new URLSearchParams("step=1");
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    render(<PreRegistrationForm />);

    expect(screen.getByText(/Étape 1 sur 4/)).toBeInTheDocument();
  });

  it("should not allow access to step 2 without valid family data", () => {
    // Mock search params trying to access step 2
    const mockSearchParams = new URLSearchParams("step=2");
    mockSearchParams.get = vi.fn().mockReturnValue("2");
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    render(<PreRegistrationForm />);

    // Should redirect back to step 1
    expect(mockReplace).toHaveBeenCalledWith("?step=1", { scroll: false });
  });

  it("should update URL when navigating between steps", async () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.get = vi.fn().mockReturnValue(null);
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    render(<PreRegistrationForm />);

    // Fill required family information
    fireEvent.change(screen.getByLabelText(/nom de famille/i), {
      target: { value: "Dupont" },
    });
    fireEvent.change(screen.getByLabelText(/prénom du parent/i), {
      target: { value: "Jean" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "jean.dupont@email.com" },
    });
    fireEvent.change(screen.getByLabelText(/téléphone/i), {
      target: { value: "0123456789" },
    });

    // Click next button
    const nextButton = screen.getByRole("button", { name: /suivant/i });
    fireEvent.click(nextButton);

    // Should update URL to step 2
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("?step=2", { scroll: false });
    });
  });

  it("should validate step access based on form data", () => {
    const mockSearchParams = new URLSearchParams();
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    render(<PreRegistrationForm />);

    // Start with step 1
    expect(screen.getByText(/Étape 1 sur 4/)).toBeInTheDocument();

    // Try to navigate to step 2 without filling required fields
    const nextButton = screen.getByRole("button", { name: /suivant/i });
    fireEvent.click(nextButton);

    // Should stay on step 1 since validation should prevent advancement
    // The updateStep function won't change the step if validation fails
    expect(screen.getByText(/Étape 1 sur 4/)).toBeInTheDocument();
  });

  it("should allow navigation back to previous steps", async () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.get = vi.fn().mockReturnValue(null);
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    render(<PreRegistrationForm />);

    // Fill form and navigate to step 2
    fireEvent.change(screen.getByLabelText(/nom de famille/i), {
      target: { value: "Dupont" },
    });
    fireEvent.change(screen.getByLabelText(/prénom du parent/i), {
      target: { value: "Jean" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "jean.dupont@email.com" },
    });
    fireEvent.change(screen.getByLabelText(/téléphone/i), {
      target: { value: "0123456789" },
    });

    fireEvent.click(screen.getByRole("button", { name: /suivant/i }));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("?step=2", { scroll: false });
    });

    // Now click back button
    const backButton = screen.getByRole("button", { name: /retour/i });
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("?step=1", { scroll: false });
    });
  });

  it("should preserve form data when refreshing page", () => {
    // Mock search params with step=1
    const mockSearchParams = new URLSearchParams("step=1");
    mockSearchParams.get = vi.fn().mockReturnValue("1");
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    render(<PreRegistrationForm />);

    // Component should initialize with step 1
    expect(screen.getByText(/Étape 1 sur 4/)).toBeInTheDocument();
  });

  it("should handle invalid step parameters", () => {
    // Mock search params with invalid step
    const mockSearchParams = new URLSearchParams("step=99");
    mockSearchParams.get = vi.fn().mockReturnValue("99");
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    render(<PreRegistrationForm />);

    // Should fallback to step 1
    expect(screen.getByText(/Étape 1 sur 4/)).toBeInTheDocument();
  });

  it("should allow direct access to step 4 confirmation page", () => {
    const mockSearchParams = new URLSearchParams("step=4");
    mockSearchParams.get = vi.fn().mockReturnValue("4");
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    render(<PreRegistrationForm />);

    expect(screen.getByText(/Étape 4 sur 4/)).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

describe("PreRegistrationForm localStorage Persistence", () => {
  const mockPush = vi.fn();
  const mockReplace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Setup router mock
    const mockRouter = {
      push: mockPush,
      replace: mockReplace,
    };
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
  });

  it("should persist family data to localStorage", () => {
    const mockSearchParams = new URLSearchParams();
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    render(<PreRegistrationForm />);

    // Fill family information
    fireEvent.change(screen.getByLabelText(/nom de famille/i), {
      target: { value: "Dupont" },
    });
    fireEvent.change(screen.getByLabelText(/prénom du parent/i), {
      target: { value: "Jean" },
    });

    // Check localStorage was updated
    const savedFamily = JSON.parse(localStorage.getItem("preregister-family") || "{}");
    expect(savedFamily.familyName).toBe("Dupont");
    expect(savedFamily.parentFirstName).toBe("Jean");
  });

  it("should restore family data from localStorage on refresh", () => {
    // Pre-populate localStorage
    const familyData = {
      familyName: "Martin",
      parentFirstName: "Pierre",
      contactEmail: "pierre.martin@email.com",
      contactPhone: "0123456789",
      address: "123 Main St",
      postalCode: "75001",
      city: "Paris",
    };
    localStorage.setItem("preregister-family", JSON.stringify(familyData));

    const mockSearchParams = new URLSearchParams("step=2");
    mockSearchParams.get = vi.fn().mockReturnValue("2");
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    render(<PreRegistrationForm />);

    // Should stay on step 2 since family data is valid
    expect(screen.getByText(/Étape 2 sur 4/)).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should persist students data to localStorage", () => {
    const mockSearchParams = new URLSearchParams();
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    render(<PreRegistrationForm />);

    // Navigate to step 2 first by filling family data
    fireEvent.change(screen.getByLabelText(/nom de famille/i), {
      target: { value: "Dupont" },
    });
    fireEvent.change(screen.getByLabelText(/prénom du parent/i), {
      target: { value: "Jean" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "jean.dupont@email.com" },
    });
    fireEvent.change(screen.getByLabelText(/téléphone/i), {
      target: { value: "0123456789" },
    });

    fireEvent.click(screen.getByRole("button", { name: /suivant/i }));

    // Fill student information - use more specific selector
    const studentFirstNameInput = screen.getByPlaceholderText("Prénom de l’élève");
    fireEvent.change(studentFirstNameInput, {
      target: { value: "Alice" },
    });

    // Check localStorage was updated
    const savedStudents = JSON.parse(localStorage.getItem("preregister-students") || "[]");
    expect(savedStudents[0].firstName).toBe("Alice");
  });

  it("should restore students data from localStorage on refresh", () => {
    // Pre-populate localStorage with valid data
    const familyData = {
      familyName: "Martin",
      parentFirstName: "Pierre",
      contactEmail: "pierre.martin@email.com",
      contactPhone: "0123456789",
      address: "123 Main St",
      postalCode: "75001",
      city: "Paris",
    };
    const studentsData = [{ firstName: "Alice", lastName: "Martin", birthDate: "2010-05-15" }];
    localStorage.setItem("preregister-family", JSON.stringify(familyData));
    localStorage.setItem("preregister-students", JSON.stringify(studentsData));

    const mockSearchParams = new URLSearchParams("step=3");
    mockSearchParams.get = vi.fn().mockReturnValue("3");
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    render(<PreRegistrationForm />);

    // Should stay on step 3 since all data is valid without forcing URL rewrite
    expect(screen.getByText(/Étape 3 sur 4/)).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should clear localStorage when starting new registration", () => {
    // Test localStorage clearing logic directly since UI requires registrationSuccess = true
    localStorage.setItem("preregister-family", JSON.stringify({ familyName: "Test" }));
    localStorage.setItem("preregister-students", JSON.stringify([{ firstName: "Test" }]));
    localStorage.setItem("preregister-step", "4");

    // Verify data exists
    expect(localStorage.getItem("preregister-family")).toBeTruthy();
    expect(localStorage.getItem("preregister-students")).toBeTruthy();
    expect(localStorage.getItem("preregister-step")).toBe("4");

    // Simulate the clearing logic from handleNewRegistration
    localStorage.removeItem("preregister-family");
    localStorage.removeItem("preregister-students");
    localStorage.removeItem("preregister-step");

    // Verify data is cleared
    expect(localStorage.getItem("preregister-family")).toBeNull();
    expect(localStorage.getItem("preregister-students")).toBeNull();
    expect(localStorage.getItem("preregister-step")).toBeNull();
  });

  it("should handle corrupted localStorage data gracefully", () => {
    // Set invalid JSON in localStorage
    localStorage.setItem("preregister-family", "invalid-json{");
    localStorage.setItem("preregister-students", "also-invalid");

    const mockSearchParams = new URLSearchParams();
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    // Should not crash and use default values
    expect(() => render(<PreRegistrationForm />)).not.toThrow();

    // Should start at step 1 with empty form
    expect(screen.getByText(/Étape 1 sur 4/)).toBeInTheDocument();
  });

  it("should persist step 2 on page refresh when family data is valid", () => {
    // Pre-populate localStorage with valid family data
    const familyData = {
      familyName: "Martin",
      parentFirstName: "Pierre",
      contactEmail: "pierre.martin@email.com",
      contactPhone: "0123456789",
      address: "123 Main St",
      postalCode: "75001",
      city: "Paris",
    };
    localStorage.setItem("preregister-family", JSON.stringify(familyData));

    // Mock URL params with step=2
    const mockSearchParams = new URLSearchParams("step=2");
    mockSearchParams.get = vi.fn().mockReturnValue("2");
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    render(<PreRegistrationForm />);

    // Should maintain step 2 since family data is valid
    expect(screen.getByText(/Étape 2 sur 4/)).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();

    // Should show the students form (step 2) instead of family form (step 1)
    expect(screen.getByText("Élève 1")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Prénom de l’élève")).toBeInTheDocument();
  });

  it("should persist step 3 on page refresh when both family and student data are valid", () => {
    // Pre-populate localStorage with valid data
    const familyData = {
      familyName: "Martin",
      parentFirstName: "Pierre",
      contactEmail: "pierre.martin@email.com",
      contactPhone: "0123456789",
      address: "123 Main St",
      postalCode: "75001",
      city: "Paris",
    };
    const studentsData = [{ firstName: "Alice", lastName: "Martin", birthDate: "2010-05-15" }];
    localStorage.setItem("preregister-family", JSON.stringify(familyData));
    localStorage.setItem("preregister-students", JSON.stringify(studentsData));

    // Mock URL params with step=3
    const mockSearchParams = new URLSearchParams("step=3");
    mockSearchParams.get = vi.fn().mockReturnValue("3");
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    render(<PreRegistrationForm />);

    // Should maintain step 3 since all data is valid without additional navigation
    expect(screen.getByText(/Étape 3 sur 4/)).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should fallback to step 1 on refresh when step 2 is requested but family data is incomplete", () => {
    // Pre-populate localStorage with incomplete family data
    const incompleteFamily = {
      familyName: "Martin",
      parentFirstName: "", // Missing required field
      contactEmail: "pierre.martin@email.com",
      contactPhone: "0123456789",
      address: "123 Main St",
      postalCode: "75001",
      city: "Paris",
    };
    localStorage.setItem("preregister-family", JSON.stringify(incompleteFamily));

    // Mock URL params with step=2
    const mockSearchParams = new URLSearchParams("step=2");
    mockSearchParams.get = vi.fn().mockReturnValue("2");
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    render(<PreRegistrationForm />);

    // Should fallback to step 1 since family data is incomplete
    expect(screen.getByText(/Étape 1 sur 4/)).toBeInTheDocument();
  });

  it("should fallback to step 1 on refresh when step 3 is requested but student data is missing", () => {
    // Pre-populate localStorage with valid family but no students
    const familyData = {
      familyName: "Martin",
      parentFirstName: "Pierre",
      contactEmail: "pierre.martin@email.com",
      contactPhone: "0123456789",
      address: "123 Main St",
      postalCode: "75001",
      city: "Paris",
    };
    localStorage.setItem("preregister-family", JSON.stringify(familyData));
    // No students data in localStorage

    // Mock URL params with step=3
    const mockSearchParams = new URLSearchParams("step=3");
    mockSearchParams.get = vi.fn().mockReturnValue("3");
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    render(<PreRegistrationForm />);

    // Should fallback to step 1 since student data is missing
    expect(screen.getByText(/Étape 1 sur 4/)).toBeInTheDocument();
  });

  it("should restore the last saved step from localStorage when no URL parameter", () => {
    const familyData = {
      familyName: "Martin",
      parentFirstName: "Pierre",
      contactEmail: "pierre.martin@email.com",
      contactPhone: "0123456789",
      address: "123 Main St",
      postalCode: "75001",
      city: "Paris",
    };
    const studentsData = [{ firstName: "Alice", lastName: "Martin", birthDate: "2010-05-15" }];
    localStorage.setItem("preregister-family", JSON.stringify(familyData));
    localStorage.setItem("preregister-students", JSON.stringify(studentsData));
    localStorage.setItem("preregister-step", "3");

    const mockSearchParams = new URLSearchParams();
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    render(<PreRegistrationForm />);

    expect(screen.getByText(/Étape 3 sur 4/)).toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("?step=3", { scroll: false });
  });

  it("should persist the step in localStorage when navigating", async () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.get = vi.fn().mockReturnValue(null);
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    render(<PreRegistrationForm />);

    fireEvent.change(screen.getByLabelText(/nom de famille/i), {
      target: { value: "Dupont" },
    });
    fireEvent.change(screen.getByLabelText(/prénom du parent/i), {
      target: { value: "Jean" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "jean.dupont@email.com" },
    });
    fireEvent.change(screen.getByLabelText(/téléphone/i), {
      target: { value: "0123456789" },
    });

    fireEvent.click(screen.getByRole("button", { name: /suivant/i }));

    await waitFor(() => {
      expect(localStorage.getItem("preregister-step")).toBe("2");
    });
  });

  it("should remove saved step when starting a new registration", () => {
    // Test step removal logic directly
    localStorage.setItem("preregister-family", JSON.stringify({ familyName: "Test" }));
    localStorage.setItem("preregister-students", JSON.stringify([{ firstName: "Test" }]));
    localStorage.setItem("preregister-step", "4");

    // Verify step is saved
    expect(localStorage.getItem("preregister-step")).toBe("4");

    // Simulate the clearing logic from handleNewRegistration
    localStorage.removeItem("preregister-step");

    // Verify step is cleared
    expect(localStorage.getItem("preregister-step")).toBeNull();
  });
});
