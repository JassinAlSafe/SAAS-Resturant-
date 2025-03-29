"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Clipboard,
  Database,
  LineChart,
  Truck,
} from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

const steps = [
  {
    id: 1,
    title: "Set Up Your Inventory",
    description:
      "Get started by adding your ingredients, suppliers, and setting par levels. Import existing data or start fresh with our intuitive setup wizard.",
    icon: Clipboard,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 2,
    title: "Create Recipes & Menus",
    description:
      "Build your recipes with precise ingredient quantities. Our system automatically calculates costs and updates inventory when dishes are prepared.",
    icon: Database,
    color: "bg-green-100 text-green-600",
  },
  {
    id: 3,
    title: "Manage Daily Operations",
    description:
      "Track inventory usage, receive alerts for low stock, manage orders, and record waste. Everything is updated in real-time across your entire system.",
    icon: Truck,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: 4,
    title: "Analyze & Optimize",
    description:
      "Use powerful analytics to identify cost-saving opportunities, reduce waste, and optimize your menu pricing based on real data.",
    icon: LineChart,
    color: "bg-orange-100 text-orange-600",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-20 bg-white border-t border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-black mb-4">
            How ShelfWise Works
          </h2>
          <p className="text-gray-800 text-lg max-w-2xl mx-auto">
            Our simple 4-step process helps you take control of your restaurant
            inventory
          </p>
        </div>

        <motion.div
          className="space-y-12 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {steps.map((step) => (
            <motion.div
              key={step.id}
              className="flex md:items-start"
              variants={itemVariants}
            >
              <div
                className={`flex items-center justify-center h-12 w-12 rounded-md flex-shrink-0 ${step.color}`}
              >
                <step.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-orange-100 text-orange-600 text-sm font-medium mr-2">
                    {step.id}
                  </span>
                  <h3 className="text-xl font-bold text-black">{step.title}</h3>
                </div>
                <p className="mt-2 text-gray-800">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-16 relative">
          <div className="bg-gray-50 rounded-lg p-8 md:p-12">
            <div className="md:flex md:items-center md:justify-between">
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold text-black mb-4">
                  Ready to transform your inventory management?
                </h3>
                <p className="text-gray-800">
                  Join thousands of restaurants that have streamlined their
                  operations with ShelfWise. Our team is ready to help you get
                  started.
                </p>
                <div className="mt-6 flex items-center">
                  <a
                    href="/signup"
                    className="inline-flex items-center text-orange-600 font-medium hover:text-orange-700"
                  >
                    Schedule a free demo <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </div>
              </div>
              <div className="mt-6 md:mt-0 md:w-1/3 md:text-right">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="inline-block bg-white p-2 rounded-lg shadow-sm"
                >
                  <div className="text-center px-4 py-2">
                    <p className="text-black font-medium">
                      Average results after 3 months
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-center">
                      <div>
                        <p className="text-3xl font-bold text-orange-600">
                          32%
                        </p>
                        <p className="text-sm text-gray-800">
                          Reduced food waste
                        </p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-orange-600">
                          4.5h
                        </p>
                        <p className="text-sm text-gray-800">
                          Time saved weekly
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
