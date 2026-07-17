import { describe, expect, it } from "vitest";
import {
  authUserSchema,
  loginResponseSchema,
  registerInputSchema,
  readingPreferenceSchema,
  updateProfileSchema,
} from "./auth";

const sampleUser = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "reader@example.com",
  displayName: "Reader",
  username: "reader_one",
  roles: ["reader"],
  status: "active" as const,
  emailVerifiedAt: null,
  avatarUrl: null,
  preferredLanguage: "en",
  preferredTranslation: null,
  preferredCommentary: null,
  timeZone: "Asia/Kolkata",
  country: "IN",
  lastLoginAt: null,
  createdAt: "2026-07-16T12:00:00.000Z",
};

describe("auth contracts", () => {
  it("parses auth user", () => {
    expect(authUserSchema.parse(sampleUser).email).toBe("reader@example.com");
  });

  it("parses login response", () => {
    const parsed = loginResponseSchema.parse({
      data: {
        accessToken: "a",
        refreshToken: "b",
        expiresAt: "2026-07-16T12:15:00.000Z",
        user: sampleUser,
      },
    });
    expect(parsed.data.user.roles).toEqual(["reader"]);
  });

  it("validates register input", () => {
    expect(
      registerInputSchema.parse({
        email: "a@b.co",
        password: "password1",
        displayName: "A",
      }).email,
    ).toBe("a@b.co");
  });

  it("rejects short passwords", () => {
    expect(() =>
      registerInputSchema.parse({
        email: "a@b.co",
        password: "short",
        displayName: "A",
      }),
    ).toThrow();
  });

  it("parses reading preference", () => {
    const pref = readingPreferenceSchema.parse({
      theme: "dark",
      language: "te",
      translationSourceKey: "holy-bg-telugu",
      commentarySourceKey: null,
      fontSize: "comfortable",
      fontFamily: "serif",
      readerWidth: "wide",
      lineHeight: "relaxed",
      layout: "classic",
      updatedAt: "2026-07-16T12:00:00.000Z",
    });
    expect(pref.language).toBe("te");
  });

  it("accepts partial profile updates", () => {
    expect(updateProfileSchema.parse({ displayName: "New" }).displayName).toBe(
      "New",
    );
  });
});
