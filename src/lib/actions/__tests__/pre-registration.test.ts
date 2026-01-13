/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { processPreRegistrationTransaction } from "@/lib/dal/registration";

vi.mock("@/lib/dal/registration", () => ({
  processPreRegistrationTransaction: vi.fn(),
}));

let preRegister: (formData: FormData) => Promise<any>;

beforeAll(async () => {
  ({ preRegister } = await import("../pre-registration"));
});

describe("preRegister action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseFamily = {
    familyName: "Assas",
    parentFirstName: "Myriam",
    contactEmail: "othman.assas@gmail.com",
    contactPhone: "0663341982",
    address: "15 RUE DE LA DHUYS",
    postalCode: "93470",
    city: "COUBRON",
  };

  const baseStudent = {
    firstName: "Othman",
    lastName: "Assas",
    birthDate: "2015-06-21",
  };

  it("calls processPreRegistrationTransaction with correct payload", async () => {
    vi.mocked(processPreRegistrationTransaction).mockResolvedValue({
      success: true,
      familyId: "family-1",
      messages: ["Othman Assas a été ajouté."],
    });

    const formData = new FormData();
    formData.append("family", JSON.stringify(baseFamily));
    formData.append("students", JSON.stringify([baseStudent]));
    formData.append("appointmentDay", "2025-06-29");

    const result = await preRegister(formData);

    expect(result).toMatchObject({ success: true, status: 201 });
    expect(result.messages).toContain("Othman Assas a été ajouté.");

    expect(processPreRegistrationTransaction).toHaveBeenCalledWith({
      family: baseFamily,
      students: [{ ...baseStudent, registration_type: undefined }],
      appointmentDay: "2025-06-29",
    });
  });

  it("handles errors from processPreRegistrationTransaction", async () => {
    vi.mocked(processPreRegistrationTransaction).mockRejectedValue(new Error("Database error"));

    const formData = new FormData();
    formData.append("family", JSON.stringify(baseFamily));
    formData.append("students", JSON.stringify([baseStudent]));
    formData.append("appointmentDay", "2025-06-29");

    const result = await preRegister(formData);

    expect(result).toMatchObject({ status: 500, error: "Database error" });
  });
});
