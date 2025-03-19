"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <EmailVerificationBanner />
      <Sidebar>{children}</Sidebar>
    </AuthGuard>
  );
}
