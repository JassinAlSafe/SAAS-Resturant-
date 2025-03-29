"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star } from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// Testimonial data
const testimonials = [
  {
    id: 1,
    name: "Sara Johnson",
    role: "Restaurant Owner",
    company: "Bistro Bella",
    image: "/assets/brand/Instagram post - 3.png", // Using placeholder, replace with actual avatar
    stars: 5,
    text: "ShelfWise has transformed our inventory management. We've reduced food waste by 40% and streamlined our ordering process. The ROI has been incredible.",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Executive Chef",
    company: "Fusion Kitchen",
    image: "/assets/brand/Instagram post - 3.png", // Using placeholder, replace with actual avatar
    stars: 5,
    text: "As a chef, I love how ShelfWise helps me track ingredient usage and plan menus. The recipe costing feature has been a game-changer for our profitability.",
  },
  {
    id: 3,
    name: "Olivia Martinez",
    role: "Operations Manager",
    company: "The Fresh Table",
    image: "/assets/brand/Instagram post - 3.png", // Using placeholder, replace with actual avatar
    stars: 4,
    text: "Managing multiple restaurant locations became so much easier with ShelfWise. The centralized inventory view saves us hours every week on reconciliation.",
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-black mb-4">
            Loved by Restaurants
          </h2>
          <p className="text-gray-800 text-lg max-w-2xl mx-auto">
            See what our customers have to say about how ShelfWise has
            transformed their operations
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
              variants={itemVariants}
            >
              <div className="flex items-center mb-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-5 w-5 ${
                      index < testimonial.stars
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-800 mb-6 italic">"{testimonial.text}"</p>
              <div className="flex items-center">
                <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4 border border-gray-200">
                  <Image
                    src={testimonial.image}
                    alt={`${testimonial.name} avatar`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-black">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-16 text-center">
          <p className="text-lg text-black font-medium mb-2">
            Trusted by restaurants across the country
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 mt-6 opacity-80">
            {/* Replace with actual restaurant brand logos */}
            <div className="relative w-24 h-12 grayscale hover:grayscale-0 transition duration-300">
              <Image
                src="/assets/brand/Instagram post - 3.png"
                alt="Client logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative w-24 h-12 grayscale hover:grayscale-0 transition duration-300">
              <Image
                src="/assets/brand/Instagram post - 3.png"
                alt="Client logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative w-24 h-12 grayscale hover:grayscale-0 transition duration-300">
              <Image
                src="/assets/brand/Instagram post - 3.png"
                alt="Client logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative w-24 h-12 grayscale hover:grayscale-0 transition duration-300">
              <Image
                src="/assets/brand/Instagram post - 3.png"
                alt="Client logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
