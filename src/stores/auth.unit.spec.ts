import { describe, it, vi, beforeEach, expect } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { USER_ROLES, USER_STATUS } from "@/constants/enums";
import type { AuthResponse } from "@/types/auth";
import type { User } from "@/types/user";
import api from "@/services/httpService";
import { useAuthStore } from "./auth";

vi.mock("@/services/httpService", () => ({
  default: {
    auth: {
      login: vi.fn(),
      loginGoogle: vi.fn(),
      logout: vi.fn(),
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
    },
  },
}));

const mockToken = "mock-access-token";

const mockViewerUser: User = {
  uid: "u-viewer",
  email: "viewer@example.com",
  name: "Viewer User",
  role: USER_ROLES.VIEWER,
  status: USER_STATUS.ACTIVE,
};

const mockAdminUser: User = {
  uid: "u-admin",
  email: "admin@example.com",
  name: "Admin User",
  role: USER_ROLES.ADMIN,
  status: USER_STATUS.ACTIVE,
};

const mockSuperAdminUser: User = {
  uid: "u-super-admin",
  email: "superadmin@example.com",
  name: "Super Admin User",
  role: USER_ROLES.SUPER_ADMIN,
  status: USER_STATUS.ACTIVE,
};

const createMockAuthResponse = (user: User): AuthResponse => ({
  access_token: mockToken,
  user,
});

const mockAuthResponse = createMockAuthResponse(mockAdminUser);

const mockLoginCredentials = {
  email: "admin@example.com",
  password: "password123",
};

const mockResetEmail = {
  email: "admin@example.com",
};

const mockResetEmailResponse = {
  message: "If your email is registered, you will receive a password reset link",
};

const mockResetPasswordPayload = {
  token: "reset-token",
  new_password: "newPassword123",
};

const mockResetPasswordResponse = { message: "Password reset successfully" };

describe("useAuthStore", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("getAuthUser", () => {
    it("returns user when logged in", () => {
      const store = useAuthStore();
      store.user = mockViewerUser;
      store.token = mockToken;

      expect(store.getAuthUser).toEqual(mockViewerUser);
    });
  });

  describe("isAdmin", () => {
    it("returns false when user is viewer", () => {
      const store = useAuthStore();
      store.user = mockViewerUser;
      store.token = mockToken;

      expect(store.isAdmin).toEqual(false);
    });

    it("returns true when user is admin", () => {
      const store = useAuthStore();
      store.user = mockAdminUser;
      store.token = mockToken;

      expect(store.isAdmin).toEqual(true);
    });

    it("returns true when user is super admin", () => {
      const store = useAuthStore();
      store.user = mockSuperAdminUser;
      store.token = mockToken;

      expect(store.isAdmin).toEqual(true);
    });
  });

  describe("isLoggedIn", () => {
    it("returns true when store user / token data are set", () => {
      const store = useAuthStore();
      store.user = mockAdminUser;
      store.token = mockToken;

      expect(store.isLoggedIn).toEqual(true);
    });
  });

  describe("login", () => {
    it("rejects when login fails", async () => {
      const error = new Error("Invalid credentials");
      vi.mocked(api.auth.login).mockRejectedValue(error);

      const store = useAuthStore();
      await expect(
        store.login({ email: "chunkylover53@aol.com", password: "1234" }),
      ).rejects.toThrow("Invalid credentials");

      expect(store.user).toBeNull();
      expect(store.token).toBeNull();
    });

    it("sets user and token on successful login", async () => {
      vi.mocked(api.auth.login).mockResolvedValue(mockAuthResponse);

      const store = useAuthStore();
      await store.login(mockLoginCredentials);

      expect(store.user).toEqual(mockAdminUser);
      expect(store.token).toEqual(mockToken);
      expect(api.auth.login).toHaveBeenCalledWith(mockLoginCredentials);
    });
  });

  describe("requestReset", () => {
    it("API called with { email }", async () => {
      vi.mocked(api.auth.requestPasswordReset).mockResolvedValue(mockResetEmailResponse);
      const store = useAuthStore();
      await store.requestReset(mockResetEmail);

      expect(api.auth.requestPasswordReset).toHaveBeenCalledWith(mockResetEmail);
    });
  });

  describe("resetPassword", () => {
    it("Calls the API with the right payload", async () => {
      vi.mocked(api.auth.resetPassword).mockResolvedValue(mockResetPasswordResponse);

      const store = useAuthStore();
      await store.resetPassword(mockResetPasswordPayload);

      expect(api.auth.resetPassword).toHaveBeenCalledWith(mockResetPasswordPayload);
    });
  });
});
