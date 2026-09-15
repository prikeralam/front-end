import { Public_Sans, IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";

export const headingFont = localFont({
  src: [
    { path: "../fonts/GILROY-SEMIBOLD.ttf", weight: "600", style: "normal" },
    { path: "../fonts/GILROY-SEMIBOLDITALIC.ttf", weight: "600", style: "italic" },
  ],
  variable: "--font-heading",
  fallback: ["ui-sans-serif", "system-ui", "Arial", "sans-serif"],
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
