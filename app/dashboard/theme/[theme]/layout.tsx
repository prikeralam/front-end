import type { Metadata } from "next";

// The theme page is a client component, so its title (the theme's name) is set here; its dataset pages keep the
// console suffix, which a plain string title here would drop.
export async function generateMetadata({ params }: LayoutProps<"/dashboard/theme/[theme]">): Promise<Metadata> {
  const { theme } = await params;
  return { title: { default: decodeURIComponent(theme), template: "%s | PRI Console" } };
}

export default function Layout({ children }: LayoutProps<"/dashboard/theme/[theme]">) {
  return children;
}
