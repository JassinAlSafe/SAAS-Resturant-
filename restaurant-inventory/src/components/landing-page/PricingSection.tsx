"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Pricing plan data
const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    description: "Perfect for small restaurants and cafes",
    features: [
      "Basic inventory tracking",
      "Up to 500 inventory items",
      "Simple recipe management",
      "2 user accounts",
      "Email support",
    ],
    popular: false,
    buttonText: "Start Free Trial",
    buttonVariant: "outline",
  },
  {
    id: "pro",
    name: "Professional",
    price: 99,
    description: "Ideal for growing restaurants",
    features: [
      "Advanced inventory management",
      "Unlimited inventory items",
      "Full recipe & menu costing",
      "5 user accounts",
      "Supplier management",
      "Waste tracking",
      "Priority email & chat support",
    ],
    popular: true,
    buttonText: "Start Free Trial",
    buttonVariant: "default",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    description: "For restaurant groups and chains",
    features: [
      "Multi-location management",
      "Advanced analytics & reporting",
      "Custom API integrations",
      "Unlimited user accounts",
      "Dedicated account manager",
      "24/7 priority support",
      "Custom training sessions",
    ],
    popular: false,
    buttonText: "Contact Sales",
    buttonVariant: "outline",
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-black mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-800 text-lg max-w-2xl mx-auto">
            Choose the plan that fits your restaurant's needs. All plans include
            a 14-day free trial.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              className={`bg-white rounded-xl p-8 shadow-sm border ${
                plan.popular ? "border-orange-500" : "border-gray-200"
              } relative`}
              variants={itemVariants}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
                  <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}
              <h3 className="text-2xl font-bold text-black mb-2">
                {plan.name}
              </h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-black">
                  ${plan.price}
                </span>
                <span className="text-gray-600 ml-1">/month</span>
              </div>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              <div className="mb-8">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-800">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto">
                <Button
                  asChild
                  size="lg"
                  variant={plan.buttonVariant as "outline" | "default"}
                  className={`w-full ${
                    plan.buttonVariant === "default"
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : "border-orange-600 text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <Link
                    href={plan.id === "enterprise" ? "/contact" : "/signup"}
                  >
                    {plan.buttonText}
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-16 text-center bg-white p-8 rounded-lg shadow-sm">
          <h3 className="text-2xl font-bold text-black mb-4">
            Need a custom solution?
          </h3>
          <p className="text-gray-800 mb-6 max-w-2xl mx-auto">
            We offer customized solutions for unique restaurant operations. Our
            team can help you design a plan that fits your specific needs and
            budget.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-orange-600 hover:bg-orange-700 text-white px-8"
          >
            <Link href="/contact">Contact Our Sales Team</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
