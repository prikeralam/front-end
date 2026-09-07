import Header from "./_ui/Header";
import Footer from "./_ui/Footer";
import { headingFont, bodyFont, monoFont } from "./fonts";

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable} flex min-h-screen flex-col bg-white font-[family-name:var(--font-body)] text-[#22263a]`}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
