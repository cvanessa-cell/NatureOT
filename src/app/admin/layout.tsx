import { AdminAppFrame } from "@/components/admin/admin-app-frame";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAppFrame>{children}</AdminAppFrame>;
}
