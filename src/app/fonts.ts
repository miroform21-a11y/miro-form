import { Noto_Sans, Unbounded } from "next/font/google";
import localFont from "next/font/local";

/** Site fonts, shared by the root layouts (Ukrainian site, /en) and the global 404. */

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  // Variable font: all weights 200–900 (static weights render the same; intermediate ones are available)
  variable: "--font-unbounded",
  display: "swap",
});

const noto = Noto_Sans({
  subsets: ["latin", "cyrillic"],
  variable: "--font-noto",
  display: "swap",
});

const pressStart = localFont({
  src: "../../public/fonts/PressStart2P.ttf",
  variable: "--font-press-start",
  display: "swap",
});

/** Class names for <html> that define the font CSS variables */
export const fontVariables = `${unbounded.variable} ${noto.variable} ${pressStart.variable}`;
