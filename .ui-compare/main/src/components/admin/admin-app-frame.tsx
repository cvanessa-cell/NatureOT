"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

export function AdminAppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/admin";

  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-cream">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-forest">
      <div className="flex min-h-screen">
        <AdminSidebar activePath={pathname} />
        <div className="flex min-h-screen flex-1 flex-col">
          <AdminMobileNav />
          <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
