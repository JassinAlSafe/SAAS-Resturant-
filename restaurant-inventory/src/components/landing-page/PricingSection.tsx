"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Badge, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState("yearly");

  // Pricing data
  const pricing = {
    monthly: 200,
    yearly: 1650,
    discount: "31%", // Calculated from the yearly savings
    features: [
      "Advanced inventory management",
      "Unlimited inventory items",
      "Full recipe & menu costing",
      "Supplier management",
      "Waste tracking",
      "Multi-location support",
      "Real-time analytics & reporting",
      "Unlimited user accounts",
      "Priority email & chat support",
    ],
  };

  return (
    <section
      id="pricing"
      className="relative py-24 bg-[#EFF1F5] w-full overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      <motion.div
        className="absolute bottom-20 left-10 w-64 h-64 bg-blue-100 rounded-full opacity-10 blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center px-4 py-1.5 bg-orange-100 rounded-full mb-4">
            <span className="text-sm font-medium text-orange-600">
              Simple pricing
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0D1F5A] mb-4">
            One Plan For All Your Needs
          </h2>
          <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">
            Everything you need to take control of your restaurant inventory
            management
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-16">
          <div className="bg-white rounded-full p-1.5 inline-flex shadow-md">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-8 py-3 rounded-full text-base font-medium transition-colors ${
                billingCycle === "monthly"
                  ? "bg-gray-100 text-gray-800"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-8 py-3 rounded-full text-base font-medium transition-colors ${
                billingCycle === "yearly"
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Yearly
              {billingCycle === "yearly" && (
                <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                  Save {pricing.discount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Pricing Card */}
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 lg:p-10 relative">
              {/* Badge */}
              <div className="absolute top-6 right-6">
                <div className="inline-flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-base font-medium text-gray-800">
                    Standard Plan
                  </span>
                </div>
              </div>

              {/* Plan Details */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-12">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">
                    ShelfWise Standard
                  </h3>
                  <p className="text-lg text-gray-600 mt-2">
                    Complete inventory management solution
                  </p>
                </div>
                <div className="mt-6 md:mt-0 text-right">
                  <div className="flex items-baseline justify-end">
                    <span className="text-5xl font-bold text-gray-900">
                      {billingCycle === "monthly" ? "200" : "1650"} kr
                    </span>
                  </div>
                  <div className="text-gray-600 mt-1">
                    /{billingCycle === "monthly" ? "month" : "year"}
                  </div>
                  {billingCycle === "yearly" && (
                    <p className="text-green-600 text-sm mt-1 flex items-center justify-end">
                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                      <span>
                        You save {pricing.discount} compared to monthly
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Feature List */}
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-5">
                {pricing.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="mt-12 flex justify-center">
                <Button
                  asChild
                  className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-10 text-base font-medium rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <Link href="/signup">Start Your 14-Day Free Trial</Link>
                </Button>
              </div>
              <p className="text-center text-gray-500 text-sm mt-4">
                No credit card required. Cancel anytime.
              </p>
            </div>

            {/* Bottom Panel */}
            <div className="bg-gray-50 px-8 py-5 flex items-center justify-between">
              <div className="text-gray-700">Need a custom solution?</div>
              <Link
                href="/contact"
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Contact our sales team →
              </Link>
            </div>
          </div>
        </motion.div>

        {/* FAQ Teaser */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Have questions about our pricing?
          </h3>
          <p className="text-gray-600 max-w-xl mx-auto mb-6">
            Check out our FAQ section or contact us directly for more
            information.
          </p>
          <Button
            asChild
            variant="outline"
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
          >
            <Link href="#faq">View FAQ</Link>
          </Button>
        </motion.div>
      </div>

      {/* CSS for background pattern */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: linear-gradient(
              to right,
              rgba(0, 0, 0, 0.05) 1px,
              transparent 1px
            ),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </section>
  );
}
