/** What a contact message can be about, as the backend names them, with the labels the form shows. */
export const CONTACT_CATEGORIES = ["general", "collaboration", "data_request"] as const;
export type ContactCategory = (typeof CONTACT_CATEGORIES)[number];
export const contactCategoryLabels: Record<ContactCategory, string> = {
  general: "General Enquiry",
  collaboration: "Collaboration",
  data_request: "Data Request",
};

export type ContactField = "category" | "name" | "email" | "message";
export type ContactInput = { category: string; name: string; email: string; message: string; website?: string };
export type ContactResult = { ok: true } | { ok: false; message: string; fieldErrors?: Partial<Record<ContactField, string>> };
