"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

export default function Hero() {
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

  const trustIndicatorVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section
      className="w-full"
      style={{
        background: "linear-gradient(180deg, #FFF7ED 0%, #FFFFFF 100%)",
      }}
    >
      <motion.div
        className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8 py-14 sm:py-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center max-w-[860px] mx-auto">
          <motion.h1
            variants={itemVariants}
            className="text-[36px] sm:text-[32px] md:text-[44px] leading-[1.2] sm:leading-[1.15] font-semibold tracking-tight text-black"
          >
            <span className="block sm:hidden">Connect with</span>
            <span className="block sm:hidden">trusted</span>
            <span className="hidden sm:inline">Connect with trusted</span>
            <br className="hidden sm:block" />

            <span className="relative inline-block text-[#ff6a00] mt-1 sm:mt-0">
              service providers
              <motion.svg
                className="absolute left-1/2 -translate-x-1/2 -bottom-4 sm:-bottom-5 md:-bottom-6 w-[180px] sm:w-[240px]"
                viewBox="0 0 200 20"
                fill="none"
                aria-hidden="true"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut", delay: 0.8 }}
              >
                <path
                  d="M2 10C60 0 140 0 198 10"
                  stroke="#ff6a00"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </motion.svg>
            </span>

            <span className="block pt-5 sm:pt-2">in your area</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 sm:mt-4 text-black/70 text-sm sm:text-base leading-relaxed max-w-[320px] sm:max-w-none mx-auto"
          >
            From electricians to cleaners, find skilled professionals for all
            your home service needs. Vetted, reliable, and ready to help.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-8 sm:mt-6 flex items-center justify-center gap-2 sm:gap-3"
          >
            <motion.button
              className="h-10 px-4 sm:px-5 rounded-lg sm:rounded-md bg-[#ff6a00] text-white text-sm font-medium hover:brightness-95"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Find Services
            </motion.button>

            <motion.button
              className="h-10 px-4 sm:px-5 rounded-lg sm:rounded-md bg-white border border-black/10 text-sm font-medium text-black hover:bg-black/[.04]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Join as Provider
            </motion.button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-8 sm:mt-6 flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-black/60"
          >
            <motion.div
              variants={trustIndicatorVariants}
              className="flex items-center gap-2"
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-yellow-500">★</span>
              <span>4.8/5 Average Rating</span>
            </motion.div>

            <motion.div
              variants={trustIndicatorVariants}
              className="flex items-center gap-2"
              whileHover={{ scale: 1.1 }}
            >
              <span>🔍</span>
              <span>10k+ Services Completed</span>
            </motion.div>

            <motion.div
              variants={trustIndicatorVariants}
              className="flex items-center gap-2"
              whileHover={{ scale: 1.1 }}
            >
              <span>🔒</span>
              <span>500+ Trusted Providers</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
