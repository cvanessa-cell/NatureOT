"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function ConditionalChrome({
  children,
  announcement,
  header,
  footer,
  sticky,
}: {
  children: ReactNode;
  announcement: ReactNode;
  header: ReactNode;
  footer: ReactNode;
  sticky: ReactNode;
}) {
  const pathname = usePathname();
  const bare = pathname?.startsWith("/admin") || pathname?.startsWith("/studio");

  if (bare) {
    return <>{children}</>;
  }

  return (
    <>
      {announcement}
      {header}
      <main className="flex-1 pb-24 md:pb-20">{children}</main>
      {footer}
      {sticky}
    </>
  );
}
