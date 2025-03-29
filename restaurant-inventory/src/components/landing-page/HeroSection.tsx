"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";

const HeroSection: React.FC = () => {
  const scrollToNextSection = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative min-h-screen flex items-center bg-[#f9f8f6] pt-24 pb-16">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f9f8f6] via-[#f9f8f6] to-[#f5f2ee] pointer-events-none" />

      {/* Hero Container */}
      <div className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
          {/* Text Content */}
          <motion.div
            className="lg:w-[45%] pt-6 lg:pt-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-black leading-tight">
              <span className="block mb-2">Smart Inventory</span>
              <span className="block text-orange-500">for Restaurants</span>
            </h1>
            <p className="mt-6 text-lg text-gray-700 leading-relaxed max-w-xl">
              Simplify your restaurant operations with ShelfWise. Track
              inventory, manage suppliers, and reduce waste with our intelligent
              inventory system.
            </p>

            <div className="mt-10 flex items-center gap-6">
              <Button
                asChild
                className="bg-black hover:bg-black/90 text-white px-5 py-3 h-11 rounded-md font-medium text-sm shadow-sm hover:shadow transition-all"
              >
                <Link href="/signup" className="inline-flex items-center">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Link
                href="/login"
                className="text-orange-500 hover:text-orange-600 font-medium text-sm"
              >
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* Hero Image with enhanced presentation */}
          <motion.div
            className="lg:w-[55%] flex justify-center lg:justify-end"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            <div className="relative w-full max-w-[560px] h-[340px] md:h-[400px]">
              {/* Decorative shadow/frame */}
              <div className="absolute inset-0 bg-white/50 rounded-3xl transform -rotate-1 scale-[0.98] shadow-lg" />

              {/* Image container with styling */}
              <div className="relative h-full w-full overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm shadow-md">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-[95%] h-[95%]">
                    <Image
                      src="/assets/brand/shelfwise-hero.jpg"
                      alt="Restaurant inventory management"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Floating decorative elements */}
              <motion.div
                className="absolute -bottom-3 -left-3 w-16 h-16 bg-orange-500/10 rounded-full"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.7, 0.9, 0.7],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
              <motion.div
                className="absolute -top-5 -right-5 w-20 h-20 bg-black/5 rounded-full"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.7, 0.5],
                }}
                transition={{
                  duration: 5,
                  delay: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <motion.div
          className="flex flex-col items-center group cursor-pointer"
          onClick={scrollToNextSection}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="relative flex items-center justify-center w-12 h-12 mb-2 rounded-full bg-white/70 backdrop-blur-sm shadow-sm group-hover:bg-white/90 transition-colors duration-300"
            animate={{
              y: [0, -4, 0],
              transition: {
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              },
            }}
          >
            <motion.div
              animate={{
                y: [0, 4, 0],
                opacity: [0.5, 1, 0.5],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut",
                },
              }}
            >
              <ChevronDown className="h-5 w-5 text-gray-500 group-hover:text-gray-700 transition-colors duration-300" />
            </motion.div>
          </motion.div>
          <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
            Scroll to explore
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
