import {
    SubscriptionPlan,
    Subscription,
    PaymentMethod,
    Invoice,
    InvoiceItem
} from "@/lib/types";
import { CurrencyCode } from "@/lib/currency-context";

// Mock subscription plans
const mockSubscriptionPlans: SubscriptionPlan[] = [
    {
        id: "plan_basic",
        name: "Basic",
        description: "Perfect for small restaurants just getting started",
        features: [
            "Up to 500 inventory items",
            "Basic reporting",
            "1 user account",
            "Email support"
        ],
        monthlyPrice: 29.99,
        yearlyPrice: 299.99,
        price: 299.99,  // Default to yearly price
        interval: "yearly",
        currency: "USD",
        isPopular: false,
        priority: 1
    },
    {
        id: "plan_pro",
        name: "Professional",
        description: "Ideal for growing restaurants with more needs",
        features: [
            "Unlimited inventory items",
            "Advanced reporting & analytics",
            "Up to 5 user accounts",
            "Priority email support",
            "Menu planning tools",
            "Supplier management"
        ],
        monthlyPrice: 59.99,
        yearlyPrice: 599.99,
        price: 599.99,  // Default to yearly price
        interval: "yearly",
        currency: "USD",
        isPopular: true,
        priority: 2
    },
    {
        id: "plan_enterprise",
        name: "Enterprise",
        description: "For restaurant chains and large operations",
        features: [
            "Everything in Professional",
            "Unlimited user accounts",
            "Multi-location support",
            "API access",
            "Dedicated account manager",
            "Custom integrations",
            "24/7 phone support"
        ],
        monthlyPrice: 119.99,
        yearlyPrice: 1199.99,
        price: 1199.99,  // Default to yearly price
        interval: "yearly",
        currency: "USD",
        isPopular: false,
        priority: 3
    }
];

// Mock subscription data
const mockSubscription: Subscription = {
    id: "sub_123456",
    userId: "user_123",
    planId: "plan_pro",
    status: "active",
    currentPeriodStart: new Date("2023-01-01").toISOString(),
    currentPeriodEnd: new Date("2023-12-31").toISOString(),
    cancelAtPeriodEnd: false,
    createdAt: new Date("2023-01-01").toISOString(),
    updatedAt: new Date("2023-01-01").toISOString(),
    billingInterval: "yearly",
    trialEnd: null,
    pausedAt: null,
    resumesAt: null,
    plan: {
        id: "plan_pro",
        name: "Professional",
        description: "Ideal for growing restaurants with more needs",
        features: [
            "Unlimited inventory items",
            "Advanced reporting & analytics",
            "Up to 5 user accounts",
            "Priority email support",
            "Menu planning tools",
            "Supplier management"
        ],
        monthlyPrice: 59.99,
        yearlyPrice: 599.99,
        price: 599.99,
        interval: "yearly",
        currency: "USD",
        isPopular: true,
        priority: 2
    }
};

// Mock payment methods
const mockPaymentMethods: PaymentMethod[] = [
    {
        id: "pm_123456",
        userId: "user_123",
        type: "card",
        cardBrand: "visa",
        cardLastFour: "4242",
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
        billingDetails: {
            name: "John Doe",
            line1: "123 Main St",
            line2: "Apt 4B",
            city: "San Francisco",
            state: "CA",
            postalCode: "94107",
            country: "US"
        },
        createdAt: new Date("2023-01-01").toISOString()
    },
    {
        id: "pm_789012",
        userId: "user_123",
        type: "card",
        cardBrand: "mastercard",
        cardLastFour: "5678",
        expiryMonth: 10,
        expiryYear: 2024,
        isDefault: false,
        billingDetails: {
            name: "John Doe",
            line1: "123 Main St",
            line2: "Apt 4B",
            city: "San Francisco",
            state: "CA",
            postalCode: "94107",
            country: "US"
        },
        createdAt: new Date("2023-02-15").toISOString()
    }
];

