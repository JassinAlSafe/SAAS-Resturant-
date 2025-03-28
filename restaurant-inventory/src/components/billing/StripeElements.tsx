"use client";

import { useState, useEffect } from "react";
import {
  CardElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

// Initialize Stripe outside of the component to prevent multiple instances
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Card Element styles
const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#EF4444",
      iconColor: "#EF4444",
    },
  },
  hidePostalCode: true,
};

// Embedded form component
interface PaymentFormProps {
  clientSecret: string;
  planName: string;
  interval: "monthly" | "yearly";
  price: number;
  currency: string;
  onSuccess: (paymentIntent: any) => void;
  onCancel: () => void;
}

function PaymentForm({
  clientSecret,
  planName,
  interval,
  price,
  currency,
  onSuccess,
  onCancel,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  useEffect(() => {
    if (!stripe || !clientSecret) {
      return;
    }
  }, [stripe, clientSecret]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        setError(error.message || "An error occurred with your payment");
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        setProcessing(false);
        onSuccess(paymentIntent);
      } else {
        setError("Unexpected payment status");
        setProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: currency || "SEK",
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>Subscribe to {planName}</CardTitle>
          <CardDescription>
            {formatCurrency(price)} / {interval}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Details
            </label>
            <div className="p-3 border rounded-md">
              <CardElement
                options={cardElementOptions}
                onChange={(e) => {
                  setError(e.error ? e.error.message : null);
                  setCardComplete(e.complete);
                }}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={processing || !cardComplete || !stripe}
            className="bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white rounded-full"
          >
            {processing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Subscribe Now"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

// Main wrapper component for Stripe Elements
interface StripeElementsProps {
  clientSecret: string | null;
  planName: string;
  interval: "monthly" | "yearly";
  price: number;
  currency: string;
  onSuccess: (paymentIntent: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function StripePaymentWrapper({
  clientSecret,
  planName,
  interval,
  price,
  currency,
  onSuccess,
  onCancel,
  isLoading,
}: StripeElementsProps) {
  if (isLoading) {
    return (
      <Card className="border-none shadow-md">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  if (!clientSecret) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Unable to initialize payment. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        clientSecret={clientSecret}
        planName={planName}
        interval={interval}
        price={price}
        currency={currency}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
}
