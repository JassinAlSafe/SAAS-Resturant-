"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Clipboard,
  Database,
  LineChart,
  Truck,
  CheckCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const steps = [
  {
    id: 1,
    title: "Set Up Your Inventory",
    description:
      "Get started by adding your ingredients, suppliers, and setting par levels. Import existing data or start fresh with our intuitive setup wizard.",
    icon: Clipboard,
    color: "bg-blue-100 text-blue-600 border-blue-200",
  },
  {
    id: 2,
    title: "Create Recipes & Menus",
    description:
      "Build your recipes with precise ingredient quantities. Our system automatically calculates costs and updates inventory when dishes are prepared.",
    icon: Database,
    color: "bg-green-100 text-green-600 border-green-200",
  },
  {
    id: 3,
    title: "Manage Daily Operations",
    description:
      "Track inventory usage, receive alerts for low stock, manage orders, and record waste. Everything is updated in real-time across your entire system.",
    icon: Truck,
    color: "bg-purple-100 text-purple-600 border-purple-200",
  },
  {
    id: 4,
    title: "Analyze & Optimize",
    description:
      "Use powerful analytics to identify cost-saving opportunities, reduce waste, and optimize your menu pricing based on real data.",
    icon: LineChart,
    color: "bg-orange-100 text-orange-600 border-orange-200",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative py-24 bg-[#EFF1F5] w-full overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center px-4 py-1.5 bg-orange-100 rounded-full mb-4">
            <span className="text-sm font-medium text-orange-600">
              Simple 4-step process
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0D1F5A] mb-4">
            How ShelfWise Works
          </h2>
          <p className="mt-4 text-xl text-gray-700 max-w-2xl mx-auto">
            Our proven process helps you take control of your restaurant
            inventory
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {steps.map((step) => (
            <motion.div
              key={step.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300"
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex items-start">
                <div className="relative">
                  <div
                    className={`flex items-center justify-center h-16 w-16 rounded-xl border ${step.color}`}
                  >
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 flex items-center justify-center h-6 w-6 rounded-full bg-white border border-gray-200 text-orange-600 text-sm font-bold shadow-sm">
                    {step.id}
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-700">{step.description}</p>

                  <Link
                    href="#"
                    className="inline-flex items-center mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Learn more <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-20 relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="relative bg-white rounded-2xl shadow-xl p-10 lg:p-12 overflow-hidden border border-gray-100">
            {/* Background decoration */}
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-orange-50 rounded-full -mr-20 -mb-20 opacity-50"></div>
            <div className="absolute right-10 bottom-10 w-32 h-32 bg-orange-100 rounded-full opacity-30"></div>

            <div className="md:flex md:items-center md:justify-between relative z-10">
              <div className="md:w-3/5 pr-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Ready to transform your inventory management?
                </h3>
                <p className="text-lg text-gray-700">
                  Join thousands of restaurants that have streamlined their
                  operations with ShelfWise. Our team is ready to help you get
                  started.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white text-base font-medium rounded-lg shadow-sm hover:bg-orange-600 transition-colors"
                  >
                    Get started free
                  </Link>
                  <Link
                    href="#"
                    className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-800 border border-gray-300 text-base font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    Schedule a demo
                  </Link>
                </div>
              </div>

              <div className="mt-8 md:mt-0 md:w-2/5">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-inner">
                  <p className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
                    Results after 3 months
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-8 bg-orange-500 rounded-full mr-3"></div>
                        <p className="text-3xl font-bold text-gray-900">32%</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        Reduced food waste
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-8 bg-blue-500 rounded-full mr-3"></div>
                        <div className="flex items-end">
                          <p className="text-3xl font-bold text-gray-900">
                            4.5
                          </p>
                          <p className="text-lg font-medium text-gray-700 mb-1">
                            h
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Time saved weekly</p>
                    </div>

                    <div className="col-span-2 mt-2">
                      <div className="flex items-center text-sm text-gray-500 justify-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        <span>Average across 500+ restaurants</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
