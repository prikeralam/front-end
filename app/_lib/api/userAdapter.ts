import type { Role } from "../session";

/** A backend account as the admin Users screen shows it (API `User`, see backend docs/api/module-h-accounts-roles.md). */
export type ManagedUser = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: Role;
  active: boolean;
  mustChangePassword: boolean;
  joinedAt: string;
  lastLoginAt: string | null;
};

export type ApiUser = {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: Role;
  is_active: boolean;
  must_change_password: boolean;
  date_joined: string;
  last_login: string | null;
};

/** Full name when the account has one, otherwise the local part of the email. */
export function displayName({ firstName, lastName, email }: { firstName?: string; lastName?: string; email: string }): string {
  const full = [firstName, lastName].map((part) => part?.trim()).filter(Boolean).join(" ");
  return full || email.split("@")[0] || email;
}

export function toManagedUser(user: ApiUser): ManagedUser {
  const firstName = user.first_name ?? "";
  const lastName = user.last_name ?? "";
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName,
    lastName,
    name: displayName({ firstName, lastName, email: user.email }),
    role: user.role,
    active: user.is_active,
    mustChangePassword: user.must_change_password,
    joinedAt: user.date_joined,
    lastLoginAt: user.last_login,
  };
}
