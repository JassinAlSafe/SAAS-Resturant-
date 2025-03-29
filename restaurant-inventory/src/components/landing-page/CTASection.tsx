"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="relative py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16">
            <Image
              src="/assets/brand/Log In (1) 1.svg"
              alt="ShelfWise Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-black mb-4">
          Ready to streamline your restaurant operations?
        </h2>
        <p className="text-gray-800 text-lg max-w-2xl mx-auto mb-8">
          Join thousands of restaurants that trust ShelfWise for their inventory
          management needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-orange-600 hover:bg-orange-700 text-white px-8"
          >
            <Link href="/signup">Start Free Trial</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-orange-600 text-orange-600 hover:bg-orange-50 px-8"
          >
            <Link href="/login">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
