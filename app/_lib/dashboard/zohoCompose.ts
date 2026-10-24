/** The Zoho Mail mailbox staff reply from (Zoho's India data centre). */
export const OFFICE_MAILBOX = "office@priresearch.in";

/**
 * A new Zoho Mail message, addressed and titled. This is the URL Zoho registers as the browser's mailto handler, so it
 * works without that setup; signed out, Zoho asks to sign in first and then opens the draft.
 */
export function zohoComposeUrl(to: string, subject = ""): string {
  const mailto = `mailto:${to}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
  return `https://mail.zoho.in/zm/comp.do?ct=${encodeURIComponent(mailto)}`;
}
