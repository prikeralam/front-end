import { Suspense } from "react";
import AccountsScreen from "../_ui/AccountsScreen";

// Self-registered visitors: sign-up answers, downloads, and CSV exports for the team and the newsletter.
export default function VisitorsPage() {
  return (
    <Suspense>
      <AccountsScreen kind="visitor" />
    </Suspense>
  );
}
