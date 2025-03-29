"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  BarChart2,
  Calendar,
  ChefHat,
  Clock,
  ShoppingCart,
  Utensils,
} from "lucide-react";

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="relative w-12 h-12">
              <Image
                src="/assets/brand/Log In (1) 1.svg"
                alt="ShelfWise Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-black">Powerful Features</h2>
          <p className="mt-4 text-lg text-gray-800 max-w-2xl mx-auto">
            Everything you need to manage your restaurant inventory efficiently
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Feature 1 */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-sm"
            variants={itemVariants}
          >
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Utensils className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">
              Recipe Management
            </h3>
            <p className="text-gray-800">
              Create and manage recipes with automatic inventory deduction and
              cost tracking.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-sm"
            variants={itemVariants}
          >
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">
              Supplier Management
            </h3>
            <p className="text-gray-800">
              Maintain supplier details, compare prices, and place orders
              directly through the platform.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-sm"
            variants={itemVariants}
          >
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BarChart2 className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">
              Usage Analytics
            </h3>
            <p className="text-gray-800">
              Track inventory consumption patterns and optimize your purchasing
              with data-driven insights.
            </p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-sm"
            variants={itemVariants}
          >
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">
              Expiry Tracking
            </h3>
            <p className="text-gray-800">
              Never let ingredients go to waste with smart expiry date tracking
              and alerts.
            </p>
          </motion.div>

          {/* Feature 5 */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-sm"
            variants={itemVariants}
          >
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <ChefHat className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Menu Planning</h3>
            <p className="text-gray-800">
              Plan your menu based on available ingredients and seasonal
              offerings.
            </p>
          </motion.div>

          {/* Feature 6 */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-sm"
            variants={itemVariants}
          >
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">
              Real-time Updates
            </h3>
            <p className="text-gray-800">
              Get real-time inventory updates as items are used or received for
              accurate stock levels.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
