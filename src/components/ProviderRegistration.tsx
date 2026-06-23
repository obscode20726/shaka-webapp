"use client";

import Link from "next/link";
import React, { useState } from "react";
import { apiRequest } from "@/lib/api";
// import SignupOtpVerification from "@/components/SignupOtpVerification";
import {
  isValidRwandanMobile,
  normalizeRwandanMobileDigits,
} from "@/lib/phone";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

const STEPS = [
  { label: "Create account", percent: 25 },
  { label: "Professional info", percent: 50 },
  { label: "Verification", percent: 75 },
  { label: "Email verification", percent: 90 },
  { label: "Complete", percent: 100 },
];

function parseYearsExperience(value: string) {
  if (value === "5+") return 5;

  const firstNumber = Number(value.split("-")[0]);
  return Number.isFinite(firstNumber) ? firstNumber : 0;
}

export default function ProviderRegistration() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    businessName: "",
    phone2: "",
    primaryService: "",
    yearsExperience: "",
    serviceArea: "",
    serviceDescription: "",
    identificationNumber: "",
    consentBackground: false,
    consentTerms: false,
    consentPrivacy: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buildProviderProfilePayload = () => ({
    firstName: form.firstName,
    lastName: form.lastName,
    businessName: form.businessName,
    primaryService: form.primaryService,
    yearsExperience: parseYearsExperience(form.yearsExperience),
    serviceArea: form.serviceArea,
    serviceDescription: form.serviceDescription,
    identificationNumber: form.identificationNumber,
    consentBackground: form.consentBackground,
    consentTerms: form.consentTerms,
    consentPrivacy: form.consentPrivacy,
  });

  const persistAuth = (data: {
    token?: string;
    access_token?: string;
    user?: unknown;
  }) => {
    const token = data.token ?? data.access_token;
    if (!token) {
      throw new Error("Authentication succeeded but no token was returned.");
    }

    localStorage.setItem("token", token);
    document.cookie = `token=${encodeURIComponent(token)}; Path=/; SameSite=Lax`;

    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
  };

  // OTP-related functions commented out until backend OTP is ready
  // const completeProfileAfterOtp = async (verificationData?: {
  //   token?: string;
  //   access_token?: string;
  //   user?: unknown;
  // }) => {
  //   if (verificationData?.token || verificationData?.access_token) {
  //     persistAuth(verificationData);
  //   } else {
  //     const loginData = await apiRequest("/auth/login", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         phone: normalizeRwandanMobileDigits(form.phone),
  //         password: form.password,
  //       }),
  //     });
  //     persistAuth(loginData);
  //   }

  //   await apiRequest("/providers", {
  //     method: "POST",
  //     body: JSON.stringify(buildProviderProfilePayload()),
  //   });
  // };

  const handleProviderSignup = async () => {
    if (!validateStep1()) {
      setStep(1);
      return;
    }

    if (!validateStep2()) {
      setStep(2);
      return;
    }

    if (
      !form.consentBackground ||
      !form.consentTerms ||
      !form.consentPrivacy
    ) {
      setError("Please accept the verification and terms requirements.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const phoneDigits = normalizeRwandanMobileDigits(form.phone);

      // 1️⃣ Create account
      const authData = await apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email: form.email.trim(),
          phone: phoneDigits,
          password: form.password,
          confirmPassword: form.confirmPassword,
          userType: "provider",
        }),
      });

      // Persist authentication and create profile directly without OTP
      if (authData?.token || authData?.access_token) {
        persistAuth(authData);
      } else {
        // If no token returned, login to get token
        const loginData = await apiRequest("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            phone: phoneDigits,
            password: form.password,
          }),
        });
        persistAuth(loginData);
      }

      // 2️⃣ Create provider profile
      await apiRequest("/providers", {
        method: "POST",
        body: JSON.stringify(buildProviderProfilePayload()),
      });

      // ✅ SUCCESS → go to step 5 (skip OTP step 4)
      setStep(5);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "signup failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // const handleVerifyOtp = async (otp: string) => {
  //   setError("");

  //   try {
  //     setLoading(true);
  //     const verificationData = await apiRequest("/auth/verify-signup-otp", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         email: form.email.trim(),
  //         otp,
  //       }),
  //     });

  //     await completeProfileAfterOtp(verificationData);
  //     sessionStorage.removeItem("pending_signup_email");
  //     sessionStorage.removeItem("pending_provider_profile");
  //     sessionStorage.removeItem("pending_signup_user");
  //     setStep(5);
  //   } catch (err: unknown) {
  //     setError(err instanceof Error ? err.message : "Verification failed");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleResendOtp = async () => {
  //   setError("");

  //   try {
  //     setLoading(true);
  //     await apiRequest("/auth/resend-signup-otp", {
  //       method: "POST",
  //       body: JSON.stringify({ email: form.email.trim() }),
  //     });
  //   } catch (err: unknown) {
  //     setError(err instanceof Error ? err.message : "Unable to resend code");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const currentPercent = STEPS[step - 1]?.percent ?? 100;
  const isSuccess = step === 5;

  const goBack = () => {
    if (step === 1) return;
    setStep((s) => s - 1);
  };

  const validateStep1 = () => {
    if (!isValidEmail(form.email)) {
      setError("Enter a valid email address.");
      return false;
    }

    if (!isValidRwandanMobile(form.phone)) {
      setError("Enter a valid Rwandan phone number (e.g. 0781234567).");
      return false;
    }

    if (!form.password) {
      setError("Password is required.");
      return false;
    }

    if (!form.confirmPassword) {
      setError("Please confirm your password.");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords must match.");
      return false;
    }

    setError("");
    return true;
  };

  const validateStep2 = () => {
    if (!form.firstName) {
      setError("First name is required.");
      return false;
    }

    if (!form.lastName) {
      setError("Last name is required.");
      return false;
    }

    if (!form.primaryService) {
      setError("Primary service is required.");
      return false;
    }

    setError("");
    return true;
  };

  const goNext = () => {
    if (step < 4) setStep((s) => s + 1);
  };

  const update = (key: keyof typeof form, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  // if (step === 4) {
  //   return (
  //     <SignupOtpVerification
  //       email={form.email.trim()}
  //       loading={loading}
  //       error={error}
  //       onBack={() => {
  //         setError("");
  //         setStep(3);
  //       }}
  //       onResend={handleResendOtp}
  //       onVerify={handleVerifyOtp}
  //     />
  //   );
  // }

  return (
    <section className="min-h-screen bg-[#f6f7f9] py-8 sm:py-12">
      <div className="mx-auto max-w-[560px] px-4 sm:px-6">
        {/* Top nav */}
        <div className="mb-6 flex items-center justify-between">
          {step === 1 ? (
            <Link
              href="/get-started"
              className="text-sm text-black/60 hover:text-black"
            >
              ← Back
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
              Step {step} of 3
            </span>
          )}
        </div>

        {/* Progress bar (hide on success) */}
        {!isSuccess && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-black/60 mb-1">
              <span>Provider Registration</span>
              <span>{currentPercent}% Complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-black/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#ff6a00] transition-all duration-300"
                style={{ width: `${currentPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Step 1: Create Your Account */}
        {step === 1 && (
          <div className="rounded-2xl border border-black/[.06] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff5ee] text-2xl text-[#ff6a00]">
                👤
              </div>
            </div>
            <h1 className="text-center text-xl font-semibold text-black">
              Create Your Account
            </h1>
            <p className="mt-1 text-center text-sm text-black/60">
              Start building your business on Shaka
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm placeholder:text-black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="0781234567"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm placeholder:text-black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                />
                <p className="mt-1 text-xs text-black/50">
                  Format: 07XXXXXXXX (Rwandan mobile number)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password."
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 pr-10 text-sm placeholder:text-black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
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

            <div className="mt-6 rounded-xl bg-[#fff5ee] p-4 border border-[#ff6a00]/20">
              <p className="text-sm font-semibold text-black">
                Join thousands of successful providers
              </p>
              <ul className="mt-2 space-y-1 text-sm text-black/70">
                <li>• Connect with customers in your area</li>
                <li>• Manage your own schedule and rates</li>
                <li>• Get paid quickly and securely</li>
                <li>• Grow your business with reviews and referrals</li>
              </ul>
            </div>

            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) goNext();
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-[#ff6a00] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#e05d00]"
              >
                Continue <span>→</span>
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-black/60">
              Already have an account?{" "}
              <Link
                href="/signin/provider"
                className="text-[#ff6a00] hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        )}

        {/* Step 2: Professional Information */}
        {step === 2 && (
          <div className="rounded-2xl border border-black/[.06] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff5ee] text-2xl text-[#ff6a00]">
                🏢
              </div>
            </div>
            <h1 className="text-center text-xl font-semibold text-black">
              Professional Information
            </h1>
            <p className="mt-1 text-center text-sm text-black/60">
              Tell us about yourself and your services
            </p>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Your first name"
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm placeholder:text-black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Your last name"
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm placeholder:text-black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Business Name{" "}
                  <span className="text-black/50">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Your professional or business name"
                  value={form.businessName}
                  onChange={(e) => update("businessName", e.target.value)}
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm placeholder:text-black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                />
                <p className="mt-1 text-xs text-black/50">
                  This will be shown on your profile if provided.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Primary Service
                  </label>
                  <select
                    value={form.primaryService}
                    onChange={(e) => update("primaryService", e.target.value)}
                    className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm text-black/80 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                  >
                    <option value="">Select your service</option>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="gardening">Gardening</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Years of Experience
                  </label>
                  <select
                    value={form.yearsExperience}
                    onChange={(e) => update("yearsExperience", e.target.value)}
                    className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm text-black/80 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                  >
                    <option value="">Select experience</option>
                    <option value="0-1">0-1 years</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5+">5+ years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Service Area
                </label>
                <input
                  type="text"
                  placeholder="Enter your service area (e.g., Kigali)"
                  value={form.serviceArea}
                  onChange={(e) => update("serviceArea", e.target.value)}
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm placeholder:text-black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Service Description
                </label>
                <textarea
                  placeholder="Briefly describe your services and what makes you unique..."
                  value={form.serviceDescription}
                  onChange={(e) => update("serviceDescription", e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm placeholder:text-black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00] resize-none"
                />
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-[#f0f4f8] p-4 border border-black/5">
              <p className="text-sm font-semibold text-black">
                Build Your Profile
              </p>
              <ul className="mt-2 space-y-1 text-sm text-black/70">
                <li>• After signup, you can add your profile picture</li>
                <li>• Upload portfolio photos of your work</li>
                <li>• Set up payment methods to receive earnings</li>
                <li>• Start receiving booking requests immediately</li>
              </ul>
            </div>

            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) goNext();
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-[#ff6a00] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#e05d00]"
              >
                Continue <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Verification & Terms */}
        {step === 3 && (
          <div className="rounded-2xl border border-black/[.06] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff5ee] text-2xl text-[#ff6a00]">
                🛡️
              </div>
            </div>
            <h1 className="text-center text-xl font-semibold text-black">
              Verification & Terms
            </h1>
            <p className="mt-1 text-center text-sm text-black/60">
              Help us verify your credentials
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Identification Number{" "}
                  <span className="text-black/50">(If applicable)</span>
                </label>
                <input
                  type="text"
                  placeholder="Professional identification number"
                  value={form.identificationNumber}
                  onChange={(e) =>
                    update("identificationNumber", e.target.value)
                  }
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm placeholder:text-black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                />
                <p className="mt-1 text-xs text-black/50">
                  Required for plumbing and other licensed trades.
                </p>
              </div>

              <div className="rounded-xl bg-[#e8f1ff] p-4 border border-[#1a73e8]/20">
                <p className="text-sm font-semibold text-black">
                  Verification Process
                </p>
                <ul className="mt-2 space-y-1 text-sm text-black/70">
                  <li>• We&apos;ll verify your license and credentials</li>
                  <li>• Background check will be conducted</li>
                  <li>• Process typically takes 1-2 business days</li>
                  <li>• You can start building your profile while we verify</li>
                </ul>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.consentBackground}
                    onChange={(e) =>
                      update("consentBackground", e.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-black/20 text-[#ff6a00] focus:ring-[#ff6a00]"
                  />
                  <span className="text-sm text-black/80">
                    I consent to a background check and identity verification
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.consentTerms}
                    onChange={(e) => update("consentTerms", e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-black/20 text-[#ff6a00] focus:ring-[#ff6a00]"
                  />
                  <span className="text-sm text-black/80">
                    I agree to the{" "}
                    <Link href="#" className="text-[#ff6a00] hover:underline">
                      Terms of Service
                    </Link>
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.consentPrivacy}
                    onChange={(e) => update("consentPrivacy", e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-black/20 text-[#ff6a00] focus:ring-[#ff6a00]"
                  />
                  <span className="text-sm text-black/80">
                    I agree to the{" "}
                    <Link href="#" className="text-[#ff6a00] hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
              <button
                type="button"
                onClick={handleProviderSignup}
                className="inline-flex items-center gap-2 rounded-lg bg-[#ff6a00] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#e05d00]"
              >
                Create Account <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {isSuccess && (
          <div className="rounded-2xl border border-black/[.06] bg-white p-6 sm:p-8 shadow-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
                ✓
              </div>
            </div>
            <h1 className="text-xl font-semibold text-black">
              Welcome to Shaka!
            </h1>
            <p className="mt-1 text-sm text-black/60">
              Your provider account has been created successfully.
            </p>

            <div className="mt-6 rounded-xl border border-black/10 bg-black/[.02] p-5 text-left">
              <p className="text-sm font-semibold text-black">
                What happens next?
              </p>
              <ol className="mt-3 space-y-2">
                {[
                  "We'll verify your credentials (1-2 days)",
                  "Complete your profile and add photos",
                  "Start receiving booking requests!",
                ].map((text, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-black/80"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fff5ee] text-xs font-medium text-[#ff6a00]">
                      {i + 1}
                    </span>
                    {text}
                  </li>
                ))}
              </ol>
            </div>

            <p className="mt-6 text-sm text-black/60">
              You can access your provider dashboard to manage your business and
              track earnings.
            </p>
            <Link
              href="/dashboard/provider"
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#ff6a00] px-5 py-3 text-sm font-medium text-white hover:bg-[#e05d00]"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
