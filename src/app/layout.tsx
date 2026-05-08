import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { ConditionalChrome } from "@/components/conditional-chrome";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nature OT Growth OS | Texas nature-based pediatric OT groups",
  description:
    "Growth automation for nature-based pediatric occupational therapy in Texas — educational tools, waitlist, and operational workflows. Not a clinical record system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body
        className={`${dmSans.className} min-h-screen flex flex-col antialiased text-[17px] leading-relaxed text-forest`}
      >
        <ConditionalChrome>{children}</ConditionalChrome>
      </body>
    </html>
  );
}
