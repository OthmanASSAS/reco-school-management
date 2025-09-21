import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CompactClassCard from "../CompactClassCard";
import "@testing-library/jest-dom";

describe("CompactClassCard", () => {
  const mockCourse = {
    id: "1",
    name: "Arabe Débutant",
    type: "enfants",
    capacity: 20,
    enrolled_count: 15,
  };

  it("renders course information correctly", () => {
    render(<CompactClassCard course={mockCourse} />);

    expect(screen.getByText("Arabe Débutant")).toBeInTheDocument();
    expect(screen.getByText("E")).toBeInTheDocument(); // Enfants = E
    expect(screen.getByText("15/20")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("renders adult course type correctly", () => {
    const adultCourse = { ...mockCourse, type: "adultes" };
    render(<CompactClassCard course={adultCourse} />);

    expect(screen.getByText("A")).toBeInTheDocument(); // Adultes = A
  });

  it("shows correct styling when course is complete", () => {
    const fullCourse = { ...mockCourse, enrolled_count: 20 };
    render(<CompactClassCard course={fullCourse} />);

    // Should show 100% and correct ratio for complete course
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("20/20")).toBeInTheDocument();

    // Check that border color shows red for complete course
    const card = screen.getByText("Arabe Débutant").closest("div")?.parentElement;
    expect(card).toHaveClass("border-red-500");
  });

  it("calculates occupancy percentage correctly", () => {
    const halfFullCourse = { ...mockCourse, enrolled_count: 10 };
    render(<CompactClassCard course={halfFullCourse} />);

    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("applies correct status color for different occupancy levels", () => {
    // Test high occupancy (red)
    const fullCourse = { ...mockCourse, enrolled_count: 20 };
    const { rerender } = render(<CompactClassCard course={fullCourse} />);

    let cardElement = document.querySelector(".border-red-500");
    expect(cardElement).toBeInTheDocument();

    // Test medium occupancy (orange)
    const almostFullCourse = { ...mockCourse, enrolled_count: 18 };
    rerender(<CompactClassCard course={almostFullCourse} />);

    cardElement = document.querySelector(".border-orange-500");
    expect(cardElement).toBeInTheDocument();

    // Test low occupancy (green)
    const lowCourse = { ...mockCourse, enrolled_count: 5 };
    rerender(<CompactClassCard course={lowCourse} />);

    cardElement = document.querySelector(".border-green-500");
    expect(cardElement).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", () => {
    const mockOnClick = vi.fn();
    render(<CompactClassCard course={mockCourse} onClick={mockOnClick} />);

    const card = screen.getByText("Arabe Débutant").closest("div");
    fireEvent.click(card!);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("has hover effects", () => {
    render(<CompactClassCard course={mockCourse} />);

    // Get the outermost card div
    const card = screen.getByText("Arabe Débutant").closest("div")?.parentElement;
    expect(card).toHaveClass("hover:shadow-sm", "cursor-pointer", "transition-all");
  });
});