// Mock invoices
const mockInvoices: Invoice[] = [
    {
        id: "inv_123456",
        userId: "user_123",
        subscriptionId: "sub_123456",
        invoiceNumber: "INV-2023-001",
        amount: 599.99,
        currency: "USD",
        status: "paid",
        invoiceDate: new Date("2023-01-01").toISOString(),
        dueDate: new Date("2023-01-15").toISOString(),
        paidAt: new Date("2023-01-05").toISOString(),
        pdf: "https://example.com/invoices/INV-2023-001.pdf",
        items: [
            {
                id: "item_123",
                description: "Professional Plan (Yearly)",
                amount: 599.99,
                quantity: 1
            }
        ]
    },
    {
        id: "inv_789012",
        userId: "user_123",
        subscriptionId: "sub_123456",
        invoiceNumber: "INV-2022-012",
        amount: 599.99,
        currency: "USD",
        status: "paid",
        invoiceDate: new Date("2022-01-01").toISOString(),
        dueDate: new Date("2022-01-15").toISOString(),
        paidAt: new Date("2022-01-03").toISOString(),
        pdf: "https://example.com/invoices/INV-2022-012.pdf",
        items: [
            {
                id: "item_456",
                description: "Professional Plan (Yearly)",
                amount: 599.99,
                quantity: 1
            }
        ]
    },
    {
        id: "inv_345678",
        userId: "user_123",
        subscriptionId: "sub_123456",
        invoiceNumber: "INV-2023-002",
        amount: 49.99,
        currency: "USD",
        status: "open",
        invoiceDate: new Date("2023-06-15").toISOString(),
        dueDate: new Date("2023-06-30").toISOString(),
        paidAt: null,
        pdf: "https://example.com/invoices/INV-2023-002.pdf",
        items: [
            {
                id: "item_789",
                description: "Additional User Seats (5)",
                amount: 9.99,
                quantity: 5
            }
        ]
    }
];

// Helper function to simulate async API calls
const simulateApiCall = <T>(data: T, delay = 500): Promise<T> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(data);
        }, delay);
    });
};

