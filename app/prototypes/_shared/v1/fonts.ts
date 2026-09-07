import { Newsreader, Inter } from "next/font/google";

export const headingFont = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-heading",
});

export const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});
