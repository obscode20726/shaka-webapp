"use client";

import Link from "next/link";
import React from "react";
import { apiRequest } from "@/lib/api";

type Step = "email" | "verify" | "password" | "success";

type Props = {
  signInHref: string;
};

const RESEND_SECONDS = 60;

function BackLink({
  onClick,
  href,
  label,
}: {
  onClick?: () => void;
  href?: string;
  label: string;
}) {
  const className =
    "inline-flex items-center gap-2 text-sm font-medium text-black/70 hover:text-black";

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        <span aria-hidden="true">&larr;</span>
        {label}
      </button>
    );
  }

  return (
    <Link href={href ?? "#"} className={className}>
      <span aria-hidden="true">&larr;</span>
      {label}
    </Link>
  );
}

function KeyIcon() {
  return (
    <svg
      className="h-7 w-7"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 5.25a3 3 0 1 0-4.243 4.243L5.25 15.75V18h2.25v2.25H9v-1.5h1.5V18H12v-1.5h1.5l4.257-4.257a3 3 0 0 0 0-4.243Z"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className="h-5 w-5 text-black/35"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-8 w-8 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg
      className="h-5 w-5 text-black/35"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8.25l8.954 5.596a1.5 1.5 0 0 0 1.592 0L22.5 8.25M4.5 19.5h15a1.5 1.5 0 0 0 1.5-1.5V6.75A1.5 1.5 0 0 0 19.5 5.25h-15A1.5 1.5 0 0 0 3 6.75v11.25a1.5 1.5 0 0 0 1.5 1.5Z"
      />
    </svg>
  );
}

