import type { Metadata } from "next";

// The page is a client component, so its title is set here.
export const metadata: Metadata = { title: "Messages" };

export default function Layout({ children }: LayoutProps<"/dashboard/inbox">) {
  return children;
}
