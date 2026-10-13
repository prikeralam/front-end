/** What visitors are asked at sign-up; the values match the backend's `Purpose` choices. */
export const PURPOSES = [
  { value: "research", label: "Research" },
  { value: "journalism", label: "Journalism" },
  { value: "policy", label: "Policy or government" },
  { value: "teaching", label: "Teaching or study" },
  { value: "business", label: "Business" },
  { value: "personal", label: "Personal interest" },
  { value: "other", label: "Other" },
] as const;

export type Purpose = (typeof PURPOSES)[number]["value"];

export type SignupInput = {
  name: string;
  email: string;
  password: string;
  organisation: string;
  purpose: Purpose;
  newsletter: boolean;
  /** Where the confirmation link should bring the visitor back to, e.g. the dataset they wanted. */
  next: string;
};

const SAFE_NEXT = /^\/(?!\/)[A-Za-z0-9/_-]{0,200}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A path on this site to return to, or "" (the confirmation link is built from it, so nothing else may pass). */
export function safeNext(path: unknown): string {
  return typeof path === "string" && SAFE_NEXT.test(path) ? path : "";
}

/** "Asha K Menon" -> first "Asha", last "K Menon"; the backend stores the two separately. */
export function splitName(name: string): { first_name: string; last_name: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return { first_name: parts[0] ?? "", last_name: parts.slice(1).join(" ") };
}

export type SignupErrors = Partial<Record<"name" | "email" | "password" | "organisation" | "purpose" | "terms", string>>;

/** Checks a sign-up before it is sent, with messages for each field. Empty when everything is fine. */
export function validateSignup(input: Partial<Record<keyof SignupInput, unknown>> & { terms?: unknown }): SignupErrors {
  const errors: SignupErrors = {};
  const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  if (!text(input.name)) errors.name = "Enter your name.";
  else if (text(input.name).length > 150) errors.name = "Keep your name under 150 characters.";
  if (!EMAIL.test(text(input.email)) || text(input.email).length > 150) errors.email = "Enter a valid email address.";
  if (typeof input.password !== "string" || input.password.length < 8) errors.password = "Use at least 8 characters.";
  else if (input.password.length > 128) errors.password = "Use 128 characters or fewer.";
  if (text(input.organisation).length > 200) errors.organisation = "Keep this under 200 characters.";
  if (!PURPOSES.some((p) => p.value === input.purpose)) errors.purpose = "Choose what you'll use the data for.";
  if (input.terms !== undefined && input.terms !== true) errors.terms = "Please agree to the terms of use and privacy policy.";
  return errors;
}
