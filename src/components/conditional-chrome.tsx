"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AnnouncementBar } from "@/components/marketing/announcement-bar";
import { StickyCTABar } from "@/components/marketing/sticky-cta-bar";

export function ConditionalChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const bare = pathname?.startsWith("/admin") || pathname?.startsWith("/studio");

  if (bare) {
    return <>{children}</>;
  }

  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <StickyCTABar />
    </>
  );
}
