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

// ── shared input style ────────────────────────────────────────────────────────
const INPUT =
  "w-full rounded-xl bg-[#f2f3f5] px-4 py-3 text-sm text-black/80 placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-[#ff6a00]/40 border border-transparent focus:border-[#ff6a00]/30";

const STEPS = [
  { key: "account", label: "Account Setup", percent: 25 },
  { key: "profile", label: "Account Setup", percent: 50 },
  { key: "preferences", label: "Account Setup", percent: 75 },
];

type Step = 1 | 2 | 3 | 4; // 4 = success

export default function HomeownerRegistration() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // form state
  const [form, setForm] = useState({
    phone: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zipCode: "",
    emergencyContact: "",
    notifEmail: true,
    notifSMS: false,
    notifBooking: true,
    notifPromo: false,
    agreeTerms: false,
    agreePrivacy: false,
    // kept for API compat
    province: "kigali",
    email: "",
  });

  const update = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const isSuccess = step === 4;
  const stepMeta = STEPS[step - 1] ?? STEPS[STEPS.length - 1];

  const goBack = () => {
    if (step <= 1) return;
    setStep((s) => (s - 1) as Step);
  };

  // ── Step 1 → 2 ──────────────────────────────────────────────────────────────
  const handleStep1 = () => {
    setError("");
    if (!form.phone) {
      setError("Phone number is required.");
      return;
    }
    if (!isValidRwandanMobile(form.phone)) {
      setError("Enter a valid Rwandan phone number (e.g. 0781234567).");
      return;
    }
    if (!form.password) {
      setError("Password is required.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setStep(2);
  };

  // ── Step 2 → 3 ──────────────────────────────────────────────────────────────
  const handleStep2 = () => {
    setError("");
    if (!form.firstName || !form.lastName) {
      setError("First and last name are required.");
      return;
    }
    if (!form.city) {
      setError("City is required.");
      return;
    }
    setStep(3);
  };

  // ── Step 3 → submit ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError("");
    if (!form.agreeTerms || !form.agreePrivacy) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    const phoneDigits = normalizeRwandanMobileDigits(form.phone);

    try {
      setLoading(true);

      const data = await apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email: form.email.trim() || undefined,
          password: form.password,
          confirmPassword: form.confirmPassword,
          userType: "homeowner",
          phone: phoneDigits,
        }),
      });

      const token = data?.token ?? data?.access_token;
      if (!token)
        throw new Error("Signup succeeded but no token was returned.");

      localStorage.setItem("token", token);
      if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));

      await apiRequest("/homeowners", {
        method: "POST",
        body: JSON.stringify({
          fullName: `${form.firstName} ${form.lastName}`.trim(),
          province: form.province,
          city: form.city,
          address: form.address,
        }),
      });

      setStep(4);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#f6f7f9] py-8 sm:py-12">
      <div className="mx-auto max-w-[620px] px-4 sm:px-6">
        {/* ── Top nav ── */}
        <div className="mb-5 flex items-center justify-between">
          {step === 1 ? (
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-black/60 hover:text-black"
            >
              ← Back to Home
            </Link>
          ) : !isSuccess ? (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1.5 text-sm text-black/60 hover:text-black"
            >
              ← Previous
            </button>
          ) : (
            <span />
          )}
          {!isSuccess && (
            <span className="text-sm text-black/50">Step {step} of 3</span>
          )}
        </div>

        {/* ── Progress bar ── */}
        {!isSuccess && (
          <div className="mb-6">
            <div className="mb-1.5 flex items-center justify-between text-xs text-black/55">
              <span>{stepMeta.label}</span>
              <span>{stepMeta.percent}% Complete</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
              <div
                className="h-full rounded-full bg-[#ff6a00] transition-all duration-500"
                style={{ width: `${stepMeta.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            STEP 1 — Create Your Account
        ════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="rounded-2xl border border-black/[.06] bg-white p-6 shadow-sm sm:p-8">
            {/* Icon */}
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
                <svg
                  className="h-7 w-7 text-[#ff6a00]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.6}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-center text-2xl font-semibold text-black">
              Create Your Account
            </h1>
            <p className="mt-1 text-center text-sm text-black/50">
              Join Shaka to start booking trusted service providers
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-black">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className={INPUT}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-black">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className={INPUT}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-black">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  className={INPUT}
                />
              </div>

              {/* Why create an account box */}
              <div className="rounded-xl bg-[#eef2fb] px-4 py-3.5">
                <p className="text-sm font-semibold text-black/80">
                  Why create an account?
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-black/60">
                  {[
                    "Track your service bookings and history",
                    "Save favorite providers for quick rebooking",
                    "Receive updates and manage notifications",
                    "Access exclusive deals and promotions",
                  ].map((t) => (
                    <li key={t}>• {t}</li>
                  ))}
                </ul>
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleStep1}
                className="inline-flex items-center gap-2 rounded-xl bg-[#ff6a00] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e05d00] active:bg-[#cc5200] disabled:opacity-60"
              >
                Continue <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            STEP 2 — Complete Your Profile
        ════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="rounded-2xl border border-black/[.06] bg-white p-6 shadow-sm sm:p-8">
            {/* Icon */}
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
                <svg
                  className="h-7 w-7 text-[#ff6a00]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.6}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-center text-2xl font-semibold text-black">
              Complete Your Profile
            </h1>
            <p className="mt-1 text-center text-sm text-black/50">
              Help us provide better service recommendations
            </p>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-black">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your first name"
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-black">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your last name"
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    className={INPUT}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-black">
                  Home Address
                </label>
                <input
                  type="text"
                  placeholder="123 Main Street"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  className={INPUT}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-black">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="San Francisco"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-black">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    placeholder="94102"
                    value={form.zipCode}
                    onChange={(e) => update("zipCode", e.target.value)}
                    className={INPUT}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-black">
                  Emergency Contact{" "}
                  <span className="font-normal text-black/40">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Name and phone number"
                  value={form.emergencyContact}
                  onChange={(e) => update("emergencyContact", e.target.value)}
                  className={INPUT}
                />
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleStep2}
                className="inline-flex items-center gap-2 rounded-xl bg-[#ff6a00] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e05d00] active:bg-[#cc5200]"
              >
                Continue <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            STEP 3 — Preferences & Terms
        ════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="rounded-2xl border border-black/[.06] bg-white p-6 shadow-sm sm:p-8">
            {/* Icon */}
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
                <svg
                  className="h-7 w-7 text-[#ff6a00]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.6}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-center text-2xl font-semibold text-black">
              Preferences &amp; Terms
            </h1>
            <p className="mt-1 text-center text-sm text-black/50">
              Customize your experience and agree to our terms
            </p>

            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold text-black">
                Notification Preferences
              </p>
              <div className="space-y-3">
                {(
                  [
                    { key: "notifEmail", label: "Email notifications" },
                    { key: "notifSMS", label: "SMS notifications" },
                    {
                      key: "notifBooking",
                      label: "Booking updates and reminders",
                    },
                    {
                      key: "notifPromo",
                      label: "Promotional offers and deals",
                    },
                  ] as const
                ).map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center gap-3 text-sm text-black/80"
                  >
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => update(key, e.target.checked)}
                      className="h-4 w-4 rounded accent-black"
                    />
                    {label}
                  </label>
                ))}
              </div>

              <div className="my-5 border-t border-black/8" />

              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 text-sm text-black/80">
                  <input
                    type="checkbox"
                    checked={form.agreeTerms}
                    onChange={(e) => update("agreeTerms", e.target.checked)}
                    className="h-4 w-4 rounded accent-black"
                  />
                  I agree to the&nbsp;
                  <a href="#" className="text-[#ff6a00] hover:underline">
                    Terms of Service
                  </a>
                </label>
                <label className="flex cursor-pointer items-center gap-3 text-sm text-black/80">
                  <input
                    type="checkbox"
                    checked={form.agreePrivacy}
                    onChange={(e) => update("agreePrivacy", e.target.checked)}
                    className="h-4 w-4 rounded accent-black"
                  />
                  I agree to the&nbsp;
                  <a href="#" className="text-[#ff6a00] hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-[#ff6a00] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e05d00] active:bg-[#cc5200] disabled:opacity-60"
              >
                {loading ? "Creating…" : "Create Account"} <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            STEP 4 — Success / Welcome
        ════════════════════════════════════════════ */}
        {isSuccess && (
          <div className="rounded-2xl border border-black/[.06] bg-white p-6 text-center shadow-sm sm:p-8">
            {/* Green check */}
            <div className="mb-5 flex justify-center">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-green-100/70 scale-125" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-green-500">
                  <svg
                    className="h-7 w-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-semibold text-black">
              Welcome to Shaka!
            </h1>
            <p className="mt-1 text-sm text-black/50">
              Your account has been created successfully.
            </p>

            {/* What's Next */}
            <div className="mt-6 rounded-xl border border-black/8 p-5 text-left">
              <p className="text-sm font-semibold text-black">
                What&apos;s Next?
              </p>
              <ul className="mt-3 space-y-3">
                {[
                  "Browse and book your first service",
                  "Track your bookings in your dashboard",
                  "Rate and review completed services",
                ].map((item, i) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-black/80"
                  >
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-[#ff6a00]">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-5 text-sm text-black/45">
              You can access your account dashboard anytime to manage bookings
              and preferences.
            </p>

            <Link
              href="/homeowner/dashboard"
              className="mt-5 flex w-full items-center justify-center rounded-xl bg-black py-3 text-sm font-semibold text-white hover:bg-black/85 active:bg-black/70"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
