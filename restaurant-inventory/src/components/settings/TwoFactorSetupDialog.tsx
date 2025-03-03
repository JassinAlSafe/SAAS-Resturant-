import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FiCheck, FiShield } from "react-icons/fi";

type TwoFactorSetupDialogProps = {
  onClose: () => void;
  onConfirm: (verificationCode: string) => Promise<boolean>;
};

export default function TwoFactorSetupDialog({
  onClose,
  onConfirm,
}: TwoFactorSetupDialogProps) {
  const [step, setStep] = useState<"intro" | "setup" | "verify" | "success">(
    "intro"
  );
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  // Generate a dummy secret key
  const secretKey = "ABCDEF123456";

  const handleVerify = async () => {
    if (!verificationCode) {
      setError("Please enter the verification code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      // In a real implementation, this would verify the code against the secret
      // For demo purposes, accept any 6-digit code
      const isValid =
        verificationCode.length === 6 && /^\d+$/.test(verificationCode);

      if (isValid) {
        const success = await onConfirm(verificationCode);
        if (success) {
          setStep("success");
        } else {
          setError("Could not verify the code. Please try again.");
        }
      } else {
        setError("Invalid code. Please enter a valid 6-digit code.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      {step === "intro" && (
        <>
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Two-factor authentication adds an extra layer of security to your
              account. Once configured, you'll need to enter a verification code
              from your authenticator app when signing in.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <FiShield className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Enhanced Security</p>
                <p className="text-sm text-slate-500">
                  Protect your account even if your password is compromised
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <FiCheck className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Easy to Use</p>
                <p className="text-sm text-slate-500">
                  Quick verification with any authenticator app like Google
                  Authenticator
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => setStep("setup")}>Continue</Button>
          </DialogFooter>
        </>
      )}

      {step === "setup" && (
        <>
          <DialogHeader>
            <DialogTitle>Scan the QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app (like Google
              Authenticator, Authy, or Microsoft Authenticator).
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-md bg-slate-100 p-2">
              {/* This would be a real QR code in production */}
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold">QR Code</div>
                <p className="text-sm text-slate-500">
                  (Placeholder for actual QR code)
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium">Manual setup code:</p>
              <code className="mt-1 block bg-slate-100 p-2 rounded text-sm tracking-wider">
                {secretKey}
              </code>
              <p className="mt-2 text-xs text-slate-500">
                If you can't scan the QR code, you can manually enter this code
                into your app.
              </p>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setStep("intro")}>
              Back
            </Button>
            <Button onClick={() => setStep("verify")}>Continue</Button>
          </DialogFooter>
        </>
      )}

      {step === "verify" && (
        <>
          <DialogHeader>
            <DialogTitle>Verify Your Setup</DialogTitle>
            <DialogDescription>
              Enter the 6-digit verification code from your authenticator app to
              confirm setup.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              placeholder="123456"
              className="mt-1 text-center tracking-widest"
            />

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setStep("setup")}>
              Back
            </Button>
            <Button
              onClick={handleVerify}
              disabled={isVerifying || verificationCode.length !== 6}
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </Button>
          </DialogFooter>
        </>
      )}

      {step === "success" && (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <FiCheck className="h-5 w-5" />
              Setup Complete!
            </DialogTitle>
            <DialogDescription>
              Two-factor authentication has been successfully enabled for your
              account.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">
                Your account is now protected with an additional layer of
                security. You'll need to enter a verification code from your
                authenticator app when signing in.
              </p>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium">Recovery Codes</p>
              <p className="mt-1 text-sm text-slate-500">
                We recommend saving recovery codes in a secure location in case
                you lose access to your authenticator app.
              </p>
              <Button className="mt-2" variant="outline" size="sm">
                Download Recovery Codes
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </>
      )}
    </DialogContent>
  );
}
