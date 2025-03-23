"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { AuthCallbackHandler } from "./AuthCallbackHandler";
import { VerificationProcess } from "./VerificationProcess";
import { VerificationSuccessful } from "./VerificationSuccessful";
import { VerificationError } from "./VerificationError";

export function AuthCallbackContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { toast } = useToast();

  const handleResendConfirmation = async () => {
    if (!email || email.trim() === "") {
      toast({
        title: "Email Required",
        description:
          "Please enter your email address to resend the verification.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsResending(true);
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Error resending confirmation:", error);
        toast({
          title: "Failed to Resend",
          description:
            error.message ||
            "Failed to resend verification email. Please try again.",
          variant: "destructive",
        });
      } else {
        setResendSuccess(true);
        toast({
          title: "Verification Email Sent",
          description: "A new verification email has been sent to your inbox.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Unexpected error resending confirmation:", error);
      toast({
        title: "Failed to Resend",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Email Verification
        </h1>

        {/* Invisible handler component that processes the verification */}
        <AuthCallbackHandler
          setIsLoading={setIsLoading}
          setIsSuccess={setIsSuccess}
          setError={setError}
          setEmail={setEmail}
          isLoading={isLoading}
        />

        {/* Conditional rendering based on state */}
        {isLoading && <VerificationProcess />}

        {!isLoading && isSuccess && (
          <VerificationSuccessful redirectPath="/dashboard" />
        )}

        {!isLoading && !isSuccess && (
          <VerificationError
            errorMessage={error}
            email={email}
            setEmail={setEmail}
            isResending={isResending}
            setIsResending={setIsResending}
            resendSuccess={resendSuccess}
            setResendSuccess={setResendSuccess}
            onResendConfirmation={handleResendConfirmation}
          />
        )}
      </div>
    </div>
  );
}

export default AuthCallbackContent;
