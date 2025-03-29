"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star, Quote, CheckCircle } from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// Testimonial data
const testimonials = [
  {
    id: 1,
    name: "Sara Johnson",
    role: "Restaurant Owner",
    company: "Bistro Bella",
    image: "/assets/brand/Instagram post - 3.png",
    stars: 5,
    text: "ShelfWise has transformed our inventory management. We've reduced food waste by 40% and streamlined our ordering process. The ROI has been incredible.",
    highlight: "40% less food waste",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Executive Chef",
    company: "Fusion Kitchen",
    image: "/assets/brand/Instagram post - 3.png",
    stars: 5,
    text: "As a chef, I love how ShelfWise helps me track ingredient usage and plan menus. The recipe costing feature has been a game-changer for our profitability.",
    highlight: "Increased profitability",
  },
  {
    id: 3,
    name: "Olivia Martinez",
    role: "Operations Manager",
    company: "The Fresh Table",
    image: "/assets/brand/Instagram post - 3.png",
    stars: 4,
    text: "Managing multiple restaurant locations became so much easier with ShelfWise. The centralized inventory view saves us hours every week on reconciliation.",
    highlight: "Saves hours every week",
  },
];

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="relative py-24 bg-[#EFF1F5] w-full overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      <motion.div
        className="absolute top-40 right-20 w-72 h-72 bg-orange-100 rounded-full opacity-10 blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center px-4 py-1.5 bg-orange-100 rounded-full mb-4">
            <span className="text-sm font-medium text-orange-600">
              Customer stories
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0D1F5A] mb-4">
            Loved by Restaurants
          </h2>
          <p className="mt-4 text-xl text-gray-700 max-w-2xl mx-auto">
            See what our customers have to say about how ShelfWise has
            transformed their operations
          </p>
        </motion.div>

        {/* Testimonials Grid */}
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
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 relative overflow-hidden"
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              {/* Background quotation mark */}
              <div className="absolute -right-4 -top-4 text-gray-100">
                <Quote size={80} />
              </div>

              {/* Highlight badge */}
              <div className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                {testimonial.highlight}
              </div>

              {/* Star rating */}
              <div className="flex items-center mb-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-5 w-5 ${
                      index < testimonial.stars
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>

              {/* Testimonial text */}
              <p className="text-gray-700 mb-8 text-lg relative z-10">
                "{testimonial.text}"
              </p>

              {/* Author info */}
              <div className="flex items-center">
                <div className="h-14 w-14 rounded-full overflow-hidden mr-4 border-2 border-gray-100 shadow-sm">
                  <Image
                    src={testimonial.image}
                    alt={`${testimonial.name} avatar`}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
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

        {/* Trusted By Section */}
        <motion.div
          className="mt-24 relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-2xl py-12 px-8 shadow-lg">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Trusted by restaurants across the country
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Join hundreds of restaurants that have transformed their
                inventory management with ShelfWise
              </p>
            </div>

            {/* Logo grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
              {[1, 2, 3, 4].map((index) => (
                <motion.div
                  key={index}
                  className="relative w-32 h-16 grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                  whileHover={{ scale: 1.05 }}
                >
                  <Image
                    src="/assets/brand/Instagram post - 3.png"
                    alt="Client logo"
                    fill
                    className="object-contain"
                  />
                </motion.div>
              ))}
            </div>
          </div>
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
