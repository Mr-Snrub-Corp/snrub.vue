import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { ref } from "vue";
import { USER_ROLES, USER_STATUS, SUBJECT_ROLE } from "@/constants/enums";
import type { User } from "@/types/user";
import type { IncidentReportSubjectCreate } from "@/types/incidentReport";
import { useIncidentReportSubjects } from "./useIncidentReportSubjects";
import { useUsersStore } from "@/stores/users";

// httpService is imported transitively via useUsersStore — mock it to prevent
// fetch calls during tests.
vi.mock("@/services/httpService", () => ({
  default: {
    users: {
      create: vi.fn(),
      get: vi.fn(),
      getOne: vi.fn(),
      updateOne: vi.fn(),
      deleteOne: vi.fn(),
      uploadPhoto: vi.fn(),
    },
  },
}));

// --- Fixtures ---

const mockUserAlice: User = {
  uid: "u1",
  email: "alice@example.com",
  name: "Alice",
  role: USER_ROLES.ADMIN,
  status: USER_STATUS.ACTIVE,
};

const mockUserBob: User = {
  uid: "u2",
  email: "bob@example.com",
  name: "Bob",
  role: USER_ROLES.VIEWER,
  status: USER_STATUS.ACTIVE,
};

// Factory — creates a reactive formData ref with an optional subjects seed.
function makeFormData(subjects: IncidentReportSubjectCreate[] = []) {
  return ref({ subjects });
}

// Convenience: mount the composable with a pre-seeded users store.
function setup(subjects: IncidentReportSubjectCreate[] = []) {
  const usersStore = useUsersStore();
  usersStore.users = [mockUserAlice, mockUserBob];
  const formData = makeFormData(subjects);
  const composable = useIncidentReportSubjects(formData);
  return { composable, formData, usersStore };
}

describe("useIncidentReportSubjects", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // --- availableUsers ---

  describe("availableUsers", () => {
    it("returns all users when no subjects have been added", () => {
      const { composable } = setup();

      expect(composable.availableUsers.value).toEqual([mockUserAlice, mockUserBob]);
    });

    it("excludes users already added as subjects", () => {
      const { composable } = setup([{ user_id: "u1", role: SUBJECT_ROLE.RESPONSIBLE }]);

      expect(composable.availableUsers.value).toEqual([mockUserBob]);
    });

    // TODO: test that availableUsers reactively updates when a subject is added at runtime
    // TODO: test with an empty users store (should return empty array)
  });

  // --- getSubjectName ---

  describe("getSubjectName", () => {
    it.todo("returns the user's name when the uid exists in the store");
    it.todo("falls back to the raw userId string when the user is not found");
  });

  // --- addSubject ---

  describe("addSubject", () => {
    it("appends subject to formData and resets newSubject", () => {
      const { composable, formData } = setup();

      composable.newSubject.value = { user_id: "u1", role: SUBJECT_ROLE.WITNESS };
      composable.addSubject();

      expect(formData.value.subjects).toEqual([{ user_id: "u1", role: SUBJECT_ROLE.WITNESS }]);
      expect(composable.newSubject.value).toEqual({ user_id: "", role: "" });
      expect(composable.showAddSubject.value).toBe(false);
    });

    // TODO: does nothing when user_id is empty
    // TODO: does nothing when role is empty
    // TODO: closes showAddSubject after a successful add
  });

  // --- removeSubject ---

  describe("removeSubject", () => {
    it.todo("removes the subject at the given index");
    it.todo("does not affect subjects at other indices");
  });

  // --- subjectRoleOptions ---

  describe("subjectRoleOptions", () => {
    it.todo("contains an entry for each SUBJECT_ROLE value");
    it.todo("each option has a `label` (formatted string) and `value` (raw enum value)");
  });

  // --- sharedRules ---

  describe("sharedRules", () => {
    it.todo("description maxLength rule rejects strings over MAX_LENGTH.REPORT_DESCRIPTION");
    it.todo("severity required rule rejects missing values");
    it.todo("severity between rule rejects values outside 1–7");
  });
});
