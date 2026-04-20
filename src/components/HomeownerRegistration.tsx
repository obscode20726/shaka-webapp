"use client";

import Link from "next/link";
import React, { useState } from "react";
import { apiRequest } from "@/lib/api";
import {
  isValidRwandanMobile,
  normalizeRwandanMobileDigits,
} from "@/lib/phone";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

const STEPS = [
  { key: "location", label: "Location", percent: 50 },
  { key: "contact", label: "Contact & Sign up", percent: 100 },
];

export default function HomeownerRegistration() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState({
    city: "",
    province: "kigali",
    address: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSuccess = step === 3;
  const currentStep = STEPS[step - 1] ?? STEPS[STEPS.length - 1];

  const goBack = () => {
    if (step === 1) return;
    setStep((s): 1 | 2 | 3 => (s <= 1 ? 1 : ((s - 1) as 1 | 2 | 3)));
  };

  const goNext = () => {
    if (step === 1) setStep(2);
  };

  const update = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };
  const handleHomeownerSignup = async () => {
    if (!form.email?.trim() || !form.password || !form.phone) {
      setError("Email, phone, and password are required.");
      return;
    }

    if (!isValidEmail(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isValidRwandanMobile(form.phone)) {
      setError("Please enter a valid Rwandan phone number (e.g. 0781234567).");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!form.fullName || !form.province || !form.city) {
      setError("Full name, province, and city are required.");
      return;
    }

    const phoneDigits = normalizeRwandanMobileDigits(form.phone);

    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          confirmPassword: form.confirmPassword,
          userType: "homeowner",
          phone: phoneDigits,
        }),
      });

      const token = data?.token ?? data?.access_token;
      if (!token) throw new Error("Signup succeeded but no token was returned.");

      localStorage.setItem("token", token);
      if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));

      // Create the homeowner profile (required by the backend).
      await apiRequest("/homeowners", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.fullName,
          province: form.province,
          city: form.city,
          address: form.address,
        }),
      });

      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
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
              Step {step} of 2
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

        {/* Step 1: Location */}
        {step === 1 && (
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
                  Province
                </label>
                <select
                  value={form.province}
                  onChange={(e) => update("province", e.target.value)}
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm text-black/80 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                >
                  <option value="">Select your province</option>
                  <option value="kigali">kigali</option>
                  <option value="north">north</option>
                  <option value="south">south</option>
                  <option value="east">east</option>
                  <option value="west">west</option>
                </select>
              </div>
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
                  <option value="Nyarugenge">Nyarugenge</option>
                  <option value="Gasabo">Gasabo</option>
                  <option value="Kicukiro">Kicukiro</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Specific Address <span className="text-black/50">(Optional)</span>
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

        {/* Step 2: Contact Information */}
        {step === 2 && (
          <div className="rounded-2xl border border-black/[.06] bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-lg font-semibold text-black sm:text-xl">
              Contact Information
            </h1>
            <p className="mt-1 text-sm text-black/60">
              Share your details so providers can reach you
            </p>

            <div className="mt-6 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm placeholder:text-black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm placeholder:text-black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Phone number
                </label>
                <input
                  type="tel"
                  placeholder="0781234567"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm placeholder:text-black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                />
                <p className="mt-1.5 text-xs text-black/50">
                  You&apos;ll sign in with this number and your password.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm placeholder:text-black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm placeholder:text-black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                />
              </div>
            </div>

            <div className="mt-6">
              {error ? (
                <p className="text-red-500 text-sm">{error}</p>
              ) : null}
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleHomeownerSignup}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#ff6a00] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#e05d00]"
                >
                  {loading ? "Creating..." : "Sign Up"} <span>→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success: Account Created */}
        {isSuccess && (
          <div className="rounded-2xl border border-black/[.06] bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
                ✓
              </div>
            </div>
            <h1 className="text-xl font-semibold text-black">
              Welcome to Shaka!
            </h1>
            <p className="mt-1 text-sm text-black/60">
              Your homeowner account has been created successfully.
            </p>

            <div className="mt-6 mx-auto max-w-xl rounded-2xl border border-black/10 bg-black/[.02] p-5 text-left">
              <p className="text-sm font-semibold text-black">
                Profile Summary
              </p>
              <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-black/80">
                <span className="text-black/60">Province</span>
                <span>{form.province || "Not provided"}</span>
                <span className="text-black/60">City</span>
                <span>{form.city || "Not provided"}</span>
                <span className="text-black/60">Address</span>
                <span>{form.address || "Not provided"}</span>
                <span className="text-black/60">Name</span>
                <span>{form.fullName || "Not provided"}</span>
                <span className="text-black/60">Email</span>
                <span>{form.email || "Not provided"}</span>
                <span className="text-black/60">Phone</span>
                <span>{form.phone || "Not provided"}</span>
              </div>
            </div>

            <div className="mt-6 mx-auto max-w-xl rounded-xl border border-[#1a73e8]/20 bg-[#e8f1ff] p-4 text-left">
              <p className="text-sm font-semibold text-black">
                What happens next?
              </p>
              <ul className="mt-2 space-y-1 text-sm text-black/80">
                <li>
                  • Browse providers near your location
                </li>
                <li>
                  • Create a service request when you need help
                </li>
                <li>
                  • Receive quotes and manage your bookings
                </li>
              </ul>
            </div>

            <Link
              href="/homeowner/dashboard"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[#ff6a00] px-5 py-3 text-sm font-medium text-white hover:bg-[#e05d00]"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
