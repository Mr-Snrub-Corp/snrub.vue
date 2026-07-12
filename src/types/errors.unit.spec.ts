import { describe, it, expect } from "vitest";
import { HttpError } from "./errors";

describe("HttpError", () => {
  it("instanceof check survives a thrown/caught cycle", () => {
    try {
      throw new HttpError("msg", 400, "Bad Request");
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
    }
  });

  it("carries name, message, status, statusText, data", () => {
    const err = new HttpError("oops", 422, "Unprocessable Entity", { detail: "x" });
    expect(err.name).toBe("HttpError");
    expect(err.message).toBe("oops");
    expect(err.status).toBe(422);
    expect(err.statusText).toBe("Unprocessable Entity");
    expect(err.data).toEqual({ detail: "x" });
  });

  it("data defaults to undefined when omitted", () => {
    expect(new HttpError("msg", 400, "Bad Request").data).toBeUndefined();
  });

  describe("isClientError()", () => {
    it.each([
      [399, false],
      [400, true],
      [404, true],
      [499, true],
      [500, false],
    ])("status %i → %s", (status, expected) => {
      expect(new HttpError("", status, "").isClientError()).toBe(expected);
    });
  });

  describe("isServerError()", () => {
    it.each([
      [499, false],
      [500, true],
      [503, true],
    ])("status %i → %s", (status, expected) => {
      expect(new HttpError("", status, "").isServerError()).toBe(expected);
    });
  });

  describe("isAuthError()", () => {
    it.each([
      [400, false],
      [401, true],
      [403, false],
    ])("status %i → %s", (status, expected) => {
      expect(new HttpError("", status, "").isAuthError()).toBe(expected);
    });
  });

  describe("isValidationError()", () => {
    it.each([
      [421, false],
      [422, true],
      [423, false],
    ])("status %i → %s", (status, expected) => {
      expect(new HttpError("", status, "").isValidationError()).toBe(expected);
    });
  });
});