// Subscription service
export const subscriptionService = {
    // Get subscription plans
    getSubscriptionPlans: async (): Promise<SubscriptionPlan[]> => {
        return simulateApiCall(mockSubscriptionPlans);
    },

    // Get subscription for a user
    getSubscription: async (userId: string): Promise<Subscription> => {
        // In a real app, we would fetch from an API
        const subscription = { ...mockSubscription, userId };

        // Add the complete plan object to the subscription
        const plan = mockSubscriptionPlans.find(p => p.id === subscription.planId);

        return simulateApiCall({
            ...subscription,
            plan: plan || {
                id: "unknown",
                name: "Unknown Plan",
                description: "Plan details unavailable",
                features: [],
                monthlyPrice: 0,
                yearlyPrice: 0,
                currency: "USD",
                isPopular: false,
                priority: 0
            }
        });
    },

    // Change subscription plan
    changePlan: async (
        userId: string,
        planId: string,
        billingInterval: "monthly" | "yearly" = "yearly"
    ): Promise<Subscription> => {
        // In a real app, we would call an API to change the plan
        const plan = mockSubscriptionPlans.find(p => p.id === planId);
        if (!plan) {
            throw new Error("Plan not found");
        }

        const updatedSubscription: Subscription = {
            ...mockSubscription,
            userId,
            planId,
            billingInterval,
            plan: {
                ...plan,
                price: billingInterval === "monthly" ? plan.monthlyPrice : plan.yearlyPrice,
                interval: billingInterval
            },
            updatedAt: new Date().toISOString()
        };

        return simulateApiCall(updatedSubscription, 1000);
    },

    // Cancel subscription
    cancelSubscription: async (
        userId: string,
        cancelAtPeriodEnd: boolean = true
    ): Promise<Subscription> => {
        // In a real app, we would call an API to cancel the subscription
        const updatedSubscription: Subscription = {
            ...mockSubscription,
            userId,
            cancelAtPeriodEnd,
            updatedAt: new Date().toISOString()
        };

        return simulateApiCall(updatedSubscription, 1000);
    },

    // Pause subscription
    pauseSubscription: async (
        subscriptionId: string,
        resumeDate?: Date
    ): Promise<Subscription> => {
        // In a real app, we would call an API to pause the subscription
        const updatedSubscription: Subscription = {
            ...mockSubscription,
            status: "paused",
            pausedAt: new Date().toISOString(),
            resumesAt: resumeDate ? resumeDate.toISOString() : null,
            updatedAt: new Date().toISOString()
        };

        return simulateApiCall(updatedSubscription, 1000);
    },

    // Resume subscription
    resumeSubscription: async (subscriptionId: string): Promise<Subscription> => {
        // In a real app, we would call an API to resume the subscription
        const updatedSubscription: Subscription = {
            ...mockSubscription,
            status: "active",
            pausedAt: null,
            resumesAt: null,
            updatedAt: new Date().toISOString()
        };

        return simulateApiCall(updatedSubscription, 1000);
    },

    // Get payment methods for a user
    getPaymentMethods: async (userId: string): Promise<PaymentMethod[]> => {
        // In a real app, we would fetch from an API
        return simulateApiCall(mockPaymentMethods.map(pm => ({ ...pm, userId })));
    },

    // Add a payment method
    addPaymentMethod: async (
        userId: string,
        paymentMethodData: Omit<PaymentMethod, "id" | "userId" | "createdAt">
    ): Promise<PaymentMethod> => {
        // In a real app, we would call an API to add the payment method
        const newPaymentMethod: PaymentMethod = {
            id: `pm_${Math.random().toString(36).substring(2, 11)}`,
            userId,
            ...paymentMethodData,
            createdAt: new Date().toISOString()
        };

        // If this is set as default, we would update all other payment methods
        if (newPaymentMethod.isDefault) {
            mockPaymentMethods.forEach(pm => {
                if (pm.userId === userId) {
                    pm.isDefault = false;
                }
            });
        }

        // Add to mock data
        mockPaymentMethods.push(newPaymentMethod);

        return simulateApiCall(newPaymentMethod, 1000);
    },

    // Update a payment method
    updatePaymentMethod: async (
        paymentMethodId: string,
        updates: Partial<PaymentMethod>
    ): Promise<PaymentMethod> => {
        // In a real app, we would call an API to update the payment method
        const paymentMethod = mockPaymentMethods.find(pm => pm.id === paymentMethodId);
        if (!paymentMethod) {
            throw new Error("Payment method not found");
        }

        // If setting as default, update all other payment methods
        if (updates.isDefault) {
            mockPaymentMethods.forEach(pm => {
                if (pm.userId === paymentMethod.userId) {
                    pm.isDefault = pm.id === paymentMethodId;
                }
            });
        }

        // Update the payment method
        const updatedPaymentMethod = { ...paymentMethod, ...updates };

        return simulateApiCall(updatedPaymentMethod, 1000);
    },

    // Delete a payment method
    deletePaymentMethod: async (paymentMethodId: string): Promise<void> => {
        // In a real app, we would call an API to delete the payment method
        const index = mockPaymentMethods.findIndex(pm => pm.id === paymentMethodId);
        if (index === -1) {
            throw new Error("Payment method not found");
        }

        // Check if it's the default payment method
        if (mockPaymentMethods[index].isDefault) {
            throw new Error("Cannot delete default payment method");
        }

        // Remove from mock data
        mockPaymentMethods.splice(index, 1);

        return simulateApiCall(undefined, 1000);
    },

    // Get invoices for a user
    getInvoices: async (userId: string): Promise<Invoice[]> => {
        // In a real app, we would fetch from an API
        return simulateApiCall(mockInvoices.map(inv => ({ ...inv, userId })));
    },

    // Get a specific invoice
    getInvoice: async (invoiceId: string): Promise<Invoice> => {
        // In a real app, we would fetch from an API
        const invoice = mockInvoices.find(inv => inv.id === invoiceId);
        if (!invoice) {
            throw new Error("Invoice not found");
        }

        return simulateApiCall(invoice);
    }
}; 