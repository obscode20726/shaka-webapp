"use client";

import Link from "next/link";
import React from "react";

function isValidRwandanPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  // Simple check for 10‑digit Rwandan mobile numbers like 0781234567, 072..., 073..., 078..., 079...
  return /^0(72|73|78|79)\d{7}$/.test(digits);
}

export default function HomeownerSignIn() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidRwandanPhone(phone)) {
      setError("Please enter a valid Rwandan phone number (e.g., 0781234567)");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          password,
          userType: 'homeowner'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle successful login
        console.log('Login successful:', data);
        // Store token, redirect, etc.
        alert('Login successful!');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#f6f7f9] py-10 sm:py-16">
      <div className="mx-auto max-w-[520px] px-4 sm:px-6">
        <div className="mb-6">
          <Link
            href="/get-started"
            className="inline-flex items-center text-sm text-black/60 hover:text-black"
          >
            <span className="mr-1 text-lg">←</span>
            <span>Back</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-black/[.06] bg-white p-6 sm:p-8 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f1ff] text-2xl text-[#1a73e8]">
              🏠
            </div>
          </div>

          <h1 className="mt-4 text-center text-xl font-semibold text-black">
            Welcome Back
          </h1>
          <p className="mt-1 text-center text-sm text-black/60">
            Sign in to your homeowner account
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-base">⚠️</span>
                <p>{error}</p>
              </div>
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="0781234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm placeholder:text-black/40 focus:border-[#1a73e8] focus:outline-none focus:ring-1 focus:ring-[#1a73e8]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 pr-10 text-sm placeholder:text-black/40 focus:border-[#1a73e8] focus:outline-none focus:ring-1 focus:ring-[#1a73e8]"
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
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-black/70">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-black/20 text-[#1a73e8] focus:ring-[#1a73e8]"
                />
                Remember me
              </label>
              <Link
                href="#"
                className="text-sm font-medium text-[#1a73e8] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-[#1a73e8] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#1557b5] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-black/10" />
              <span className="text-xs text-black/50">Or continue with</span>
              <div className="h-px flex-1 bg-black/10" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-black/80 hover:bg-black/[.02]"
              >
                <span className="text-base">G</span>
                Google
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-black/80 hover:bg-black/[.02]"
              >
                <span className="text-base"></span>
                Apple
              </button>
            </div>

            <p className="pt-3 text-center text-sm text-black/60">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup/homeowner"
                className="font-medium text-[#1a73e8] hover:underline"
              >
                Sign up here
              </Link>
            </p>
          </form>
        </div>

        <div className="mt-8 rounded-2xl border border-[#1a73e8]/15 bg-[#e8f1ff] p-6 sm:p-7">
          <h2 className="text-sm font-semibold text-black">
            Need help getting started?
          </h2>
          <p className="mt-2 text-sm text-black/70">
            Sign in to access your bookings, manage your account, and connect
            with trusted service providers.
          </p>
          <div className="mt-4">
            <Link
              href="/support"
              className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/80 shadow-sm hover:bg-black/[.02]"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

