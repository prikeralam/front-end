import type { Metadata } from "next";
import "./globals.css";
import Header from "./_ui/Header";
import Footer from "./_ui/Footer";
import ScrollReveal from "./_ui/ScrollReveal";
import { headingFont, bodyFont, monoFont } from "./fonts";

export const metadata: Metadata = {
  // The tab reads "PRI"; a page that sets its own title shows it as "<title> | PRI".
  title: { default: "PRI", template: "%s | PRI" },
  description: "The public website and research platform for the Policy and Research Initiative (PRI).",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable} flex min-h-screen flex-col bg-[#f7f8fc] font-[family-name:var(--font-body)] text-[#22263a]`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ScrollReveal />
      </body>
    </html>
  );
}
