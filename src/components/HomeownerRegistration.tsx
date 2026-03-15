"use client";

import Link from "next/link";
import React, { useState } from "react";

const STEPS = [
  { key: "service", label: "Service", percent: 25 },
  { key: "location", label: "Location", percent: 50 },
  { key: "provider", label: "Provider", percent: 75 },
  { key: "details", label: "Details", percent: 100 },
];

const SERVICES = [
  { id: "removal", label: "Removal Service", emoji: "🚚" },
  { id: "plumbing", label: "Plumbing", emoji: "🔧" },
  { id: "gardening", label: "Gardening", emoji: "🌱" },
  { id: "cleaning", label: "Cleaning", emoji: "✨" },
  { id: "painting", label: "Painting", emoji: "🎨" },
];

const PROVIDERS = [
  {
    id: "john",
    name: "John Smith",
    rating: "4.9 (127 reviews)",
    distance: "2.3 miles away",
    tags: ["Residential Wiring", "Panel Upgrades", "Emergency Repairs"],
    availability: "Available Today",
  },
  {
    id: "sarah",
    name: "Sarah Johnson",
    rating: "4.8 (89 reviews)",
    distance: "3.5 miles away",
    tags: ["Smart Home Installation", "LED Lighting", "Outlet Installation"],
    availability: "Available Tomorrow",
  },
  {
    id: "mike",
    name: "Mike Rodriguez",
    rating: "4.7 (156 reviews)",
    distance: "5.1 miles away",
    tags: ["Commercial Electric", "Generator Installation", "Troubleshooting"],
    availability: "Available This Week",
  },
];

