// @vitest-environment node

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mockFrom = vi.fn();

vi.mock("@/lib/supabase", () => ({
  default: {
    from: mockFrom,
  },
}));

let preRegister: (
  formData: FormData
) => Promise<{ success: boolean; messages: string[]; status: number; error?: string }>;

beforeAll(async () => {
  ({ preRegister } = await import("../pre-registration"));
});

const NO_ROW_ERROR = {
  code: "PGRST116",
  message: "No rows",
};

type SelectResponse<T> = {
  data: T | null;
  error: unknown;
};

function createFamiliesSelectBuilder(response: SelectResponse<unknown>) {
  const single = vi.fn(() => Promise.resolve(response));
  const eq = vi.fn(() => ({ single }));
  const select = vi.fn(() => ({ eq }));
  return { select };
}

function createFamiliesInsertBuilder(onInsert: (payload: unknown) => void, data: unknown) {
  return {
    insert: vi.fn((payload: unknown) => {
      onInsert(payload);
      return {
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data, error: null })),
        })),
      };
    }),
  };
}

function createSchoolYearSelectBuilder(data: unknown) {
  const single = vi.fn(() => Promise.resolve({ data, error: null }));
  const limit = vi.fn(() => ({ single }));
  const order = vi.fn(() => ({ limit }));
  const select = vi.fn(() => ({ order }));
  return { select };
}

function createStudentsSelectBuilder(response: SelectResponse<unknown>) {
  const single = vi.fn(() => Promise.resolve(response));
  const builder: unknown = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    single,
  };
  return builder;
}

function createStudentsInsertBuilder(onInsert: (payload: unknown) => void, data: unknown) {
  return {
    insert: vi.fn((payload: unknown) => {
      onInsert(payload);
      return {
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data, error: null })),
        })),
      };
    }),
  };
}

function createRegistrationsSelectBuilder(response: SelectResponse<unknown>) {
  const maybeSingle = vi.fn(() => Promise.resolve(response));
  const builder: unknown = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    maybeSingle,
  };
  return builder;
}

function createRegistrationsInsertBuilder(onInsert: (payload: unknown) => void) {
  return {
    insert: vi.fn((payload: unknown) => {
      onInsert(payload);
      return Promise.resolve({ data: null, error: null });
    }),
  };
}

type TableHandlers = Record<string, unknown[]>;

function setSupabaseMock(handlers: TableHandlers) {
  const queues = Object.fromEntries(
    Object.entries(handlers).map(([table, builders]) => [table, [...builders]])
  );

  mockFrom.mockImplementation((table: string) => {
    const queue = queues[table];
    if (!queue || queue.length === 0) {
      throw new Error(`Unexpected supabase.from call for table "${table}"`);
    }
    return queue.shift();
  });
}

describe("preRegister action", () => {
  let familyInserts: unknown[];
  let studentInserts: unknown[];
  let registrationInserts: unknown[];

  beforeEach(() => {
    familyInserts = [];
    studentInserts = [];
    registrationInserts = [];
    mockFrom.mockReset();
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

  it("creates a new family, student and registration when none exist", async () => {
    setSupabaseMock({
      families: [
        createFamiliesSelectBuilder({ data: null, error: NO_ROW_ERROR }),
        createFamiliesInsertBuilder(payload => familyInserts.push(payload), { id: "family-1" }),
      ],
      school_years: [createSchoolYearSelectBuilder({ id: "school-year-1" })],
      students: [
        createStudentsSelectBuilder({ data: null, error: NO_ROW_ERROR }),
        createStudentsInsertBuilder(payload => studentInserts.push(payload), { id: "student-1" }),
      ],
      registrations: [
        createRegistrationsSelectBuilder({ data: null, error: null }),
        createRegistrationsInsertBuilder(payload => registrationInserts.push(payload)),
      ],
    });

    const formData = new FormData();
    formData.append("family", JSON.stringify(baseFamily));
    formData.append("students", JSON.stringify([baseStudent]));
    formData.append("appointmentDay", "2025-06-29");

    const result = await preRegister(formData);

    expect(result).toMatchObject({ success: true, status: 201 });
    expect(result.messages).toContain("Othman Assas a été ajouté.");

    expect(familyInserts[0]).toEqual({
      last_name: "Assas",
      first_name: "Myriam",
      email: "othman.assas@gmail.com",
      phone: "0663341982",
      address: "15 RUE DE LA DHUYS",
      postal_code: "93470",
      city: "COUBRON",
    });

    expect(studentInserts[0]).toMatchObject({
      family_id: "family-1",
      first_name: "Othman",
      last_name: "Assas",
      birth_date: "2015-06-21",
    });

    expect(registrationInserts[0]).toEqual({
      student_id: "student-1",
      family_id: "family-1",
      status: "draft",
      course_instance_id: null,
      school_year_id: "school-year-1",
      is_waiting_list: false,
      appointment_day: "2025-06-29",
    });
  });

  it("reuses existing family, student and registration when they already exist", async () => {
    setSupabaseMock({
      families: [createFamiliesSelectBuilder({ data: { id: "family-1" }, error: null })],
      school_years: [createSchoolYearSelectBuilder({ id: "school-year-1" })],
      students: [createStudentsSelectBuilder({ data: { id: "student-1" }, error: null })],
      registrations: [createRegistrationsSelectBuilder({ data: { id: "reg-1" }, error: null })],
    });

    const formData = new FormData();
    formData.append("family", JSON.stringify(baseFamily));
    formData.append("students", JSON.stringify([baseStudent]));
    formData.append("appointmentDay", "2025-06-29");

    const result = await preRegister(formData);

    expect(result).toMatchObject({ success: true, status: 201 });
    expect(result.messages).toEqual([
      "Othman Assas existe déjà.",
      "Inscription de Othman déjà enregistrée.",
    ]);

    expect(familyInserts).toHaveLength(0);
    expect(studentInserts).toHaveLength(0);
    expect(registrationInserts).toHaveLength(0);
  });
});
