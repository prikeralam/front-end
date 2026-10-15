import type { Metadata } from "next";
import DashboardShell from "./_ui/DashboardShell";

// Each page sets its own title (e.g. "Visitors"), so several open console tabs can be told apart.
export const metadata: Metadata = {
  title: { absolute: "Overview | PRI Console", template: "%s | PRI Console" },
};

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return <DashboardShell>{children}</DashboardShell>;
}
