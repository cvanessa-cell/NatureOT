import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import "./globals.css";
import { AnnouncementBar } from "@/components/marketing/announcement-bar";
import { StickyCTABar } from "@/components/marketing/sticky-cta-bar";
import { ConditionalChrome } from "@/components/conditional-chrome";
import { DisableDraftMode } from "@/components/disable-draft-mode";
import { MetaPixel } from "@/components/meta-pixel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { UiCompareScrollBridge } from "@/components/ui-compare-scroll-bridge";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title:
    "Nature-Based Occupational Therapy Groups for Kids in Dallas-Fort Worth | TreeTots DFW",
  description:
    "Nature-based occupational therapy groups and services for children in Dallas-Fort Worth. Supporting sensory regulation, motor confidence, emotional regulation, social participation, and everyday skills through outdoor, play-based OT.",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg",
  },
  openGraph: {
    title: "TreeTots DFW | Nature-Based Pediatric OT",
    description:
      "Therapist-led outdoor occupational therapy groups and parent-friendly next steps for Dallas-Fort Worth families.",
    images: [
      {
        url: "/opengraph-image.svg",
        width: 1200,
        height: 630,
        alt: "TreeTots DFW nature-based pediatric occupational therapy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TreeTots DFW | Nature-Based Pediatric OT",
    description:
      "Therapist-led outdoor occupational therapy groups and parent-friendly next steps for Dallas-Fort Worth families.",
    images: ["/opengraph-image.svg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${lora.variable}`}
      data-scroll-behavior="smooth"
    >
      <body
        className={`${inter.className} min-h-screen flex flex-col antialiased text-[17px] leading-relaxed text-forest`}
      >
        <MetaPixel pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID} />
        <UiCompareScrollBridge />
        <ConditionalChrome
          announcement={<AnnouncementBar />}
          header={<SiteHeader />}
          footer={<SiteFooter />}
          sticky={<StickyCTABar />}
        >
          {children}
        </ConditionalChrome>
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
