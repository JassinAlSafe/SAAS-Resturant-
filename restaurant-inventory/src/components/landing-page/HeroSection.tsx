"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";

export default function HeroSection() {
  const scrollToNextSection = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#FFFBF5] pt-20 pb-16">
      {/* Hero Container */}
      <div className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-16">
          {/* Text Content */}
          <motion.div
            className="text-center lg:text-left lg:w-[45%] pt-8 lg:pt-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-black leading-tight">
              <span className="block mb-2">Smart Inventory</span>
              <span className="block text-orange-500">for Restaurants</span>
            </h1>
            <p className="mt-6 text-lg text-gray-700 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Simplify your restaurant operations with ShelfWise. Track
              inventory, manage suppliers, and reduce waste with our intelligent
              inventory system.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-black hover:bg-black/90 text-white px-8 py-6 h-auto rounded-md font-medium text-base"
              >
                <Link href="/signup" className="flex items-center">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Link
                href="/login"
                className="text-orange-500 hover:text-orange-600 font-medium text-base flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            className="lg:w-[55%]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative h-[350px] md:h-[450px] w-full max-w-[600px] mx-auto">
              <Image
                src="/assets/brand/shelfwise-hero.jpg"
                alt="ShelfWise Restaurant Inventory"
                fill
                className="object-contain"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
        initial={{ opacity: 0, y: -10 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            delay: 1,
          },
        }}
        whileHover={{ scale: 1.1 }}
        onClick={scrollToNextSection}
      >
        <motion.div
          animate={{
            y: [0, 5, 0],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            },
          }}
        >
          <ChevronDown className="h-10 w-10 text-gray-500 opacity-70" />
        </motion.div>
        <p className="text-xs text-gray-500 mt-1 text-center">
          Scroll to explore
        </p>
      </motion.div>
    </section>
  );
}
