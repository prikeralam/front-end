import { Source_Serif_4, Source_Sans_3 } from "next/font/google";

export const headingFont = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const bodyFont = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
});
