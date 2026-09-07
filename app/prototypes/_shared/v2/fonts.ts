import { Public_Sans, IBM_Plex_Mono } from "next/font/google";

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
