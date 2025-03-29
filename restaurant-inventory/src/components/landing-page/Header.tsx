"use client";

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Menu } from "lucide-react";

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-50 pt-4 px-4">
      <motion.div 
        className="max-w-7xl mx-auto rounded-full bg-white shadow-lg py-3 px-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative w-9 h-9 mr-2">
              <Image
                src="/assets/brand/Instagram post - 3.png"
                alt="ShelfWise Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold text-black">
              Shelf<span className="text-orange-500">Wise</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center space-x-12">
            <Link href="#features" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
              Testimonials
            </Link>
          </div>
          
          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-5">
            <Link href="/login" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
              Login
            </Link>
            <Button
              asChild
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 py-2 shadow-md"
            >
              <Link href="/signup">Sign Up Free</Link>
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-black"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </nav>
      </motion.div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          className="fixed inset-0 bg-white z-50 md:hidden pt-4 px-4"
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-10">
            <Link href="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
              <div className="relative w-9 h-9 mr-2">
                <Image
                  src="/assets/brand/Log In (1) 1.svg"
                  alt="ShelfWise Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-black">
                Shelf<span className="text-orange-500">Wise</span>
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-black"
              onClick={toggleMobileMenu}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex flex-col space-y-6 items-center text-lg">
            <Link 
              href="#features" 
              className="text-gray-700 hover:text-orange-500 transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="#pricing" 
              className="text-gray-700 hover:text-orange-500 transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="#testimonials" 
              className="text-gray-700 hover:text-orange-500 transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Testimonials
            </Link>
            <div className="pt-6 w-full flex flex-col space-y-4">
              <Link 
                href="/login" 
                className="text-gray-700 hover:text-orange-500 transition-colors font-medium text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Button
                asChild
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 py-6 w-full shadow-md"
              >
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  Sign Up Free
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;