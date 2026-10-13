import { describe, expect, it } from "vitest";
import { displayName, toManagedUser, type ApiUser } from "./userAdapter";

const apiUser: ApiUser = {
  id: 7,
  username: "rafi",
  email: "rafi@example.org",
  first_name: "Rafi",
  last_name: "K",
  role: "researcher",
  is_active: true,
  must_change_password: false,
  date_joined: "2026-09-28T10:00:00Z",
  last_login: null,
};

describe("toManagedUser", () => {
  it("maps the API user onto the screen's shape", () => {
    expect(toManagedUser(apiUser)).toEqual({
      id: 7,
      username: "rafi",
      email: "rafi@example.org",
      firstName: "Rafi",
      lastName: "K",
      name: "Rafi K",
      role: "researcher",
      active: true,
      mustChangePassword: false,
      joinedAt: "2026-09-28T10:00:00Z",
      lastLoginAt: null,
      emailVerified: true,
      organisation: "",
      purpose: "",
      newsletter: false,
    });
  });

  it("carries a visitor's sign-up answers and email confirmation", () => {
    const visitor = toManagedUser({ ...apiUser, role: "public", email_verified: false, organisation: "Calicut University", purpose: "research", newsletter_opt_in: true });
    expect(visitor).toMatchObject({ emailVerified: false, organisation: "Calicut University", purpose: "research", newsletter: true });
  });

  it("treats missing name fields as empty", () => {
    const user = toManagedUser({ ...apiUser, first_name: undefined, last_name: undefined });
    expect(user.firstName).toBe("");
    expect(user.name).toBe("rafi");
  });
});

describe("displayName", () => {
  it("prefers the full name, then the email's local part", () => {
    expect(displayName({ firstName: " Asha ", lastName: "", email: "a@x.org" })).toBe("Asha");
    expect(displayName({ firstName: "", lastName: "", email: "editor@demo.example" })).toBe("editor");
    expect(displayName({ email: "@odd" })).toBe("@odd");
  });
});
