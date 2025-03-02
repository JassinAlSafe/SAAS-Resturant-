import { useState } from "react";
import { PaymentMethod } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FiCreditCard, FiPlus, FiTrash2, FiCheck } from "react-icons/fi";
import { subscriptionService } from "@/lib/services/subscription-service";
import { useNotificationHelpers } from "@/lib/notification-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[];
  userId: string;
  onPaymentMethodsChange: (updatedPaymentMethods: PaymentMethod[]) => void;
}

export function PaymentMethods({
  paymentMethods,
  userId,
  onPaymentMethodsChange,
}: PaymentMethodsProps) {
  const { success, error } = useNotificationHelpers();
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [paymentMethodToDelete, setPaymentMethodToDelete] =
    useState<PaymentMethod | null>(null);

  // New payment method form state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvc, setCvc] = useState("");
  const [isDefault, setIsDefault] = useState(paymentMethods.length === 0);

  // Handle adding a new payment method
  const handleAddPaymentMethod = async () => {
    // Basic validation
    if (!cardName || !cardNumber || !expiryMonth || !expiryYear || !cvc) {
      error("Missing Information", "Please fill in all fields.");
      return;
    }

    if (cardNumber.length < 13 || cardNumber.length > 19) {
      error("Invalid Card Number", "Please enter a valid card number.");
      return;
    }

    if (cvc.length < 3 || cvc.length > 4) {
      error("Invalid CVC", "Please enter a valid CVC code.");
      return;
    }

    setIsLoading(true);
    try {
      // Determine card brand based on first digit (simplified)
      let brand = "Unknown";
      const firstDigit = cardNumber.charAt(0);
      if (firstDigit === "4") brand = "Visa";
      else if (firstDigit === "5") brand = "Mastercard";
      else if (firstDigit === "3") brand = "American Express";
      else if (firstDigit === "6") brand = "Discover";

      await subscriptionService.addPaymentMethod(userId, {
        type: "card",
        isDefault,
        lastFour: cardNumber.slice(-4),
        expiryMonth: parseInt(expiryMonth),
        expiryYear: parseInt(expiryYear),
        brand,
        name: cardName,
      });

      success(
        "Payment Method Added",
        "Your payment method has been added successfully."
      );

      // Reset form
      setCardName("");
      setCardNumber("");
      setExpiryMonth("");
      setExpiryYear("");
      setCvc("");
      setIsDefault(false);

      // Close dialog and refresh payment methods
      setIsAddDialogOpen(false);
      onPaymentMethodsChange(paymentMethods);
    } catch (err) {
      console.error("Error adding payment method:", err);
      error(
        "Failed to Add Payment Method",
        "There was a problem adding your payment method. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle setting a payment method as default
  const handleSetDefault = async (paymentMethodId: string) => {
    setIsLoading(true);
    try {
      await subscriptionService.updatePaymentMethod(userId, paymentMethodId, {
        isDefault: true,
      });

      success(
        "Default Payment Method Updated",
        "Your default payment method has been updated."
      );

      onPaymentMethodsChange(paymentMethods);
    } catch (err) {
      console.error("Error updating payment method:", err);
      error(
        "Update Failed",
        "There was a problem updating your payment method. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a payment method
  const handleDeletePaymentMethod = async () => {
    if (!paymentMethodToDelete) return;

    setIsLoading(true);
    try {
      await subscriptionService.deletePaymentMethod(
        userId,
        paymentMethodToDelete.id
      );

      success(
        "Payment Method Removed",
        "Your payment method has been removed successfully."
      );

      setIsDeleteDialogOpen(false);
      setPaymentMethodToDelete(null);
      onPaymentMethodsChange(paymentMethods);
    } catch (err) {
      console.error("Error deleting payment method:", err);
      error(
        "Deletion Failed",
        "There was a problem removing your payment method. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Get card icon based on brand
  const getCardIcon = (brand: string) => {
    // In a real app, you might use different icons for different card brands
    return <FiCreditCard className="h-5 w-5" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>
          Manage your payment methods for subscription billing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Payment methods list */}
          {paymentMethods.length > 0 ? (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`flex items-center justify-between p-4 rounded-md border ${
                    method.isDefault ? "bg-primary/5 border-primary" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getCardIcon(method.brand || "")}
                    <div>
                      <div className="font-medium">
                        {method.brand} •••• {method.lastFour}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Expires {method.expiryMonth}/{method.expiryYear} •{" "}
                        {method.name}
                      </div>
                    </div>
                    {method.isDefault && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                        disabled={isLoading}
                      >
                        <FiCheck className="mr-1 h-4 w-4" />
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600"
                      onClick={() => {
                        setPaymentMethodToDelete(method);
                        setIsDeleteDialogOpen(true);
                      }}
                      disabled={isLoading}
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No payment methods found. Add a payment method to manage your
              subscription.
            </div>
          )}

          {/* Add payment method button */}
          <Button onClick={() => setIsAddDialogOpen(true)} disabled={isLoading}>
            <FiPlus className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
        </div>
      </CardContent>

      {/* Add Payment Method Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Add a new credit or debit card for subscription payments.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="card-name">Name on Card</Label>
              <Input
                id="card-name"
                placeholder="John Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <div className="relative">
                <FiCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  className="pl-10"
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(formatCardNumber(e.target.value))
                  }
                  maxLength={19}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry-month">Month</Label>
                <Input
                  id="expiry-month"
                  placeholder="MM"
                  value={expiryMonth}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (parseInt(value) > 12) return;
                    setExpiryMonth(value);
                  }}
                  maxLength={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry-year">Year</Label>
                <Input
                  id="expiry-year"
                  placeholder="YY"
                  value={expiryYear}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setExpiryYear(value);
                  }}
                  maxLength={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  value={cvc}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setCvc(value);
                  }}
                  maxLength={4}
                />
              </div>
            </div>

            <div className="pt-2">
              <RadioGroup
                defaultValue={isDefault ? "default" : "not-default"}
                onValueChange={(value) => setIsDefault(value === "default")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="default" id="default" />
                  <Label htmlFor="default">Set as default payment method</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleAddPaymentMethod} disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Payment Method"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Payment Method Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method?
              {paymentMethodToDelete?.isDefault && (
                <div className="mt-2 font-medium text-red-600">
                  This is your default payment method. Another payment method
                  will be set as default if available.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePaymentMethod}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {isLoading ? "Removing..." : "Remove Payment Method"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
