"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

const homeownerSteps = [
  {
    title: "Search & Browse",
    desc: "Tell us what you need and browse qualified service providers in your area",
    emoji: "🔎",
  },
  {
    title: "Compare & Choose",
    desc: "View profiles, reviews, and pricing to select the perfect provider for your needs",
    emoji: "👥",
  },
  {
    title: "Book & Relax",
    desc: "Schedule your service and let our vetted professionals take care of the rest",
    emoji: "🗓️",
  },
];

const providerSteps = [
  {
    title: "Sign Up",
    desc: "Create your profile and showcase your skills, experience, and certifications",
    emoji: "📱",
  },
  {
    title: "Get Booked",
    desc: "Receive job requests from homeowners and build your reputation through reviews",
    emoji: "⭐",
  },
  {
    title: "Earn More",
    desc: "Grow your business with steady work and competitive rates in your area",
    emoji: "💰",
  },
];

export default function HowItWorks() {
  const [audience, setAudience] = React.useState<"homeowners" | "providers">(
    "homeowners",
  );

  const steps = audience === "homeowners" ? homeownerSteps : providerSteps;

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
    <section className="bg-[#F9FAFB] py-12 sm:py-16">
      <motion.div
        className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ margin: "-100px" }}
      >
        <motion.h2
          variants={itemVariants}
          className="text-center text-[22px] sm:text-[26px] font-semibold text-black"
        >
          How Shaka Works
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-center text-sm text-black/60 mt-1"
        >
          Simple, secure, and reliable for both homeowners and service providers
        </motion.p>

        <motion.div variants={itemVariants} className="mt-6 flex items-center justify-center">
          <div className="inline-flex rounded-full bg-[#ECECF0] p-1 border border-black/10">
            <button
              type="button"
              onClick={() => setAudience("homeowners")}
              className={`px-4 py-1 rounded-full text-sm transition-colors ${
                audience === "homeowners"
                  ? "bg-white text-black shadow-sm"
                  : "text-black/70 hover:text-black"
              }`}
            >
              For Homeowners
            </button>
            <button
              type="button"
              onClick={() => setAudience("providers")}
              className={`px-4 py-1 rounded-full text-sm transition-colors ${
                audience === "providers"
                  ? "bg-white text-black shadow-sm"
                  : "text-black/70 hover:text-black"
              }`}
            >
              For Service Providers
            </button>
          </div>
        </motion.div>

        <motion.div
          key={audience}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {steps.map((s, idx) => (
            <motion.article
              key={s.title}
              variants={itemVariants}
              className="rounded-xl border border-black/[.08] bg-white p-5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#fff5ee] text-2xl">
                {s.emoji}
              </div>
              <p className="text-xs uppercase tracking-wide text-[#ff6a00]">
                Step {idx + 1}
              </p>
              <h3 className="mt-1 font-semibold text-black">{s.title}</h3>
              <p className="mt-1 text-sm text-black/60">{s.desc}</p>
            </motion.article>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
