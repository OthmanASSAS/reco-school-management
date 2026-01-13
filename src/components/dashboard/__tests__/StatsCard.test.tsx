import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StatsCard from "../StatsCard";
import { Users } from "lucide-react";
import "@testing-library/jest-dom";

describe("StatsCard", () => {
  const mockProps = {
    title: "Élèves inscrits",
    value: 42,
    icon: <Users size={24} className="text-blue-600" />,
    href: "/students",
    bgColor: "bg-blue-100",
  };

  it("renders the card with correct title and value", () => {
    render(<StatsCard {...mockProps} />);

    expect(screen.getByText("Élèves inscrits")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders with string value", () => {
    const props = { ...mockProps, value: "150 €" };
    render(<StatsCard {...props} />);

    expect(screen.getByText("150 €")).toBeInTheDocument();
  });

  it("has correct link href", () => {
    render(<StatsCard {...mockProps} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/students");
  });

  it("has hover effects classes", () => {
    render(<StatsCard {...mockProps} />);

    const card = screen.getByRole("link").firstChild;
    expect(card).toHaveClass("hover:shadow-lg", "hover:scale-[1.02]", "cursor-pointer");
  });

  it("uses default bgColor when not provided", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { bgColor: _, ...propsWithoutBgColor } = mockProps;

    render(<StatsCard {...propsWithoutBgColor} />);

    // Default bg-gray-100 should be applied
    expect(document.querySelector(".bg-gray-100")).toBeInTheDocument();
  });
});
