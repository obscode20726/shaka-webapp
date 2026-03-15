"use client";

import React from "react";

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

  return (
    <section className="bg-[#f6f7f9] py-12 sm:py-16">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-[22px] sm:text-[26px] font-semibold text-black">
          How Shaka Works
        </h2>
        <p className="text-center text-sm text-black/60 mt-1">
          Simple, secure, and reliable for both homeowners and service providers
        </p>

        <div className="mt-6 flex items-center justify-center">
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
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((s, idx) => (
            <article
              key={s.title}
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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
