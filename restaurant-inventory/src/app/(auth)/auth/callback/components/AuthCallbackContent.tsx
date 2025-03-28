"use client";

import { useReducer, useCallback, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/browser-client";
import { AuthCallbackHandler } from "./AuthCallbackHandler";
import { VerificationProcess } from "./VerificationProcess";
import { VerificationSuccessful } from "./VerificationSuccessful";
import { VerificationError } from "./VerificationError";
import { useAnalytics } from "./useAnalytics";

// State interface
interface VerificationState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  email: string;
  isResending: boolean;
  resendSuccess: boolean;
}

// Action types
type VerificationAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SUCCESS"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_EMAIL"; payload: string }
  | { type: "RESEND_START" }
  | { type: "RESEND_SUCCESS" }
  | { type: "RESEND_ERROR" }
  | { type: "RESET_RESEND" };

// Initial state
const initialState: VerificationState = {
  isLoading: true,
  isSuccess: false,
  error: null,
  email: "",
  isResending: false,
  resendSuccess: false,
};

// Reducer function
function verificationReducer(
  state: VerificationState,
  action: VerificationAction
): VerificationState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_SUCCESS":
      return { ...state, isSuccess: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    case "RESEND_START":
      return { ...state, isResending: true, resendSuccess: false };
    case "RESEND_SUCCESS":
      return { ...state, isResending: false, resendSuccess: true };
    case "RESEND_ERROR":
      return { ...state, isResending: false, resendSuccess: false };
    case "RESET_RESEND":
      return { ...state, resendSuccess: false };
    default:
      return state;
  }
}

/**
 * AuthCallbackContent Component
 *
 * Manages the state and UI flow for email verification
 */
export function AuthCallbackContent() {
  const [state, dispatch] = useReducer(verificationReducer, initialState);
  const { toast } = useToast();
  const analytics = useAnalytics(); // Assumed analytics hook
  const reportedErrors = useRef(new Set());

  // Memoized state setter functions
  const setIsLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: isLoading });
  }, []);

  const setIsSuccess = useCallback((isSuccess: boolean) => {
    dispatch({ type: "SET_SUCCESS", payload: isSuccess });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  const setEmail = useCallback((email: string) => {
    dispatch({ type: "SET_EMAIL", payload: email });
  }, []);

  const setIsResending = useCallback((isResending: boolean) => {
    if (isResending) {
      dispatch({ type: "RESEND_START" });
    } else {
      // Don't set resendSuccess here, let the specific success/error actions handle it
      dispatch({ type: "RESEND_ERROR" });
    }
  }, []);

  const setResendSuccess = useCallback((resendSuccess: boolean) => {
    if (resendSuccess) {
      dispatch({ type: "RESEND_SUCCESS" });
    } else {
      dispatch({ type: "RESET_RESEND" });
    }
  }, []);

  // Email validation helper
  const validateEmail = useCallback(
    (email: string): boolean => {
      if (!email || email.trim() === "") {
        toast({
          title: "Email Required",
          description:
            "Please enter your email address to resend the verification.",
          variant: "destructive",
        });
        return false;
      }
      return true;
    },
    [toast]
  );

  // Handle resend email confirmation
  const handleResendConfirmation = useCallback(async () => {
    if (!validateEmail(state.email)) return;

    const supabase = createClient();
    dispatch({ type: "RESEND_START" });

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: state.email.trim(),
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
        dispatch({ type: "RESEND_ERROR" });
        analytics.trackEvent("Email_Verification_Resend_Failed", {
          error: error.message,
        });
      } else {
        dispatch({ type: "RESEND_SUCCESS" });
        toast({
          title: "Verification Email Sent",
          description: "A new verification email has been sent to your inbox.",
          variant: "default",
        });
        analytics.trackEvent("Email_Verification_Resend_Success");
      }
    } catch (error) {
      console.error("Unexpected error resending confirmation:", error);
      toast({
        title: "Failed to Resend",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      dispatch({ type: "RESEND_ERROR" });
      analytics.trackEvent("Email_Verification_Resend_Exception", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, [state.email, toast, analytics, validateEmail]);

  // Track verification success
  useEffect(() => {
    if (state.isSuccess) {
      analytics.trackEvent("Email_Verification_Success");
    }
  }, [state.isSuccess, analytics]);

  // Track verification errors
  useEffect(() => {
    if (
      state.error &&
      !state.isLoading &&
      !reportedErrors.current.has(state.error)
    ) {
      reportedErrors.current.add(state.error);
      analytics.trackEvent("Email_Verification_Error", { error: state.error });
    }
  }, [state.error, state.isLoading, analytics]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Email Verification
        </h1>

        {/* Auth callback handler - processes verification but doesn't render anything */}
        <AuthCallbackHandler
          setIsLoading={setIsLoading}
          setIsSuccess={setIsSuccess}
          setError={setError}
          setEmail={setEmail}
          isLoading={state.isLoading}
        />

        {/* Conditional UI rendering based on verification state */}
        {state.isLoading && <VerificationProcess />}

        {!state.isLoading && state.isSuccess && (
          <VerificationSuccessful redirectPath="/dashboard" />
        )}

        {!state.isLoading && !state.isSuccess && (
          <VerificationError
            errorMessage={state.error}
            email={state.email}
            setEmail={setEmail}
            isResending={state.isResending}
            setIsResending={setIsResending}
            resendSuccess={state.resendSuccess}
            setResendSuccess={setResendSuccess}
            onResendConfirmation={handleResendConfirmation}
          />
        )}
      </div>
    </div>
  );
}

export default AuthCallbackContent;
