import type { Metadata } from "next";
import { DM_Sans, Fraunces, Inter } from "next/font/google";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import "./globals.css";
import { ConditionalChrome } from "@/components/conditional-chrome";
import { DisableDraftMode } from "@/components/disable-draft-mode";
import { MetaPixel } from "@/components/meta-pixel";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  /* Include opsz so we can pin optical size in CSS (avoids “display” extremes at large sizes). */
  axes: ["WONK", "SOFT", "opsz"],
});

/** Inter for large subheads (better f/J at display sizes than body DM Sans). */
const interLead = Inter({
  variable: "--font-lead",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "Nature-Based Occupational Therapy Groups for Kids in Dallas-Fort Worth | TreeTots DFW",
  description:
    "Nature-based occupational therapy groups and services for children in Dallas-Fort Worth. Supporting sensory regulation, motor confidence, emotional regulation, social participation, and everyday skills through outdoor, play-based OT.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${fraunces.variable} ${interLead.variable}`}
    >
      <body
        className={`${dmSans.className} min-h-screen flex flex-col antialiased text-[17px] leading-relaxed text-forest`}
      >
        <MetaPixel pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID} />
        <ConditionalChrome>{children}</ConditionalChrome>
        {(await draftMode()).isEnabled && (
          <>
            <VisualEditing />
            <DisableDraftMode />
          </>
        )}
      </body>
    </html>
  );
}
