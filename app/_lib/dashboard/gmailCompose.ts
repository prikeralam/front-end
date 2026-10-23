/** The Google Workspace mailbox staff reply from. */
export const OFFICE_MAILBOX = "office@priresearch.in";

/**
 * A Gmail compose window in the office mailbox, addressed and titled. `authuser` picks that account when the browser
 * is signed in to several; if it isn't signed in at all, Google asks to sign in to it first.
 */
export function gmailComposeUrl(to: string, subject = ""): string {
  const params = new URLSearchParams({ authuser: OFFICE_MAILBOX, view: "cm", fs: "1", to });
  if (subject) params.set("su", subject);
  return `https://mail.google.com/mail/?${params.toString()}`;
}
