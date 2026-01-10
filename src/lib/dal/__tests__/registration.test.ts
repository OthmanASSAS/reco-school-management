// /Users/oassas/Projets/inscription-app/src/lib/dal/__tests__/registration.test.ts
import { describe, it, expect } from "vitest";
import { OnsiteRegistrationPayload } from "../registration";

describe("Registration Logic Tests", () => {
  describe("Payload Validation", () => {
    it("should correctly identify a new family payload", () => {
      const payload: OnsiteRegistrationPayload = {
        schoolYearId: "year-123",
        familyId: null,
        newFamily: {
          first_name: "Jean",
          last_name: "Dupont",
          email: "jean.dupont@example.com",
        },
        students: [],
        enrollments: [],
      };

      expect(payload.familyId).toBeNull();
      expect(payload.newFamily).toBeDefined();
      expect(payload.newFamily?.email).toBe("jean.dupont@example.com");
    });

    it("should correctly identify an existing family payload", () => {
      const payload: OnsiteRegistrationPayload = {
        schoolYearId: "year-123",
        familyId: "family-456",
        newFamily: null,
        students: [],
        enrollments: [],
      };

      expect(payload.familyId).toBe("family-456");
      expect(payload.newFamily).toBeNull();
    });

    it("should handle mixed students (new and existing)", () => {
      const payload: OnsiteRegistrationPayload = {
        schoolYearId: "year-123",
        familyId: "family-456",
        students: [
          { id: "student-1", isNew: false },
          {
            isNew: true,
            first_name: "Alice",
            last_name: "Dupont",
            birth_date: "2015-05-10",
            registration_type: "child",
          },
        ],
        enrollments: [
          { studentRefIndex: 0, courseIds: ["course-A"] },
          { studentRefIndex: 1, courseIds: ["course-B", "course-C"] },
        ],
      };

      expect(payload.students).toHaveLength(2);
      expect(payload.students[0]).toHaveProperty("id");
      expect(payload.students[1]).toHaveProperty("isNew", true);
      expect(payload.enrollments).toHaveLength(2);
      expect(payload.enrollments[1].courseIds).toHaveLength(2);
    });
  });

  describe("Enrollment Mapping Logic", () => {
    it("should match student references correctly", () => {
      const studentIds = ["real-id-1", "real-id-2"];
      const enrollments = [
        { studentRefIndex: 0, courseIds: ["course-1"] },
        { studentRefIndex: 1, courseIds: ["course-2"] },
      ];

      const mappedEnrollments = enrollments.flatMap(e => {
        const sId = studentIds[e.studentRefIndex];
        return e.courseIds.map(cId => ({
          studentId: sId,
          courseId: cId,
        }));
      });

      expect(mappedEnrollments[0].studentId).toBe("real-id-1");
      expect(mappedEnrollments[1].studentId).toBe("real-id-2");
    });
  });
});
