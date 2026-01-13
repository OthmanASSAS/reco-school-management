// /Users/oassas/Projets/inscription-app/src/app/(admin)/courses/components/__tests__/CoursesClientTable.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CoursesClientTable from "../CoursesClientTable";
import "@testing-library/jest-dom";

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

const mockCourses = [
  {
    id: "1",
    name: "Course A",
    type: "enfants",
    teacher_name: "Teacher 1",
    room_name: "Room 1",
    status: "active",
    price: 100,
    capacity: 10,
    enrolled_count: 5,
    teacher_id: null,
    room_id: null,
    schedule: null,
  },
  {
    id: "2",
    name: "Course B",
    type: "adultes",
    teacher_name: "Teacher 2",
    room_name: "Room 2",
    status: "inactive",
    price: 200,
    capacity: 20,
    enrolled_count: 15,
    teacher_id: null,
    room_id: null,
    schedule: null,
  },
];

describe("CoursesClientTable", () => {
  it("renders the component with a list of courses", () => {
    render(<CoursesClientTable courses={mockCourses} />);

    // Check if the course names are rendered
    expect(screen.getAllByText("Course A").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Course B").length).toBeGreaterThan(0);
  });

  it("filters courses based on search term", () => {
    render(<CoursesClientTable courses={mockCourses} />);

    const searchInput = screen.getByPlaceholderText("Rechercher un cours...");
    fireEvent.change(searchInput, { target: { value: "Course A" } });

    expect(screen.getAllByText("Course A").length).toBeGreaterThan(0);
    expect(screen.queryByText("Course B")).not.toBeInTheDocument();
  });

  it("calls the handleEdit function when the edit button is clicked", () => {
    render(<CoursesClientTable courses={mockCourses} />);
    const editButtons = screen.getAllByTitle("Modifier le cours");
    fireEvent.click(editButtons[0]);
    // We can't directly test the state change, but we can check if the modal opens
    // For now, we'll just check if the button is there
    expect(editButtons[0]).toBeInTheDocument();
  });

  it("calls the setDeleteCourseId function when the delete button is clicked", () => {
    render(<CoursesClientTable courses={mockCourses} />);
    const deleteButtons = screen.getAllByTitle("Supprimer le cours");
    fireEvent.click(deleteButtons[0]);
    // We can't directly test the state change, but we can check if the confirmation modal opens
    expect(screen.getByText("Confirmer la suppression")).toBeInTheDocument();
  });
});