export default function ForgotPassword({ signInHref }: Props) {
  const [step, setStep] = React.useState<Step>("email");
  const [email, setEmail] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [resendIn, setResendIn] = React.useState(RESEND_SECONDS);
  const [digits, setDigits] = React.useState(Array(6).fill(""));
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);

  React.useEffect(() => {
    if (step !== "verify" || resendIn <= 0) return;

    const timer = window.setTimeout(() => {
      setResendIn((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [step, resendIn]);

  const otpValue = digits.join("");

  const setDigit = (index: number, value: string) => {
    const nextDigit = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = nextDigit;
    setDigits(nextDigits);

    if (nextDigit && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;

    event.preventDefault();
    const nextDigits = Array(6).fill("");
    pasted.slice(0, 6).split("").forEach((digit, index) => {
      nextDigits[index] = digit;
    });
    setDigits(nextDigits);
    inputsRef.current[Math.min(pasted.length, 6) - 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSendCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Email address is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: trimmedEmail }),
      });
      setEmail(trimmedEmail);
      setDigits(Array(6).fill(""));
      setResendIn(RESEND_SECONDS);
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (loading || resendIn > 0) return;

    setError("");
    try {
      setLoading(true);
      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setDigits(Array(6).fill(""));
      setResendIn(RESEND_SECONDS);
      inputsRef.current[0]?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = () => {
    setError("");

    if (otpValue.length !== 6) {
      setError("Enter the full 6-digit verification code.");
      return;
    }

    setOtp(otpValue);
    setPassword("");
    setConfirmPassword("");
    setStep("password");
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          otp,
          password,
          confirmPassword,
        }),
      });
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const cardClass =
    "rounded-2xl border border-black/[.06] bg-white p-6 sm:p-8 shadow-[0_10px_28px_rgba(15,23,42,0.08)]";

  return (
    <section className="min-h-screen bg-[#faf8f5] py-10 sm:py-16">
      <div className="mx-auto max-w-[520px] px-4 sm:px-6">
        <div className="mb-6">
          {step === "email" ? (
            <BackLink href={signInHref} label="Back to Sign In" />
          ) : step === "success" ? null : (
            <BackLink
              label="Back"
              onClick={() => {
                setError("");
                if (step === "verify") setStep("email");
                if (step === "password") setStep("verify");
              }}
            />
          )}
        </div>

        {step === "email" && (
          <div className={cardClass}>
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ffedd4] text-[#ff6a00]">
                <KeyIcon />
              </div>
            </div>

            <h1 className="mt-5 text-center text-2xl font-semibold text-black">
              Reset Password
            </h1>
            <p className="mt-2 text-center text-sm text-black/60">
              Enter your email and we&apos;ll send you a verification code
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSendCode}>
              <div>
                <label
                  htmlFor="forgot-email"
                  className="mb-1.5 block text-sm font-semibold text-black"
                >
                  Email Address
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                    <EnvelopeIcon />
                  </span>
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-[#f3f4f6] py-3 pl-10 pr-3 text-sm placeholder:text-black/40 focus:border-[#ff6a00] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                  />
                </div>
                <p className="mt-1.5 text-xs text-black/50">
                  Enter the email address associated with your account
                </p>
              </div>

              <div className="rounded-xl border border-[#b7d4ff] bg-[#edf5ff] px-4 py-3 text-sm text-[#1640c8]">
                We&apos;ll send a verification code to this email address
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#ff6a00] px-4 py-3 text-sm font-semibold text-white hover:bg-[#e05d00] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </form>
          </div>
        )}

        {step === "verify" && (
          <div className={`${cardClass} text-center`}>
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ffedd4] text-[#ff6a00]">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
              </div>
            </div>

            <h1 className="mt-5 text-2xl font-semibold text-black">
              Verify Your Email
            </h1>
            <p className="mt-3 text-sm leading-6 text-black/60">
              We&apos;ve sent a 6-digit code to{" "}
              <strong className="font-semibold text-black">{email}</strong>
            </p>

            <div className="mt-6 text-left">
              <p className="text-sm font-semibold text-black">
                Enter Verification Code
              </p>
              <div className="mt-3 grid grid-cols-6 gap-2">
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(input) => {
                      inputsRef.current[index] = input;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    onChange={(event) => setDigit(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={handlePaste}
                    className="aspect-square w-full rounded-xl border border-black/15 bg-white text-center text-xl font-semibold text-black outline-none focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ff6a00]/25"
                    aria-label={`Verification digit ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={otpValue.length !== 6 || loading}
              onClick={handleVerifyCode}
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#ff6a00] text-sm font-semibold text-white hover:bg-[#e05d00] disabled:cursor-not-allowed disabled:bg-[#ffaf75] disabled:opacity-80"
            >
              Verify &amp; Continue
            </button>

            {error ? (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="mt-6 text-sm text-black/60">
              <p>Didn&apos;t receive the code?</p>
              {resendIn > 0 ? (
                <p className="mt-1">
                  Resend code in <strong>{resendIn}s</strong>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="mt-1 font-semibold text-[#ff6a00] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Resend Code
                </button>
              )}
            </div>

            <p className="mt-6 rounded-xl border border-[#b7d4ff] bg-[#edf5ff] px-4 py-3 text-left text-sm text-[#1640c8]">
              Check your email inbox for the Shaka verification code.
            </p>
          </div>
        )}

        {step === "password" && (
          <div className={cardClass}>
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#22c55e]">
                <CheckIcon />
              </div>
            </div>

            <h1 className="mt-5 text-center text-2xl font-semibold text-black">
              Create New Password
            </h1>
            <p className="mt-2 text-center text-sm text-black/60">
              Enter a new password for{" "}
              <span className="font-medium text-black">{email}</span>
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleResetPassword}>
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-1.5 block text-sm font-semibold text-black"
                >
                  New Password
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                    <LockIcon />
                  </span>
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-[#f3f4f6] py-3 pl-10 pr-10 text-sm placeholder:text-black/40 focus:border-[#ff6a00] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/45 hover:text-black"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-black/50">
                  Must be at least 6 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-1.5 block text-sm font-semibold text-black"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                    <LockIcon />
                  </span>
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-[#f3f4f6] py-3 pl-10 pr-10 text-sm placeholder:text-black/40 focus:border-[#ff6a00] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/45 hover:text-black"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#ff6a00] px-4 py-3 text-sm font-semibold text-white hover:bg-[#e05d00] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </div>
        )}

        {step === "success" && (
          <div className={`${cardClass} text-center`}>
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#22c55e]">
                <CheckIcon />
              </div>
            </div>

            <h1 className="mt-5 text-2xl font-semibold text-black">
              Password Reset Successful!
            </h1>
            <p className="mt-2 text-sm text-black/60">
              Your password has been successfully reset
            </p>

            <div className="mt-5 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm font-medium text-[#15803d]">
              You can now sign in with your new password
            </div>

            <Link
              href={signInHref}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#ff6a00] px-4 py-3 text-sm font-semibold text-white hover:bg-[#e05d00]"
            >
              Continue to Sign In
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
