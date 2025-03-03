import { SidebarNavigation } from "@/components/layout/sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarNavigation>{children}</SidebarNavigation>;
}
