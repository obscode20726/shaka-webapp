"use client";

import React from "react";
import CountUp from "react-countup";
import { motion, Variants } from "framer-motion";

export default function CTA() {
  const stats = [
    { value: 10000, suffix: "+", label: "Jobs Completed" },
    { value: 500, suffix: "+", label: "Verified Providers" },
    { value: 4.8, suffix: "★", label: "Average Rating", decimals: 1 },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section className="bg-gradient-to-r from-[#ff6a00] to-[#ff4d00] text-white py-16">
      <motion.div
        className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ margin: "-100px" }}
      >
        {/* Title */}
        <motion.h2
          variants={itemVariants}
          className="text-3xl sm:text-4xl font-semibold"
        >
          Ready to get started with Shaka?
        </motion.h2>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="mt-3 text-white/90 max-w-[650px] mx-auto"
        >
          Join thousands of homeowners and service providers who trust Shaka for
          their home service needs
        </motion.p>

        {/* Buttons */}
        <motion.div
          variants={itemVariants}
          className="mt-6 flex justify-center gap-4 flex-wrap"
        >
          <button className="h-11 px-6 rounded-lg bg-white text-[#ff5a00] font-medium hover:bg-gray-100 transition">
            Find Services Now →
          </button>

          <button className="h-11 px-6 rounded-lg bg-white/20 backdrop-blur border border-white/30 hover:bg-white/30 transition">
            Become a Provider
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          className="hidden sm:grid mt-12 grid-cols-3 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group rounded-xl border border-white/30 bg-white/10 backdrop-blur-md py-8
              transition duration-300 hover:-translate-y-2 hover:bg-white/20 hover:shadow-2xl"
            >
              <p className="text-3xl font-semibold">
                <CountUp
                  end={stat.value}
                  duration={2}
                  decimals={stat.decimals || 0}
                />
                {stat.suffix}
              </p>

              <p className="text-sm text-white/80 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}