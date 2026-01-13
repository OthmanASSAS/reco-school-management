import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CompactClassesOverview from "../CompactClassesOverview";
import "@testing-library/jest-dom";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("CompactClassesOverview", () => {
  const mockCourses = [
    {
      id: "1",
      name: "Arabe Débutant",
      type: "enfants",
      capacity: 20,
      enrolled_count: 15,
    },
    {
      id: "2",
      name: "Français Avancé",
      type: "adultes",
      capacity: 15,
      enrolled_count: 15,
    },
    {
      id: "3",
      name: "Mathématiques",
      type: "enfants",
      capacity: 25,
      enrolled_count: 10,
    },
  ];

  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders header with correct course count", () => {
    render(<CompactClassesOverview courses={mockCourses} />);

    expect(screen.getByText("Classes (3)")).toBeInTheDocument();
  });

  it("displays average occupancy badge", () => {
    render(<CompactClassesOverview courses={mockCourses} />);

    // Total: 60 capacity, 40 enrolled = 67% average
    expect(screen.getByText("67%")).toBeInTheDocument();
  });

  it("renders all course cards", () => {
    render(<CompactClassesOverview courses={mockCourses} />);

    expect(screen.getByText("Arabe Débutant")).toBeInTheDocument();
    expect(screen.getByText("Français Avancé")).toBeInTheDocument();
    expect(screen.getByText("Mathématiques")).toBeInTheDocument();
  });

  it('navigates to courses page when "voir tout" is clicked', () => {
    render(<CompactClassesOverview courses={mockCourses} />);

    const viewAllButton = screen.getByRole("button");
    fireEvent.click(viewAllButton);

    expect(mockPush).toHaveBeenCalledWith("/courses");
  });

  it("navigates to specific course when card is clicked", () => {
    render(<CompactClassesOverview courses={mockCourses} />);

    const arabeCard = screen.getByText("Arabe Débutant").closest("div");
    fireEvent.click(arabeCard!);

    expect(mockPush).toHaveBeenCalledWith("/courses/1");
  });

  it("displays correct stats in summary", () => {
    render(<CompactClassesOverview courses={mockCourses} />);

    // Available (< 75%): Mathématiques (40%)
    expect(screen.getByText("Libres").previousElementSibling).toHaveTextContent("1");

    // Almost full (>= 75% and < 100%): Arabe Débutant (75%)
    expect(screen.getByText("Presque").previousElementSibling).toHaveTextContent("1");

    // Full (>= 100%): Français Avancé (100%)
    expect(screen.getByText("Pleines").previousElementSibling).toHaveTextContent("1");

    // Total enrolled: 40
    expect(screen.getByText("Total").previousElementSibling).toHaveTextContent("40");
  });

  it("shows empty state when no courses", () => {
    render(<CompactClassesOverview courses={[]} />);

    expect(screen.getByText("Aucune classe")).toBeInTheDocument();
    expect(screen.getByText("Classes (0)")).toBeInTheDocument();
  });

  it("handles zero capacity courses gracefully", () => {
    const coursesWithZeroCapacity = [
      {
        id: "1",
        name: "Test Course",
        type: "enfants",
        capacity: 0,
        enrolled_count: 0,
      },
    ];

    render(<CompactClassesOverview courses={coursesWithZeroCapacity} />);

    // Should not crash and display the course
    expect(screen.getByText("Test Course")).toBeInTheDocument();
  });

  it("has responsive grid classes", () => {
    render(<CompactClassesOverview courses={mockCourses} />);

    const grid = document.querySelector(".grid");
    expect(grid).toHaveClass("grid-cols-2", "sm:grid-cols-3", "md:grid-cols-4", "lg:grid-cols-6");
  });
});