export default function HomeownerRegistration() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [form, setForm] = useState({
    city: "",
    address: "",
    date: "",
    time: "",
    description: "",
    fullName: "",
    email: "",
    phone: "",
  });

  const isSuccess = step === 5;
  const currentStep = STEPS[step - 1] ?? STEPS[STEPS.length - 1];

  const goBack = () => {
    if (step === 1) return;
    setStep((s) => s - 1);
  };

  const goNext = () => {
    if (step < 5) setStep((s) => s + 1);
  };

  const update = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  return (
    <section className="min-h-screen bg-[#f6f7f9] py-8 sm:py-12">
      <div className="mx-auto max-w-[720px] px-4 sm:px-6">
        {/* Top nav */}
        <div className="mb-6 flex items-center justify-between">
          {step === 1 ? (
            <Link href="/" className="text-sm text-black/60 hover:text-black">
              ← Back to Home
            </Link>
          ) : !isSuccess ? (
            <button
              type="button"
              onClick={goBack}
              className="text-sm text-black/60 hover:text-black"
            >
              ← Previous
            </button>
          ) : (
            <span />
          )}
          {!isSuccess && (
            <span className="text-sm font-medium text-black/70">
              Step {step} of 4
            </span>
          )}
        </div>

        {/* Tabs + progress bar */}
        {!isSuccess && (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm text-black/70">
              <div className="flex gap-6">
                {STEPS.map((s, idx) => (
                  <span
                    key={s.key}
                    className={`pb-1 border-b-2 text-xs sm:text-sm ${
                      step === idx + 1
                        ? "border-[#ff6a00] text-[#ff6a00] font-medium"
                        : "border-transparent text-black/50"
                    }`}
                  >
                    {s.label}
                  </span>
                ))}
              </div>
              <span className="hidden text-xs text-black/60 sm:inline">
                {currentStep.percent}% Complete
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
              <div
                className="h-full rounded-full bg-[#ff6a00] transition-all duration-300"
                style={{ width: `${currentStep.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Step 1: Service */}
        {step === 1 && (
          <div className="rounded-2xl border border-black/[.06] bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-lg font-semibold text-black sm:text-xl">
              What service do you need?
            </h1>
            <p className="mt-1 text-sm text-black/60">
              Select the type of service you&apos;re looking for
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SERVICES.map((service) => {
                const active = selectedService === service.id;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedService(service.id)}
                    className={`flex h-24 flex-col items-center justify-center rounded-xl border text-sm font-medium transition-colors ${
                      active
                        ? "border-[#ff6a00] bg-[#fff5ee]"
                        : "border-black/[.08] bg-white hover:bg-black/[.02]"
                    }`}
                  >
                    <span className="mb-1 text-2xl">{service.emoji}</span>
                    <span className="text-black">{service.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-lg bg-[#ff6a00] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#e05d00]"
              >
                Continue <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="rounded-2xl border border-black/[.06] bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-lg font-semibold text-black sm:text-xl">
              Where do you need the service?
            </h1>
            <p className="mt-1 text-sm text-black/60">
              Select your location to find nearby providers
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Service Location
                </label>
                <select
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm text-black/80 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                >
                  <option value="">Select your city</option>
                  <option value="San Francisco, CA">San Francisco, CA</option>
                  <option value="San Jose, CA">San Jose, CA</option>
                  <option value="Oakland, CA">Oakland, CA</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Specific Address{" "}
                  <span className="text-black/50">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your street address"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm placeholder:text-black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-lg bg-[#ff6a00] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#e05d00]"
              >
                Continue <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Provider */}
        {step === 3 && (
          <div className="rounded-2xl border border-black/[.06] bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-lg font-semibold text-black sm:text-xl">
              Choose a Provider
            </h1>
            <p className="mt-1 text-sm text-black/60">
              Select from vetted professionals in your area
            </p>

            <div className="mt-6 space-y-4">
              {PROVIDERS.map((p) => {
                const active = selectedProvider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProvider(p.id)}
                    className={`w-full rounded-2xl border bg-white p-4 text-left transition-colors sm:p-5 ${
                      active
                        ? "border-[#ff6a00] bg-[#fffaf6]"
                        : "border-black/[.08] hover:bg:black/[.02]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-black/10" />
                        <div>
                          <p className="font-semibold text-black">{p.name}</p>
                          <p className="mt-0.5 text-xs text-black/60">
                            ⭐ {p.rating} · {p.distance}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {p.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-black/[.03] px-2 py-0.5 text-[11px] text-black/70"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm font-medium text-green-600">
                      ● {p.availability}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-lg bg-[#ff6a00] px-5 py-2.5 text-sm font-medium text:white hover:bg-[#e05d00]"
              >
                Continue <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Booking Details */}
        {step === 4 && (
          <div className="rounded-2xl border border-black/[.06] bg:white p-6 shadow-sm sm:p-8">
            <h1 className="text-lg font-semibold text:black sm:text-xl">
              Booking Details
            </h1>
            <p className="mt-1 text-sm text:black/60">
              When would you like the service and tell us about your project
            </p>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text:black">
                    Select Date
                  </label>
                  <input
                    type="text"
                    placeholder="Pick a date"
                    value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                    className="w-full rounded-lg border border:black/15 bg:white px-3 py-2.5 text-sm placeholder:text:black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text:black">
                    Preferred Time
                  </label>
                  <select
                    value={form.time}
                    onChange={(e) => update("time", e.target.value)}
                    className="w-full rounded-lg border:border-black/15 bg:white px-3 py-2.5 text-sm text:black/80 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                  >
                    <option value="">Select time</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="5:00 PM">5:00 PM</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text:black">
                  Project Description
                </label>
                <textarea
                  placeholder="Describe what you need help with..."
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={5}
                  className="w-full resize-none rounded-lg border:border-black/15 bg:white px-3 py-2.5 text-sm placeholder:text:black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h2 className="text-sm font-semibold text:black">
                  Contact Information
                </h2>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text:black">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={form.fullName}
                      onChange={(e) => update("fullName", e.target.value)}
                      className="w-full rounded-lg border:border-black/15 bg:white px-3 py-2.5 text-sm placeholder:text:black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text:black">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="Your email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className="w-full rounded-lg border:border-black/15 bg:white px-3 py-2.5 text-sm placeholder:text:black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text:black">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="Your phone number"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className="w-full rounded-lg border:border-black/15 bg:white px-3 py-2.5 text-sm placeholder:text:black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-lg bg-[#ff6a00] px-5 py-2.5 text-sm font-medium text:white hover:bg-[#e05d00]"
              >
                Book Service <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Success: Booking Request Sent */}
        {isSuccess && (
          <div className="rounded-2xl border border:black/[.06] bg:white p-6 text-center shadow-sm sm:p-8">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
                ✓
              </div>
            </div>
            <h1 className="text-xl font-semibold text:black">
              Booking Request Sent!
            </h1>
            <p className="mt-1 text-sm text:black/60">
              Your booking request has been sent to the provider.
            </p>

            <div className="mt-6 mx-auto max-w-xl rounded-2xl border:border-black/10 bg:black/[.02] p-5 text-left">
              <p className="text-sm font-semibold text:black">
                Booking Summary
              </p>
              <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-2 text-sm text:black/80">
                <span className="text:black/60">Provider</span>
                <span>John Smith</span>
                <span className="text:black/60">Date</span>
                <span>{form.date || "February 2nd, 2026"}</span>
                <span className="text:black/60">Time</span>
                <span>{form.time || "10:00 AM"}</span>
                <span className="text:black/60">Location</span>
                <span>{form.city || "San Francisco, CA"}</span>
                <span className="text:black/60">Contact</span>
                <span>{form.phone || "67783"}</span>
              </div>
            </div>

            <div className="mt-6 mx-auto max-w-xl rounded-xl border border-[#1a73e8]/20 bg-[#e8f1ff] p-4 text-left">
              <p className="text-sm font-semibold text:black">
                What happens next?
              </p>
              <ul className="mt-2 space-y-1 text-sm text:black/80">
                <li>
                  • The provider will visit your location at the scheduled time
                </li>
                <li>
                  • They&apos;ll assess the work and create a detailed quote
                </li>
                <li>
                  • You&apos;ll receive the quote in your dashboard for review
                </li>
                <li>• Once you approve, payment will be held in escrow</li>
                <li>• Payment is released after work is completed</li>
              </ul>
            </div>

            <button
              type="button"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[#ff6a00] px-5 py-3 text-sm font-medium text:white hover:bg-[#e05d00]"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
