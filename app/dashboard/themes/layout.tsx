import type { Metadata } from "next";

// The page is a client component, so its title is set here.
export const metadata: Metadata = { title: "Themes" };

export default function Layout({ children }: LayoutProps<"/dashboard/themes">) {
  return children;
}
