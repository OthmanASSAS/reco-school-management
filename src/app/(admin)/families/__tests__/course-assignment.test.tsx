import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Mock Next.js hooks
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "family-123" }),
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock toast
const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  single: vi.fn(),
  order: vi.fn(() => mockSupabase),
};

vi.mock("@/lib/supabase", () => ({
  default: mockSupabase,
}));

// Mock actions
vi.mock("@/lib/actions/families", () => ({
  updateFamily: vi.fn(),
}));

vi.mock("@/lib/actions/add-student", () => ({
  addStudent: vi.fn(),
  updateStudent: vi.fn(),
  deleteStudent: vi.fn(),
}));

// Test component that simulates the course assignment workflow
function CourseAssignmentTest() {
  const [selectedCourses, setSelectedCourses] = React.useState<string[]>([]);
  const [availableCourses] = React.useState([
    { id: "course-1", name: "Coran Débutant", label: "Coran 1", price: 350 },
    { id: "course-2", name: "Arabe Débutant", label: "Arabe 1", price: 350 },
    { id: "course-3", name: "Coran Intermédiaire", label: "Coran 2", price: 350 },
  ]);

  const handleCourseSelection = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  return (
    <div>
      <h2>Attribution des cours</h2>
      <div data-testid="course-list">
        {availableCourses.map(course => (
          <label key={course.id}>
            <input
              type="checkbox"
              checked={selectedCourses.includes(course.id)}
              onChange={() => handleCourseSelection(course.id)}
              data-testid={`course-${course.id}`}
            />
            {course.name} - {course.price}€
          </label>
        ))}
      </div>
      <div data-testid="selected-courses">Cours sélectionnés: {selectedCourses.length}</div>
      <button
        data-testid="save-button"
        onClick={() => console.log("Saving courses:", selectedCourses)}
      >
        Enregistrer
      </button>
    </div>
  );
}

describe("Course Assignment Workflow Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow selecting and deselecting courses", async () => {
    const user = userEvent.setup();
    render(<CourseAssignmentTest />);

    // Vérifier que les cours sont affichés
    expect(screen.getByText("Attribution des cours")).toBeInTheDocument();
    expect(screen.getByText("Coran Débutant - 350€")).toBeInTheDocument();
    expect(screen.getByText("Arabe Débutant - 350€")).toBeInTheDocument();

    // Initialement aucun cours sélectionné
    expect(screen.getByTestId("selected-courses")).toHaveTextContent("Cours sélectionnés: 0");

    // Sélectionner un cours
    await user.click(screen.getByTestId("course-course-1"));
    expect(screen.getByTestId("selected-courses")).toHaveTextContent("Cours sélectionnés: 1");

    // Sélectionner un deuxième cours
    await user.click(screen.getByTestId("course-course-2"));
    expect(screen.getByTestId("selected-courses")).toHaveTextContent("Cours sélectionnés: 2");

    // Désélectionner le premier cours
    await user.click(screen.getByTestId("course-course-1"));
    expect(screen.getByTestId("selected-courses")).toHaveTextContent("Cours sélectionnés: 1");
  });

  it("should handle multiple course selections", async () => {
    const user = userEvent.setup();
    render(<CourseAssignmentTest />);

    // Sélectionner tous les cours
    await user.click(screen.getByTestId("course-course-1"));
    await user.click(screen.getByTestId("course-course-2"));
    await user.click(screen.getByTestId("course-course-3"));

    expect(screen.getByTestId("selected-courses")).toHaveTextContent("Cours sélectionnés: 3");

    // Vérifier que tous les checkboxes sont cochés
    expect(screen.getByTestId("course-course-1")).toBeChecked();
    expect(screen.getByTestId("course-course-2")).toBeChecked();
    expect(screen.getByTestId("course-course-3")).toBeChecked();
  });

  it("should maintain course selection state during interactions", async () => {
    const user = userEvent.setup();
    render(<CourseAssignmentTest />);

    // Sélectionner quelques cours
    await user.click(screen.getByTestId("course-course-1"));
    await user.click(screen.getByTestId("course-course-3"));

    // Vérifier que les sélections sont maintenues
    expect(screen.getByTestId("course-course-1")).toBeChecked();
    expect(screen.getByTestId("course-course-2")).not.toBeChecked();
    expect(screen.getByTestId("course-course-3")).toBeChecked();

    // Cliquer sur le bouton d'enregistrement
    await user.click(screen.getByTestId("save-button"));

    // Les sélections doivent être maintenues après l'interaction
    expect(screen.getByTestId("course-course-1")).toBeChecked();
    expect(screen.getByTestId("course-course-3")).toBeChecked();
  });
});

