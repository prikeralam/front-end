import { CONTACT_CATEGORIES, type ContactCategory } from "../contact/contactTypes";
import type { components } from "./schema";

export type ApiContactMessage = components["schemas"]["ContactMessage"];

export type InboxStatus = "new" | "handled";

export type InboxMessage = {
  id: number;
  category: ContactCategory;
  name: string;
  email: string;
  message: string;
  status: InboxStatus;
  createdAt: string;
  handledAt: string | null;
  handledBy: number | null;
};

export function toInboxMessage(m: ApiContactMessage): InboxMessage {
  return {
    id: m.id,
    category: (CONTACT_CATEGORIES as readonly string[]).includes(m.category) ? (m.category as ContactCategory) : "general",
    name: m.name,
    email: m.email,
    message: m.message,
    status: m.status === "handled" ? "handled" : "new",
    createdAt: m.created_at,
    handledAt: m.handled_at ?? null,
    handledBy: m.handled_by ?? null,
  };
}
