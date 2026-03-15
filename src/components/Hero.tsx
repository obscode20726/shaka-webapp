import React from "react";

export default function Hero() {
  return (
    <section className="w-full bg-[#fff5ee]">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center max-w-[860px] mx-auto">
          <h1 className="text-[24px] sm:text-[32px] md:text-[44px] leading-[1.15] font-semibold tracking-tight text-black gap-2">
            Connect with trusted
            <br className="hidden sm:block" />

            <span className="relative inline-block text-[#ff6a00]">
              service providers

              {/* Orange underline */}
              <svg
                className="absolute left-1/2 -translate-x-1/2 -bottom-5 md:-bottom-6 w-[180px] sm:w-[240px]"
                viewBox="0 0 200 20"
                fill="none"
              >
                <path
                  d="M2 10C60 0 140 0 198 10"
                  stroke="#ff6a00"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>

            <span className="block pt-2">in your area</span>
          </h1>

          <p className="mt-4 text-black/70 text-sm sm:text-base">
            From electricians to cleaners, find skilled professionals for all
            home service needs. Vetted, reliable, and ready to help.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button className="h-10 px-5 rounded-md bg-[#ff6a00] text-white text-sm font-medium hover:brightness-95">
              Find Services
            </button>

            <button className="h-10 px-5 rounded-md border border-black/10 text-sm font-medium text-black hover:bg-black/[.04]">
              Join as Provider
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-black/60">
            <div className="flex items-center gap-2">
              <span>⭐</span>
              <span>4.8/5 Average Rating</span>
            </div>

            <div className="flex items-center gap-2">
              <span>🔍</span>
              <span>10k+ Services Completed</span>
            </div>

            <div className="flex items-center gap-2">
              <span>🔒</span>
              <span>500+ Trusted Providers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}