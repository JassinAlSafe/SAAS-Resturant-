"use client";

import { motion } from "framer-motion";
import { BarChart2, ChefHat, Clock, ShoppingCart } from "lucide-react";

export default function DashboardPreview() {
  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
    >
      <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-white">
        {/* Mock dashboard UI */}
        <div className="bg-white rounded-t-2xl p-3 border-b border-gray-200 flex items-center">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="mx-auto text-sm text-black font-medium">
            ShelfWise Dashboard
          </div>
        </div>
        <div className="bg-white p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 col-span-2 h-[300px] flex items-center justify-center border border-gray-200">
            <div className="text-center">
              <BarChart2 className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <p className="text-black">Inventory Analytics Dashboard</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 h-[142px] flex items-center justify-center border border-gray-200">
              <div className="text-center">
                <ShoppingCart className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <p className="text-black">Supplier Orders</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 h-[142px] flex items-center justify-center border border-gray-200">
              <div className="text-center">
                <ChefHat className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <p className="text-black">Recipe Management</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cards */}
      <motion.div
        className="absolute -right-6 -top-6 bg-white p-4 rounded-lg shadow-lg border border-gray-200 hidden md:block"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <div className="flex items-center">
          <div className="bg-orange-100 p-2 rounded-full">
            <Clock className="h-4 w-4 text-orange-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-black">Expiry Alert</p>
            <p className="text-xs text-gray-800">2 items expiring soon</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute -left-6 bottom-24 bg-white p-4 rounded-lg shadow-lg border border-gray-200 hidden md:block"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <div className="flex items-center">
          <div className="bg-orange-100 p-2 rounded-full">
            <ShoppingCart className="h-4 w-4 text-orange-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-black">Reorder Alert</p>
            <p className="text-xs text-gray-800">5 items below threshold</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
