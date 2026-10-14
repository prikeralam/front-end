import { PURPOSES, type Purpose } from "../signup";
import { roleLabels, type Role } from "../session";

/**
 * Filters for the admin user lists (Users & Roles, Visitors) and their CSV export. Everything is checked here, because
 * the Server Actions that take these are public POST endpoints; `userQuery` turns valid filters into the API's query.
 */
export type UserFilters = {
  q?: string;
  role?: Role | "";
  active?: "active" | "inactive" | "";
  /** true: staff only (every role but visitors); false: visitors only. */
  staff?: boolean;
  /** Visitors: confirmed their email or not. */
  confirmed?: "yes" | "no" | "";
  newsletter?: boolean;
  purpose?: Purpose | "";
  ordering?: UserOrdering;
  page?: number;
  pageSize?: number;
};

export const USER_ORDERINGS = ["username", "-username", "email", "-email", "date_joined", "-date_joined", "last_login", "-last_login"] as const;
export type UserOrdering = (typeof USER_ORDERINGS)[number];

const MAX_QUERY = 100;
const MAX_PAGE = 100_000;

const isRole = (value: unknown): value is Role => typeof value === "string" && Object.hasOwn(roleLabels, value);
const isPurpose = (value: unknown): value is Purpose => PURPOSES.some((p) => p.value === value);

/** The API query for `filters`, or null when any of them is invalid. `forExport` leaves out paging. */
export function userQuery(filters: UserFilters = {}, { forExport = false }: { forExport?: boolean } = {}): URLSearchParams | null {
  const { q = "", role = "", active = "", staff, confirmed = "", newsletter, purpose = "", ordering, page = 1, pageSize } = filters ?? {};
  if (typeof q !== "string" || q.length > MAX_QUERY) return null;
  if (role !== "" && !isRole(role)) return null;
  if (active !== "" && active !== "active" && active !== "inactive") return null;
  if (staff !== undefined && typeof staff !== "boolean") return null;
  if (confirmed !== "" && confirmed !== "yes" && confirmed !== "no") return null;
  if (newsletter !== undefined && typeof newsletter !== "boolean") return null;
  if (purpose !== "" && !isPurpose(purpose)) return null;
  if (ordering !== undefined && !USER_ORDERINGS.includes(ordering)) return null;
  if (!Number.isInteger(page) || page < 1 || page > MAX_PAGE) return null;
  if (pageSize !== undefined && (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100)) return null;

  const params = new URLSearchParams();
  if (!forExport) params.set("page", String(page));
  if (!forExport && pageSize) params.set("page_size", String(pageSize));
  if (q.trim()) params.set("q", q.trim());
  if (role) params.set("role", role);
  if (active) params.set("is_active", active === "active" ? "true" : "false");
  if (staff !== undefined) params.set("staff", String(staff));
  if (confirmed) params.set("email_verified", confirmed === "yes" ? "true" : "false");
  if (newsletter) params.set("newsletter_opt_in", "true");
  if (purpose) params.set("purpose", purpose);
  if (ordering) params.set("ordering", ordering);
  return params;
}
