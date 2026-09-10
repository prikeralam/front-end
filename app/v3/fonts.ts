import { Source_Serif_4, Source_Sans_3 } from "next/font/google";

// TODO: brand font is Gilroy-SemiBold. Swap this to next/font/local once the
// real .woff2 file is supplied (e.g. app/fonts/Gilroy-SemiBold.woff2) —
// switching now with no file present would break the build.
export const headingFont = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const bodyFont = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
});
