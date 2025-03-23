#!/usr/bin/env node

// This script sets up Stripe products and prices for your subscription plans
// Run with: node scripts/setup-stripe-products.js

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Define your subscription plans
const plans = [
  {
    name: 'Free',
    description: 'Basic inventory management for small restaurants',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      'Up to 50 inventory items',
      'Basic inventory management',
      'Single user access'
    ]
  },
  {
    name: 'Pro',
    description: 'Everything you need for growing restaurants',
    price: 29,
    currency: 'USD',
    interval: 'month',
    features: [
      'Up to 100 inventory items',
      'Advanced inventory management',
      'Up to 5 user accounts',
      'Real-time inventory tracking',
      'Supplier management',
      'Basic reporting'
    ]
  },
  {
    name: 'Enterprise',
    description: 'Advanced features for large restaurant chains',
    price: 99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited inventory items',
      'Advanced inventory management',
      'Unlimited user accounts',
      'Real-time inventory tracking',
      'Supplier management',
      'Advanced reporting and analytics',
      'API access',
      'Dedicated support'
    ]
  }
];

async function createProductsAndPrices() {
  console.log('Setting up Stripe products and prices...');
  
  for (const plan of plans) {
    try {
      // Skip creating free plan in Stripe
      if (plan.price === 0) {
        console.log(`Skipping free plan: ${plan.name}`);
        continue;
      }
      
      // Create or update the product
      console.log(`Creating/updating product: ${plan.name}`);
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: {
          features: plan.features.join(', ')
        }
      });
      
      console.log(`Product created: ${product.id}`);
      
      // Create the price
      console.log(`Creating price for ${plan.name}: $${plan.price}/${plan.interval}`);
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price * 100, // Convert to cents
        currency: plan.currency,
        recurring: {
          interval: plan.interval
        },
        metadata: {
          plan_name: plan.name.toLowerCase()
        }
      });
      
      console.log(`Price created: ${price.id}`);
      console.log(`Use this price ID in your PricingPlans.tsx component for the ${plan.name} plan: ${price.id}`);
      console.log('-----------------------------------');
    } catch (error) {
      console.error(`Error creating product/price for ${plan.name}:`, error);
    }
  }
  
  console.log('Setup complete! Copy the price IDs above into your PricingPlans.tsx component.');
}

createProductsAndPrices().catch(error => {
  console.error('Error setting up Stripe products and prices:', error);
});
