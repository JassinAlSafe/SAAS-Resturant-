#!/bin/bash

# This script fixes Unicode issues by properly initializing empty files
# It will ONLY initialize files that are completely empty (0 bytes)

# List of files to check
FILES=(
  "src/components/billing/BillingHistory.tsx"
  "src/components/billing/PlanSelector.tsx"
  "src/components/billing/PlanDebug.tsx"
  "src/components/billing/BillingWrapper.tsx"
  "src/components/billing/PricingPlans.tsx"
  "src/components/billing/CurrentSubscription.tsx"
  "src/components/billing/BillingTabs.tsx"
  "src/components/billing/PaymentMethods.tsx"
  "src/app/api/billing/create-checkout-session/route.ts"
  "src/app/api/billing/create-portal-session/route.ts"
  "src/app/api/billing/get-subscription/route.ts"
  "src/app/api/billing/webhook/route.ts"
  "src/app/api/auth/create-business-profile/route.ts"
  "src/app/api/auth/create-profile/route.ts"
  "src/app/api/testing/create-test-subscription/route.ts"
  "src/app/logout/page.tsx"
  "src/app/testing/create-subscription/page.tsx"
  "src/components/auth/AuthDebugger.tsx"
  "src/lib/stripe.ts"
  "src/lib/supabase-admin.ts"
)

# Loop through each file and initialize it with a basic export statement ONLY if it's empty
for file in "${FILES[@]}"; do
  if [ -f "$file" ] && [ ! -s "$file" ]; then
    echo "Initializing empty file: $file"
    
    # Get file extension
    ext="${file##*.}"
    
    # Create appropriate content based on file extension
    if [ "$ext" = "tsx" ]; then
      echo 'import React from "react";

export default function Component() {
  return <div>Component to be implemented</div>;
}' > "$file"
    elif [ "$ext" = "ts" ]; then
      echo '// This file needs to be implemented
export {};' > "$file"
    fi
  else
    echo "Skipping non-empty file: $file"
  fi
done

echo "All empty files have been initialized!"
