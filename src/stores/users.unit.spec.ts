import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { USER_ROLES, USER_STATUS } from "@/constants/enums";
import type { User } from "@/types/user";
import api from "@/services/httpService";
import { useUsersStore } from "./users";

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

const mockUser: User = {
  uid: "u1",
  email: "alice@example.com",
  name: "Alice",
  role: USER_ROLES.ADMIN,
  status: USER_STATUS.ACTIVE,
};

const mockUser2: User = {
  uid: "u2",
  email: "bob@example.com",
  name: "Bob",
  role: USER_ROLES.VIEWER,
  status: USER_STATUS.ACTIVE,
};

describe("useUsersStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("getUserById", () => {
    it("returns user when uid matches", () => {
      const store = useUsersStore();
      store.users = [mockUser];

      expect(store.getUserById("u1")).toEqual(mockUser);
    });

    it("returns undefined when uid not found", () => {
      const store = useUsersStore();
      store.users = [mockUser];

      expect(store.getUserById("missing")).toBeUndefined();
    });
  });

  describe("$reset", () => {
    it("clears users state", () => {
      const store = useUsersStore();
      store.users = [mockUser];

      store.$reset();

      expect(store.users).toEqual([]);
    });
  });

  describe("createUser", () => {
    it("pushes API response into state", async () => {
      vi.mocked(api.users.create).mockResolvedValue(mockUser);
      const store = useUsersStore();

      const result = await store.createUser({ email: mockUser.email, name: mockUser.name });

      expect(result).toEqual(mockUser);
      expect(store.users).toEqual([mockUser]);
      expect(api.users.create).toHaveBeenCalledWith({
        email: mockUser.email,
        name: mockUser.name,
      });
    });
  });

  describe("fetchUsers", () => {
    it("replaces state with API response", async () => {
      vi.mocked(api.users.get).mockResolvedValue([mockUser, mockUser2]);
      const store = useUsersStore();
      store.users = [mockUser];

      const result = await store.fetchUsers();

      expect(result).toEqual([mockUser, mockUser2]);
      expect(store.users).toEqual([mockUser, mockUser2]);
    });

    it("logs and rethrows on API failure", async () => {
      const error = new Error("fetch failed");
      vi.mocked(api.users.get).mockRejectedValue(error);
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const store = useUsersStore();

      await expect(store.fetchUsers()).rejects.toThrow("fetch failed");
      expect(consoleSpy).toHaveBeenCalledWith("Error fetching users:", error);

      consoleSpy.mockRestore();
    });
  });

  describe("fetchUserById", () => {
    it("merges response into existing user by uid", async () => {
      const updatedUser = { ...mockUser, name: "Alice Updated", photo: "abc123" };
      vi.mocked(api.users.getOne).mockResolvedValue(updatedUser);
      const store = useUsersStore();
      store.users = [{ ...mockUser }];

      const result = await store.fetchUserById("u1");

      expect(result).toEqual(updatedUser);
      expect(store.users[0]).toEqual(updatedUser);
    });
  });

  describe("updateUser", () => {
    it("merges response into existing user by uid", async () => {
      const updatedUser = { ...mockUser, name: "Alice Updated" };
      vi.mocked(api.users.updateOne).mockResolvedValue(updatedUser);
      const store = useUsersStore();
      store.users = [{ ...mockUser }];

      const result = await store.updateUser("u1", { name: "Alice Updated" });

      expect(result).toEqual(updatedUser);
      expect(store.users[0]).toEqual(updatedUser);
      expect(api.users.updateOne).toHaveBeenCalledWith("u1", { name: "Alice Updated" });
    });
  });

  describe("deleteUser", () => {
    it("removes user from state", async () => {
      vi.mocked(api.users.deleteOne).mockResolvedValue(undefined);
      const store = useUsersStore();
      store.users = [mockUser, mockUser2];

      await store.deleteUser("u1");

      expect(store.users).toEqual([mockUser2]);
      expect(api.users.deleteOne).toHaveBeenCalledWith("u1");
    });
  });

  describe("uploadPhoto", () => {
    it("uploads file and refreshes user via getOne", async () => {
      const file = new File(["photo"], "photo.png", { type: "image/png" });
      const uploadResponse = { photo: "abc123" };
      const refreshedUser = { ...mockUser, photo: "abc123" };
      vi.mocked(api.users.uploadPhoto).mockResolvedValue(uploadResponse);
      vi.mocked(api.users.getOne).mockResolvedValue(refreshedUser);
      const store = useUsersStore();
      store.users = [{ ...mockUser }];

      const result = await store.uploadPhoto("u1", file);
      await flushPromises();

      expect(result).toEqual(uploadResponse);
      expect(api.users.uploadPhoto).toHaveBeenCalledWith("u1", expect.any(FormData));
      const formData = vi.mocked(api.users.uploadPhoto).mock.calls[0][1] as FormData;
      expect(formData.get("file")).toBe(file);
      expect(api.users.getOne).toHaveBeenCalledWith("u1");
      expect(store.users[0]).toEqual(refreshedUser);
    });

    it("resolves with upload response even when post-upload refresh fails", async () => {
      const file = new File(["photo"], "photo.png", { type: "image/png" });
      const uploadResponse = { photo: "abc123" };
      vi.mocked(api.users.uploadPhoto).mockResolvedValue(uploadResponse);
      vi.mocked(api.users.getOne).mockRejectedValue(new Error("network error"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const store = useUsersStore();
      store.users = [{ ...mockUser }];

      await expect(store.uploadPhoto("u1", file)).resolves.toEqual(uploadResponse);
      await flushPromises();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error refreshing user u1 after photo upload:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("logs and rethrows on API failure", async () => {
      const file = new File(["photo"], "photo.png", { type: "image/png" });
      const error = new Error("upload failed");
      vi.mocked(api.users.uploadPhoto).mockRejectedValue(error);
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const store = useUsersStore();

      await expect(store.uploadPhoto("u1", file)).rejects.toThrow("upload failed");
      expect(consoleSpy).toHaveBeenCalledWith("Error uploading photo for user u1:", error);
      expect(api.users.getOne).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
