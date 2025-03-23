"use client";

import { Suspense } from "react";
import { 
  AuthCallbackContent,
  LoadingVerification
} from "./components";

// Main export wrapped in Suspense
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingVerification />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
