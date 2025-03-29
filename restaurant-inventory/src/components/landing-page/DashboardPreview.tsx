"use client";

import { motion } from "framer-motion";
import {
  BarChart2,
  ChefHat,
  Clock,
  ShoppingCart,
  ArrowUp,
  ArrowDown,
  Bell,
  Search,
  User,
  Menu,
} from "lucide-react";

export default function DashboardPreview() {
  return (
    <section className="relative w-full py-20 bg-[#f9f8f6] overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none from-[#f9f8f6] via-[#f9f8f6" />

      {/* Animated Background Elements */}
      <motion.div
        className="absolute -bottom-10 -right-10 w-80 h-80 bg-orange-100 rounded-full opacity-20 blur-3xl"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.15, 0.2, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      <motion.div
        className="absolute -top-20 -left-20 w-96 h-96 bg-blue-100 rounded-full opacity-20 blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 10,
          delay: 1,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="max-w-5xl mx-auto relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Dashboard Preview */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-white transform perspective-1000">
            {/* Browser-like top bar */}
            <div className="bg-gray-100 rounded-t-2xl p-3 border-b border-gray-200 flex items-center">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="mx-3 flex-1">
                <div className="bg-white rounded-md py-1 px-3 text-xs text-gray-500 flex items-center max-w-md">
                  <span className="mr-2">🔒</span>
                  <span className="truncate">app.shelfwise.com/dashboard</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Bell className="h-4 w-4 text-gray-500" />
                <User className="h-4 w-4 text-gray-500" />
                <Menu className="h-4 w-4 text-gray-500" />
              </div>
            </div>

            {/* Dashboard Navigation */}
            <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="font-bold text-gray-800">
                  ShelfWise Dashboard
                </div>
                <div className="text-sm text-gray-500">Overview</div>
                <div className="text-sm text-gray-500">Inventory</div>
                <div className="text-sm text-gray-500">Suppliers</div>
                <div className="text-sm text-gray-500">Reports</div>
              </div>
              <div className="relative">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-gray-100 text-sm py-1.5 pl-10 pr-4 rounded-md border border-gray-200 focus:outline-none w-48"
                />
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="bg-gray-50 p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-lg p-5 col-span-2 shadow-sm border border-gray-100 h-[320px]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">
                    Inventory Analytics
                  </h3>
                  <div className="flex space-x-2 text-sm">
                    <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-md">
                      Week
                    </span>
                    <span className="text-white bg-orange-500 px-3 py-1 rounded-md">
                      Month
                    </span>
                    <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-md">
                      Year
                    </span>
                  </div>
                </div>
                <div className="h-[250px] flex items-center justify-center">
                  <div className="w-full h-full relative">
                    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between h-[180px] px-4">
                      {[65, 80, 55, 90, 75, 60, 85, 70, 95, 65, 75, 80].map(
                        (height, i) => (
                          <div
                            key={i}
                            className="group relative flex flex-col items-center"
                          >
                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded px-2 py-1">
                              {height}%
                            </div>
                            <div
                              className="w-6 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-sm"
                              style={{ height: `${height * 1.6}px` }}
                            ></div>
                            <div className="mt-2 text-xs text-gray-500">
                              {i + 1}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                    <div className="absolute left-0 top-5 h-[180px] border-l border-dashed border-gray-200 flex flex-col justify-between py-2 text-xs text-gray-400">
                      <div>100%</div>
                      <div>75%</div>
                      <div>50%</div>
                      <div>25%</div>
                      <div>0%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 h-[150px]">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-800">
                      Supplier Orders
                    </h3>
                    <div className="text-xs text-gray-500">View all</div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <ShoppingCart className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-gray-800">
                          12
                        </div>
                        <div className="text-xs text-gray-500">
                          Pending orders
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-green-500 text-sm">
                      <ArrowUp className="h-4 w-4 mr-1" />
                      <span>8%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 h-[150px]">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-800">
                      Recipe Management
                    </h3>
                    <div className="text-xs text-gray-500">View all</div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <ChefHat className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-gray-800">
                          28
                        </div>
                        <div className="text-xs text-gray-500">
                          Active recipes
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-red-500 text-sm">
                      <ArrowDown className="h-4 w-4 mr-1" />
                      <span>3%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Cards */}
          <motion.div
            className="absolute -right-8 top-10 bg-white p-4 rounded-xl shadow-lg border border-gray-200 hidden md:block"
            initial={{ opacity: 0, x: 50, y: 20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
            whileHover={{
              y: -5,
              boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
              transition: { duration: 0.2 },
            }}
          >
            <div className="flex items-center">
              <div className="bg-orange-100 p-2.5 rounded-full">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">
                  Expiry Alert
                </p>
                <p className="text-xs text-gray-600">2 items expiring soon</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute -left-8 top-32 bg-white p-4 rounded-xl shadow-lg border border-gray-200 hidden md:block"
            initial={{ opacity: 0, x: -50, y: 20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 1 }}
            whileHover={{
              y: -5,
              boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
              transition: { duration: 0.2 },
            }}
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-2.5 rounded-full">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">
                  Reorder Alert
                </p>
                <p className="text-xs text-gray-600">5 items below threshold</p>
              </div>
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
        .perspective-1000 {
          perspective: 1000px;
          transform: rotateX(2deg);
        }
      `}</style>
    </section>
  );
}
