import React from "react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Homeowner",
    text: "Found an amazing electrician through Shaka who fixed our kitchen wiring quickly and professionally. The booking process was so easy!",
  },
  {
    name: "Mike Chen",
    role: "Plumber",
    text: "As a service provider, Shaka has helped me grow my business significantly. Great platform with genuine customers and fair pricing.",
  },
  {
    name: "Lisa Rodriguez",
    role: "Homeowner",
    text: "The gardener I hired through Shaka transformed our backyard completely. Highly recommend for anyone looking for quality services.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-[22px] sm:text-[26px] font-semibold text-black">
          What Our Users Say
        </h2>
        <p className="text-center text-sm text-black/60 mt-1">
          Don&apos;t just take our word for it - hear from homeowners and
          providers who use Shaka
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <figure
              key={i}
              className="rounded-xl border border-black/[.08] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <div className="text-[#ffb400]">★★★★★</div>
              <blockquote className="mt-2 text-sm text-black/80">
                {t.text}
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-black/10" />
                <div>
                  <p className="text-sm font-medium text-black">{t.name}</p>
                  <p className="text-xs text-black/60">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
