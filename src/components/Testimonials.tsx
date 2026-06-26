"use client";

import React from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

const testimonials = [
  {
    name: "Marie Claire Uwimana",
    role: "Homeowner",
    text: "Found an amazing electrician through Shaka who fixed our kitchen wiring quickly and professionally. The booking process was so easy!",
    avatarSrc: "/images/mc.png",
  },
  {
    name: "Jean Paul Niyonzima",
    role: "Plumber",
    text: "As a service provider, Shaka has helped me grow my business significantly. Great platform with genuine customers and fair pricing.",
    avatarSrc: "/images/JP.png",
  },
  {
    name: "Claudine Uwimana",
    role: "Homeowner",
    text: "The gardener I hired through Shaka transformed our backyard completely. Highly recommend for anyone looking for quality services.",
    avatarSrc: "/images/CL.png",
  },
];

export default function Testimonials() {
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
    <section className="py-12 sm:py-16">
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
          What Our Users Say
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-center text-sm text-black/60 mt-1"
        >
          Don&apos;t just take our word for it - hear from homeowners and
          providers who use Shaka
        </motion.p>

        <motion.div
          variants={containerVariants}
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {testimonials.map((t, i) => (
            <motion.figure
              key={i}
              variants={itemVariants}
              className="rounded-xl border border-black/[.08] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <div className="text-[#ffb400]">★★★★★</div>
              <blockquote className="mt-2 text-sm text-black/80">
                {t.text}
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <div className="relative h-8 w-8 rounded-full overflow-hidden">
                  <Image
                    src={t.avatarSrc}
                    alt={t.name}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-black">{t.name}</p>
                  <p className="text-xs text-black/60">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
