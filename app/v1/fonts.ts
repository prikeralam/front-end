import { Newsreader, Inter } from "next/font/google";

// TODO: brand font is Gilroy-SemiBold. Swap this to next/font/local once the
// real .woff2 file is supplied (e.g. app/fonts/Gilroy-SemiBold.woff2) —
// switching now with no file present would break the build.
export const headingFont = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-heading",
});

export const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});
