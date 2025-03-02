# Billing & Subscription Management

This module provides comprehensive billing and subscription management for the Restaurant Inventory Manager application.

## Features

- **Subscription Management**: View and manage the current subscription plan, including upgrading, downgrading, canceling, and pausing subscriptions.
- **Payment Method Management**: Add, update, and delete payment methods, with support for credit cards.
- **Billing History**: View past invoices and payment history, with the ability to download invoice PDFs.
- **Plan Selection**: Compare available subscription plans and select the most appropriate one for your business needs.

## Components

### Main Page

- `page.tsx`: The main billing page that integrates all billing components and handles data fetching.

### Billing Components

- `CurrentSubscription.tsx`: Displays the current subscription details with options to manage it.
- `PlanSelector.tsx`: Allows users to view and select from available subscription plans.
- `PaymentMethods.tsx`: Manages payment methods for subscription billing.
- `BillingHistory.tsx`: Displays billing history and invoices with detailed views.

## Services

- `subscription-service.ts`: Provides API methods for managing subscriptions, payment methods, and invoices.

## Types

The following types are used throughout the billing module:

- `Subscription`: Represents a user's subscription to a plan.
- `SubscriptionPlan`: Defines the details of a subscription plan.
- `PaymentMethod`: Represents a payment method used for billing.
- `Invoice`: Represents a billing invoice with line items.

## Access Control

Access to the billing page is restricted to users with the following roles:

- Owner
- Admin

Other users will see an access denied message when attempting to access the billing page.

## Future Enhancements

- Integration with real payment processors (Stripe, PayPal, etc.)
- Support for additional payment methods (bank transfers, digital wallets)
- Customizable billing cycles
- Proration for mid-cycle plan changes
- Tax calculation based on user location
- Team member billing for per-seat pricing
- Usage-based billing for certain features
