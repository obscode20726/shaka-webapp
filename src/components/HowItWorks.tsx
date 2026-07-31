"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import StackedStepCards from "@/components/StackedStepCards";

const homeownerSteps = [
  {
    title: "Search & Browse",
    desc: "Tell us what you need and browse qualified service providers in your area",
    iconSrc: "/icons/MagnifyingGlass.svg",
  },
  {
    title: "Compare & Choose",
    desc: "View profiles, reviews, and pricing to select the perfect provider for your needs",
    iconSrc: "/icons/choose.svg",
  },
  {
    title: "Book & Relax",
    desc: "Schedule your service and let our vetted professionals take care of the rest",
    iconSrc: "/icons/book.svg",
  },
];

const providerSteps = [
  {
    title: "Sign Up",
    desc: "Create your profile and showcase your skills, experience, and certifications",
    iconSrc: "/icons/DeviceMobileCamera.svg",
  },
  {
    title: "Get Booked",
    desc: "Receive job requests from homeowners and build your reputation through reviews",
    iconSrc: "/icons/Star.svg",
  },
  {
    title: "Earn More",
    desc: "Grow your business with steady work and competitive rates in your area",
    iconSrc: "/icons/CurrencyDollarSimple.svg",
  },
];

export default function HowItWorks() {
  const [audience, setAudience] = React.useState<"homeowners" | "providers">(
    "homeowners",
  );

  const steps = audience === "homeowners" ? homeownerSteps : providerSteps;

  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-[22px] sm:text-[26px] font-semibold text-black"
        >
          How Shaka Works
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-sm text-black/60 mt-1"
        >
          Simple, secure, and reliable for both homeowners and service providers
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 flex items-center justify-center"
        >
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
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={audience}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <StackedStepCards steps={steps} />
        </motion.div>
      </AnimatePresence>

      <div className="h-16 sm:h-24" aria-hidden="true" />
    </section>
  );
}
