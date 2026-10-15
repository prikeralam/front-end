import type { Metadata } from "next";
import { Suspense } from "react";
import AccountsScreen from "../_ui/AccountsScreen";

export const metadata: Metadata = { title: "Visitors" };

// Self-registered visitors: sign-up answers, downloads, and CSV exports for the team and the newsletter.
export default function VisitorsPage() {
  return (
    <Suspense>
      <AccountsScreen kind="visitor" />
    </Suspense>
  );
}