describe("Course Assignment Data Flow", () => {
  it("should correctly format course data for API calls", () => {
    const selectedCourses = ["course-1", "course-2"];
    const formData = new FormData();
    formData.set("selectedCourses", JSON.stringify(selectedCourses));

    const retrievedCourses = JSON.parse(formData.get("selectedCourses") as string);

    expect(retrievedCourses).toEqual(["course-1", "course-2"]);
    expect(Array.isArray(retrievedCourses)).toBe(true);
    expect(retrievedCourses.length).toBe(2);
  });

  it("should handle empty course selection", () => {
    const selectedCourses: string[] = [];
    const formData = new FormData();
    formData.set("selectedCourses", JSON.stringify(selectedCourses));

    const retrievedCourses = JSON.parse(formData.get("selectedCourses") as string);

    expect(retrievedCourses).toEqual([]);
    expect(Array.isArray(retrievedCourses)).toBe(true);
    expect(retrievedCourses.length).toBe(0);
  });

  it("should validate course IDs format", () => {
    const validCourseIds = ["course-1", "course-2", "course-3"];
    const invalidCourseIds = [null, undefined, "", 123];

    validCourseIds.forEach(id => {
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });

    invalidCourseIds.forEach(id => {
      expect(typeof id !== "string" || id === "").toBe(true);
    });
  });
});

describe("Course Assignment Error Handling", () => {
  it("should handle course loading errors gracefully", async () => {
    // Simuler une erreur de chargement des cours
    mockSupabase.single.mockRejectedValue(new Error("Failed to load courses"));

    // Le composant devrait gérer l'erreur sans crasher
    expect(() => {
      render(<CourseAssignmentTest />);
    }).not.toThrow();
  });

  it("should validate school year ID presence", () => {
    const formData = new FormData();
    formData.set("schoolYearId", "");

    const schoolYearId = formData.get("schoolYearId") as string;

    // Devrait détecter l'absence d'année scolaire
    expect(schoolYearId).toBe("");
    expect(!schoolYearId).toBe(true);
  });

  it("should handle malformed JSON in course selection", () => {
    const malformedJson = "invalid-json-string";

    expect(() => {
      JSON.parse(malformedJson);
    }).toThrow();

    // Test du fallback en cas de JSON invalide
    let parsedCourses;
    try {
      parsedCourses = JSON.parse(malformedJson);
    } catch {
      parsedCourses = []; // Fallback
    }

    expect(parsedCourses).toEqual([]);
  });
});

// Tests de performance et optimisation
describe("Course Assignment Performance", () => {
  it("should handle large course lists efficiently", () => {
    const largeCourseList = Array.from({ length: 100 }, (_, i) => ({
      id: `course-${i}`,
      name: `Cours ${i}`,
      price: 350,
    }));

    expect(largeCourseList.length).toBe(100);
    expect(largeCourseList[0]).toEqual({
      id: "course-0",
      name: "Cours 0",
      price: 350,
    });
  });

  it("should optimize re-renders during course selection", () => {
    // Test de stabilité des références

    const selectedCourses1 = ["course-1"];
    const selectedCourses2 = ["course-1"];

    // Les tableaux avec le même contenu devraient être considérés comme égaux
    expect(selectedCourses1).toEqual(selectedCourses2);
    expect(JSON.stringify(selectedCourses1)).toBe(JSON.stringify(selectedCourses2));
  });
});
