import type { Metadata } from "next";
import "./globals.css";
import Header from "./_ui/Header";
import Footer from "./_ui/Footer";
import ScrollReveal from "./_ui/ScrollReveal";
import SiteUpdatedNotice from "./_ui/SiteUpdatedNotice";
import { headingFont, bodyFont, monoFont } from "./fonts";
import { DEFAULT_DESCRIPTION, DEFAULT_SHARE_IMAGE, SITE_NAME, SITE_URL } from "./_lib/seo";

export const metadata: Metadata = {
  // Canonical links and share images resolve against the production domain, whichever environment serves the page.
  metadataBase: new URL(SITE_URL),
  // Pages that set a title show "<title> | Policy and Research Initiative"; the homepage sets its own in full.
  title: { default: `${SITE_NAME} (PRI)`, template: `%s | ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: { siteName: SITE_NAME, locale: "en_IN", type: "website", images: [DEFAULT_SHARE_IMAGE] },
  twitter: { card: "summary_large_image", images: [DEFAULT_SHARE_IMAGE] },
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
        <SiteUpdatedNotice />
      </body>
    </html>
  );
}
