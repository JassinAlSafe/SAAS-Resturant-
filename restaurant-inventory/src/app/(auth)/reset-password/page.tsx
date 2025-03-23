"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FiArrowLeft, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <ResetPasswordForm />
      </div>
    </div>
  );
}

// Create a separate component that uses searchParams
function ResetPasswordForm() {
  const router = useRouter();
  const { updatePassword } = useAuth();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get the token from the URL
  const [token, setToken] = useState<string | null>(null);

  const TokenHandler = () => {
    const searchParams = useSearchParams();
    
    useEffect(() => {
      const token = searchParams.get("token");
      setToken(token);
    }, [searchParams]);
    
    return null;
  };

  useEffect(() => {
    if (!token) {
      setErrorMessage("No reset token found. Please request a new password reset link.");
    } else {
      setErrorMessage(null);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters");
      return;
    }

    if (!token) {
      setErrorMessage("No reset token found. Please request a new password reset link.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await updatePassword(token, password);
      setSuccess(true);
      toast({
        title: "Password Reset Successful",
        description: "Your password has been reset successfully. You can now log in with your new password.",
        variant: "default",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      console.error("Password reset error:", error);
      setErrorMessage(error.message || "Failed to reset password. The token may be invalid or expired.");
      toast({
        title: "Password Reset Failed",
        description: error.message || "Failed to reset password. The token may be invalid or expired.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription>Enter a new password for your account</CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <FiAlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {success ? (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <FiCheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success</AlertTitle>
              <AlertDescription className="text-green-700">
                Your password has been reset successfully. Redirecting to login...
              </AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => router.push("/login")}
                className="mt-2"
              >
                Go to Login
              </Button>
            </div>
          </div>
        ) : (
          <Suspense fallback={null}>
            <TokenHandler />
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  disabled={isLoading || !token}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder=""
                  disabled={isLoading || !token}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || !token}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Resetting Password...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </Button>

              <div className="text-center mt-4">
                <Link
                  href="/login"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center"
                >
                  <FiArrowLeft className="mr-1 h-3 w-3" />
                  Back to Login
                </Link>
              </div>
            </form>
          </Suspense>
        )}
      </CardContent>
    </Card>
  );
}
