import type { Metadata } from "next";
import type { ReactNode } from "react";

// Sign-in and visitor accounts; nothing here for search results.
export const metadata: Metadata = { title: "Your account", robots: { index: false, follow: false } };

export default function AccountLayout({ children }: { children: ReactNode }) {
  return children;
}
