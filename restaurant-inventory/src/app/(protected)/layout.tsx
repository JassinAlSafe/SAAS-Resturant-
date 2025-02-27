import { SidebarNavigation } from "@/components/layout/sidebar-navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarNavigation>{children}</SidebarNavigation>;
}
