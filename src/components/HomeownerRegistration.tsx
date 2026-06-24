"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { apiRequest, type AuthTokenResponse } from "@/lib/api";
// import SignupOtpVerification from "@/components/SignupOtpVerification";
import {
  isValidRwandanMobile,
  normalizeRwandanMobileDigits,
} from "@/lib/phone";

const INPUT =
  "h-9 w-full rounded-lg border-0 bg-[#f0f0f2] px-3 text-sm text-black outline-none placeholder:text-[#697282] focus:ring-2 focus:ring-[#ff6a00]/35";

const STEPS = [
  { label: "Account Setup", percent: 25 },
  { label: "Account Setup", percent: 50 },
  { label: "Account Setup", percent: 75 },
];

type Step = 1 | 2 | 3 | 4 | 5;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function HomeownerRegistration() {
  const [step, setStep] = React.useState<Step>(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState({
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    emergencyContact: "",
    notifEmail: true,
    notifSMS: false,
    notifBooking: true,
    notifPromo: false,
    agreeTerms: false,
    agreePrivacy: false,
    province: "kigali",
  });

  const update = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const isSuccess = step === 5;
  const stepMeta = STEPS[step - 1] ?? STEPS[2];

  const goBack = () => {
    if (step <= 1) return;
    setError("");
    setStep((current) => (current - 1) as Step);
  };

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
    if (!form.email.trim()) {
      setError("Email address is required.");
      return;
    }
    if (!isValidEmail(form.email)) {
      setError("Enter a valid email address.");
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

  const handleSubmit = async () => {
    setError("");

    if (!form.agreeTerms || !form.agreePrivacy) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    try {
      setLoading(true);
      const phoneDigits = normalizeRwandanMobileDigits(form.phone);

      const data = await apiRequest<AuthTokenResponse>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email: form.email.trim(),
          phone: phoneDigits,
          password: form.password,
          confirmPassword: form.confirmPassword,
          userType: "homeowner",
        }),
      });

      // Persist authentication and create profile directly without OTP
      if (data?.token || data?.access_token) {
        persistAuth(data);
      } else {
        // If no token returned, login to get token
        const loginData = await apiRequest<AuthTokenResponse>("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            phone: phoneDigits,
            password: form.password,
          }),
        });
        persistAuth(loginData);
      }

      // Create homeowner profile
      await apiRequest("/homeowners", {
        method: "POST",
        body: JSON.stringify(buildHomeownerProfilePayload()),
      });

      setStep(5);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const buildHomeownerProfilePayload = () => {
    const phoneDigits = normalizeRwandanMobileDigits(form.phone);

    return {
      fullName: `${form.firstName} ${form.lastName}`.trim(),
      province: form.province,
      city: form.city,
      address: form.address,
      contactEmail: form.email.trim(),
      contactPhone: phoneDigits,
    };
  };

  const persistAuth = (data: AuthTokenResponse) => {
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

  //   await apiRequest("/homeowners", {
  //     method: "POST",
  //     body: JSON.stringify(buildHomeownerProfilePayload()),
  //   });
  // };

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
  //     sessionStorage.removeItem("pending_homeowner_profile");
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
    <section className="min-h-screen bg-[#f6f7f9] py-16 sm:py-[92px]">
      <div className="mx-auto w-full max-w-[640px] px-4">
        <div className="mb-10 flex items-center justify-between">
          {step === 1 ? (
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-sm font-medium text-black hover:text-black/70"
            >
              <Image src="/icons/back.svg" alt="" width={16} height={16} />
              Back to Home
            </Link>
          ) : (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-3 text-sm font-medium text-black hover:text-black/70"
            >
              <Image src="/icons/back.svg" alt="" width={16} height={16} />
              Previous
            </button>
          )}

          {!isSuccess ? (
            <span className="text-sm text-[#4A5565]">Step {step} of 3</span>
          ) : null}
        </div>

        {!isSuccess ? (
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-sm text-black">
              <span>{stepMeta.label}</span>
              <span>{stepMeta.percent}% Complete</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#e5e7eb]">
              <div
                className="h-full rounded-full bg-[#ff6a00] transition-all duration-300"
                style={{ width: `${stepMeta.percent}%` }}
              />
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <SignupCard>
            <HeaderIcon type="user" />
            <h1 className="mt-5 text-center text-2xl font-medium text-black">
              Create Your Account
            </h1>
            <p className="mt-3 text-center text-base text-[#4A5565]">
              Join Shaka to start booking trusted service providers
            </p>

            <div className="mx-auto mt-6 max-w-[574px] space-y-4">
              <Field label="Phone Number">
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="0787839342"
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label="Email Address">
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="storehaapa@gmail.com"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(event) => update("password", event.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label="Confirm Password">
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={(event) =>
                    update("confirmPassword", event.target.value)
                  }
                  className={INPUT}
                />
              </Field>

              <div className="rounded-lg bg-[#eef6ff] px-4 py-5">
                <p className="text-base font-medium text-black">
                  Why create an account?
                </p>
                <ul className="mt-3 space-y-1.5 text-sm leading-5 text-[#4A5565]">
                  <li>• Track your service bookings and history</li>
                  <li>• Save favorite providers for quick rebooking</li>
                  <li>• Receive updates and manage notifications</li>
                  <li>• Access exclusive deals and promotions</li>
                </ul>
              </div>
            </div>
          </SignupCard>
        ) : null}

        {step === 2 ? (
          <SignupCard>
            <HeaderIcon type="home" />
            <h1 className="mt-5 text-center text-2xl font-medium text-black">
              Complete Your Profile
            </h1>
            <p className="mt-3 text-center text-base text-[#4A5565]">
              Help us provide better service recommendations
            </p>

            <div className="mx-auto mt-6 max-w-[574px] space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="First Name">
                  <input
                    type="text"
                    placeholder="Enter your first name"
                    value={form.firstName}
                    onChange={(event) =>
                      update("firstName", event.target.value)
                    }
                    className={INPUT}
                  />
                </Field>
                <Field label="Last Name">
                  <input
                    type="text"
                    placeholder="Enter your last name"
                    value={form.lastName}
                    onChange={(event) => update("lastName", event.target.value)}
                    className={INPUT}
                  />
                </Field>
              </div>
              <Field label="Home Address">
                <input
                  type="text"
                  placeholder="KG 12 Ave"
                  value={form.address}
                  onChange={(event) => update("address", event.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label="City">
                <input
                  type="text"
                  placeholder="Kigali"
                  value={form.city}
                  onChange={(event) => update("city", event.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label="Emergency Contact (Optional)">
                <input
                  type="text"
                  placeholder="Name and phone number"
                  value={form.emergencyContact}
                  onChange={(event) =>
                    update("emergencyContact", event.target.value)
                  }
                  className={INPUT}
                />
              </Field>
            </div>
          </SignupCard>
        ) : null}

        {step === 3 ? (
          <SignupCard className="min-h-[576px]">
            <HeaderIcon type="shield" />
            <h1 className="mt-5 text-center text-2xl font-medium text-black">
              Preferences &amp; Terms
            </h1>
            <p className="mt-3 text-center text-base text-[#4A5565]">
              Customize your experience and agree to our terms
            </p>

            <div className="mx-auto mt-6 max-w-[574px]">
              <p className="text-sm font-medium text-black">
                Notification Preferences
              </p>
              <div className="mt-3 space-y-3">
                <Checkbox
                  checked={form.notifEmail}
                  label="Email notifications"
                  onChange={(checked) => update("notifEmail", checked)}
                />
                <Checkbox
                  checked={form.notifSMS}
                  label="SMS notifications"
                  onChange={(checked) => update("notifSMS", checked)}
                />
                <Checkbox
                  checked={form.notifBooking}
                  label="Booking updates and reminders"
                  onChange={(checked) => update("notifBooking", checked)}
                />
                <Checkbox
                  checked={form.notifPromo}
                  label="Promotional offers and deals"
                  onChange={(checked) => update("notifPromo", checked)}
                />
              </div>

              <div className="my-6 border-t border-[#d9d9df]" />

              <div className="space-y-4">
                <Checkbox
                  checked={form.agreeTerms}
                  label={
                    <>
                      I agree to the{" "}
                      <Link href="#" className="text-[#ff6a00]">
                        Terms of Service
                      </Link>
                    </>
                  }
                  onChange={(checked) => update("agreeTerms", checked)}
                />
                <Checkbox
                  checked={form.agreePrivacy}
                  label={
                    <>
                      I agree to the{" "}
                      <Link href="#" className="text-[#ff6a00]">
                        Privacy Policy
                      </Link>
                    </>
                  }
                  onChange={(checked) => update("agreePrivacy", checked)}
                />
              </div>
            </div>
          </SignupCard>
        ) : null}

        {isSuccess ? (
          <SignupCard className="px-8 py-12 text-center sm:px-24">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#dcfce7]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00c950] text-white">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m6 12 4 4 8-8"
                  />
                </svg>
              </div>
            </div>
            <h1 className="mt-8 text-3xl font-medium text-black">
              Welcome to Shaka!
            </h1>
            <p className="mt-5 text-base text-[#4A5565]">
              Your account has been verified and your homeowner profile has
              been created successfully.
            </p>

            <div className="mx-auto mt-7 rounded-xl border border-[#d9d9df] p-6 text-left">
              <p className="text-base font-medium text-black">What&apos;s Next?</p>
              <ol className="mt-6 space-y-4">
                {[
                  "Your account has been created successfully",
                  "Sign in anytime with your phone number and password",
                  "Browse and book your first service",
                ].map((item, index) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-base text-black"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ffedd4] text-[#ff5f00]">
                      {index + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>

            <p className="mx-auto mt-7 max-w-[360px] text-sm leading-5 text-[#4A5565]">
              You are signed in and ready to start booking trusted services.
            </p>

            <Link
              href="/homeowner/dashboard"
              className="mx-auto mt-6 flex h-9 max-w-[320px] items-center justify-center rounded-lg bg-[#030014] text-sm font-medium text-white hover:bg-black"
            >
              Go to Dashboard
            </Link>
          </SignupCard>
        ) : null}

        {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

        {!isSuccess ? (
          <div className="mt-6 flex justify-end">
            {step === 1 ? (
              <ActionButton onClick={handleStep1}>Continue</ActionButton>
            ) : step === 2 ? (
              <ActionButton onClick={handleStep2}>Continue</ActionButton>
            ) : (
              <ActionButton disabled={loading} onClick={handleSubmit}>
                {loading ? "Creating..." : "Create Account"}
              </ActionButton>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SignupCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[#d9d9df] bg-white px-8 py-9 ${className}`}
    >
      {children}
    </div>
  );
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-black">{label}</span>
      {children}
    </label>
  );
}

function Checkbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: React.ReactNode;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-black">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-[#d9d9df] accent-[#030014]"
      />
      <span>{label}</span>
    </label>
  );
}

function ActionButton({
  children,
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 items-center gap-3 rounded-lg bg-[#ffaf75] px-4 text-sm font-medium text-white hover:bg-[#ff8d3d] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
      <span aria-hidden="true">&rarr;</span>
    </button>
  );
}

function HeaderIcon({ type }: { type: "home" | "shield" | "user" }) {
  const paths = {
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
      </>
    ),
    home: (
      <>
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M6 10.5V20h12v-9.5" />
        <path d="M10 20v-6h4v6" />
      </>
    ),
    shield: (
      <path d="M12 3 5 6v5c0 5 3.5 8 7 10 3.5-2 7-5 7-10V6l-7-3Z" />
    ),
  };

  return (
    <div className="flex justify-center">
      <svg
        className="h-11 w-11 text-[#ff6a00]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.1}
        aria-hidden="true"
      >
        {paths[type]}
      </svg>
    </div>
  );
}
