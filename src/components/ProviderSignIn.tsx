"use client";

import Link from "next/link";
import React, { useState } from "react";
import { apiRequest } from "@/lib/api";

export default function ProviderSignIn() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [form, setForm] = useState({
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.phone || !form.password) {
      setError("Phone number and password are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Provider signup uses phone-derived email, so we keep login aligned.
      const email = `${form.phone}@shaka.com`;
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password: form.password,
          phone: form.phone,
        }),
      });

      const token = data?.token || data?.access_token;
      if (!token) {
        throw new Error("Login succeeded but no token was returned.");
      }
      localStorage.setItem("token", token);
      // Mirror auth token in a cookie so protected routes can validate on server render.
      if (rememberMe) {
        document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
      } else {
        document.cookie = `token=${encodeURIComponent(token)}; path=/; samesite=lax`;
      }
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      if (!rememberMe) {
        sessionStorage.setItem("token", token);
      }

      window.location.href = "/dashboard/provider";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
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
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff3e6] text-2xl">
              🛠️
            </div>
          </div>

          <h1 className="mt-4 text-center text-xl font-semibold text-black">
            Welcome Back
          </h1>
          <p className="mt-1 text-center text-sm text-black/60">
            Sign in to your provider account
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-base">⚠️</span>
                <p>{error}</p>
              </div>
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="123-456-7890"
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm placeholder:text-black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 pr-10 text-sm placeholder:text-black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
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
                  className="h-4 w-4 rounded border-black/20 text-[#ff6a00] focus:ring-[#ff6a00]"
                />
                Remember me
              </label>
              <Link
                href="#"
                className="text-sm font-medium text-[#ff6a00] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-[#ff6a00] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#e05d00] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In"}
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
                href="/signup/provider"
                className="font-medium text-[#ff6a00] hover:underline"
              >
                Sign up here
              </Link>
            </p>
          </form>
        </div>

        <div className="mt-8 rounded-2xl bg-[#fff3e6] p-6 sm:p-7 border border-[#ff6a00]/15">
          <h2 className="text-sm font-semibold text-black">
            Why providers choose Shaka
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#ff6a00]">
                📈
              </div>
              <p className="mt-2 text-xs text-black/70">Grow Your Business</p>
            </div>
            <div>
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#ff6a00]">
                📅
              </div>
              <p className="mt-2 text-xs text-black/70">Manage Bookings</p>
            </div>
            <div>
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#ff6a00]">
                👥
              </div>
              <p className="mt-2 text-xs text-black/70">Find Customers</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            href="/support"
            className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/80 shadow-sm hover:bg-black/[.02]"
          >
            Need help? Contact Support
          </Link>
        </div>
      </div>
    </section>
  );
}
