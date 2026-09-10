import { Public_Sans, IBM_Plex_Mono } from "next/font/google";

// TODO: brand font is Gilroy-SemiBold. Swap this to next/font/local once the
// real .woff2 file is supplied (e.g. app/fonts/Gilroy-SemiBold.woff2) —
// switching now with no file present would break the build.
export const headingFont = Public_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const bodyFont = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-mono",
});
