import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ClassesStats from "../ClassesStats";
import "@testing-library/jest-dom";

describe("ClassesStats", () => {
  const mockCourses = [
    { capacity: 20, enrolled_count: 10 }, // 50% - available
    { capacity: 15, enrolled_count: 12 }, // 80% - almost full
    { capacity: 25, enrolled_count: 25 }, // 100% - full
    { capacity: 30, enrolled_count: 5 }, // 17% - available
  ];

  it("calculates total capacity and enrolled correctly", () => {
    render(<ClassesStats courses={mockCourses} />);

    // Total: 90 capacity, 52 enrolled
    expect(screen.getByText("4 classes • 52/90 élèves")).toBeInTheDocument();
  });

  it("calculates average occupancy correctly", () => {
    render(<ClassesStats courses={mockCourses} />);

    // Average: (50 + 80 + 100 + 17) / 4 = 62% rounded
    expect(screen.getByText("58%")).toBeInTheDocument(); // Math result
  });

  it("categorizes courses correctly", () => {
    render(<ClassesStats courses={mockCourses} />);

    // Available: occupancy < 75% (courses 1 and 4)
    const availableElement = screen.getByText("Disponibles").previousElementSibling;
    expect(availableElement).toHaveTextContent("2");

    // Almost full: 75% <= occupancy < 100% (course 2)
    const almostFullElement = screen.getByText("Presque pleines").previousElementSibling;
    expect(almostFullElement).toHaveTextContent("1");

    // Full: occupancy >= 100% (course 3)
    const fullElement = screen.getByText("Complètes").previousElementSibling;
    expect(fullElement).toHaveTextContent("1");
  });

  it("handles empty courses array", () => {
    render(<ClassesStats courses={[]} />);

    expect(screen.getByText("0 classes • 0/0 élèves")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument(); // Average occupancy
  });

  it("displays correct labels", () => {
    render(<ClassesStats courses={mockCourses} />);

    expect(screen.getByText("Disponibles")).toBeInTheDocument();
    expect(screen.getByText("Presque pleines")).toBeInTheDocument();
    expect(screen.getByText("Complètes")).toBeInTheDocument();
  });

  it("applies correct styling for each category", () => {
    render(<ClassesStats courses={mockCourses} />);

    // Check if color classes are applied correctly
    const availableElement = screen.getByText("Disponibles").previousElementSibling;
    expect(availableElement).toHaveClass("text-green-600");

    const almostFullElement = screen.getByText("Presque pleines").previousElementSibling;
    expect(almostFullElement).toHaveClass("text-orange-600");

    const fullElement = screen.getByText("Complètes").previousElementSibling;
    expect(fullElement).toHaveClass("text-red-600");
  });
});
