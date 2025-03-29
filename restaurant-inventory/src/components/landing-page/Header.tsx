"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-10 h-10">
                <Image
                  src="/assets/brand/Log In (1) 1.svg"
                  alt="ShelfWise Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-lg font-bold text-black">ShelfWise</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-10">
            <Link
              href="#features"
              className="text-black hover:text-orange-500 font-medium text-sm"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-black hover:text-orange-500 font-medium text-sm"
            >
              Pricing
            </Link>
            <Link
              href="#testimonials"
              className="text-black hover:text-orange-500 font-medium text-sm"
            >
              Testimonials
            </Link>
            <Link
              href="/login"
              className="text-black hover:text-orange-500 font-medium text-sm"
            >
              Login
            </Link>
            <Button
              asChild
              size="sm"
              className="bg-black text-white hover:bg-black/90 rounded-md px-4 py-2 text-sm font-medium"
            >
              <Link href="/signup">Sign Up Free</Link>
            </Button>
          </div>
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-black"
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-white z-50 md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="flex justify-end p-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="text-black"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex flex-col items-center space-y-6 p-8">
              <Link
                href="/"
                className="flex items-center space-x-2 mb-6"
                onClick={toggleMobileMenu}
              >
                <div className="relative w-10 h-10">
                  <Image
                    src="/assets/brand/Log In (1) 1.svg"
                    alt="ShelfWise Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold text-black">ShelfWise</span>
              </Link>
              <Link
                href="#features"
                className="text-black text-lg font-medium"
                onClick={toggleMobileMenu}
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-black text-lg font-medium"
                onClick={toggleMobileMenu}
              >
                Pricing
              </Link>
              <Link
                href="#testimonials"
                className="text-black text-lg font-medium"
                onClick={toggleMobileMenu}
              >
                Testimonials
              </Link>
              <Link
                href="/login"
                className="text-black text-lg font-medium"
                onClick={toggleMobileMenu}
              >
                Login
              </Link>
              <Button
                asChild
                size="lg"
                className="bg-black hover:bg-black/90 text-white w-full mt-4"
              >
                <Link href="/signup" onClick={toggleMobileMenu}>
                  Sign Up Free
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
