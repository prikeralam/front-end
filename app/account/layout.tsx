import type { Metadata } from "next";
import type { ReactNode } from "react";

// The sign-in page is for staff; it has nothing for search results.
export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default function AccountLayout({ children }: { children: ReactNode }) {
  return children;
}
