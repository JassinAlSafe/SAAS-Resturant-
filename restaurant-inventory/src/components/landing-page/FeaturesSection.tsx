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
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative min-h-screen w-full py-24 flex items-center bg-[#EFF1F5] overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      <motion.div
        className="absolute top-40 right-20 w-60 h-60 bg-orange-100 rounded-full opacity-20 blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.25, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.div
        className="absolute bottom-40 left-20 w-72 h-72 bg-blue-100 rounded-full opacity-20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 10,
          delay: 1,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16 bg-white rounded-2xl shadow-md p-3 transform rotate-3">
              <Image
                src="/assets/brand/Log In (1) 1.svg"
                alt="ShelfWise Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0D1F5A] mb-4">
            Powerful Features
          </h2>
          <p className="mt-4 text-xl text-gray-700 max-w-2xl mx-auto">
            Everything you need to manage your restaurant inventory efficiently
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Feature 1 */}
          <motion.div
            className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="bg-orange-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-colors duration-300">
              <Utensils className="h-7 w-7 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Recipe Management
            </h3>
            <p className="text-gray-700 mb-4 text-lg">
              Create and manage recipes with automatic inventory deduction and
              cost tracking.
            </p>
            <div className="mt-auto pt-2">
              <Link
                href="#"
                className="inline-flex items-center text-orange-500 font-medium group-hover:text-orange-600 transition-colors"
              >
                Learn more{" "}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="bg-orange-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-colors duration-300">
              <ShoppingCart className="h-7 w-7 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Supplier Management
            </h3>
            <p className="text-gray-700 mb-4 text-lg">
              Maintain supplier details, compare prices, and place orders
              directly through the platform.
            </p>
            <div className="mt-auto pt-2">
              <Link
                href="#"
                className="inline-flex items-center text-orange-500 font-medium group-hover:text-orange-600 transition-colors"
              >
                Learn more{" "}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="bg-orange-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-colors duration-300">
              <BarChart2 className="h-7 w-7 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Usage Analytics
            </h3>
            <p className="text-gray-700 mb-4 text-lg">
              Track inventory consumption patterns and optimize your purchasing
              with data-driven insights.
            </p>
            <div className="mt-auto pt-2">
              <Link
                href="#"
                className="inline-flex items-center text-orange-500 font-medium group-hover:text-orange-600 transition-colors"
              >
                Learn more{" "}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          {/* Feature 4 */}
          <motion.div
            className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="bg-orange-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-colors duration-300">
              <Calendar className="h-7 w-7 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Expiry Tracking
            </h3>
            <p className="text-gray-700 mb-4 text-lg">
              Never let ingredients go to waste with smart expiry date tracking
              and alerts.
            </p>
            <div className="mt-auto pt-2">
              <Link
                href="#"
                className="inline-flex items-center text-orange-500 font-medium group-hover:text-orange-600 transition-colors"
              >
                Learn more{" "}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          {/* Feature 5 */}
          <motion.div
            className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="bg-orange-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-colors duration-300">
              <ChefHat className="h-7 w-7 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Menu Planning
            </h3>
            <p className="text-gray-700 mb-4 text-lg">
              Plan your menu based on available ingredients and seasonal
              offerings.
            </p>
            <div className="mt-auto pt-2">
              <Link
                href="#"
                className="inline-flex items-center text-orange-500 font-medium group-hover:text-orange-600 transition-colors"
              >
                Learn more{" "}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          {/* Feature 6 */}
          <motion.div
            className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="bg-orange-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-colors duration-300">
              <Clock className="h-7 w-7 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Real-time Updates
            </h3>
            <p className="text-gray-700 mb-4 text-lg">
              Get real-time inventory updates as items are used or received for
              accurate stock levels.
            </p>
            <div className="mt-auto pt-2">
              <Link
                href="#"
                className="inline-flex items-center text-orange-500 font-medium group-hover:text-orange-600 transition-colors"
              >
                Learn more{" "}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
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
