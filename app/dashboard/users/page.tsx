import type { Metadata } from "next";
import { Suspense } from "react";
import AccountsScreen from "../_ui/AccountsScreen";

export const metadata: Metadata = { title: "Users & roles" };

// Staff accounts only; visitors who signed up to download data have their own screen (/dashboard/visitors).
export default function UsersPage() {
  return (
    <Suspense>
      <AccountsScreen kind="staff" />
    </Suspense>
  );
}
