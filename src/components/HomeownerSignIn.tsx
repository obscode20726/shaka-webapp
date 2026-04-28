"use client";

import Link from "next/link";
import React, { useState } from "react";
import { apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function HomeownerSignIn() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleHomeownerLogin = async () => {
    if (!form.phone || !form.password) {
      setError("Phone and password are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          phone: form.phone,
          password: form.password,
        }),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Server routes (dashboard pages) check cookies(), not localStorage.
      // Set a cookie so Next.js server components can read it.
      const baseCookie = `token=${encodeURIComponent(
        data.token
      )}; Path=/; SameSite=Lax`;
      const isHttps =
        typeof window !== "undefined" && window.location.protocol === "https:";
      const expires = rememberMe
        ? `; Expires=${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()}`
        : "";
      document.cookie = `${baseCookie}${expires}${isHttps ? "; Secure" : ""}`;

      // ✅ FIXED redirect
      router.push("/homeowner/dashboard");
      console.log("DATA:", data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
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
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff3e6] text-2xl text-[#ff6a00]">
              🏠
            </div>
          </div>

          <h1 className="mt-4 text-center text-xl font-semibold text-black">
            Welcome Back
          </h1>
          <p className="mt-1 text-center text-sm text-black/60">
            Use the phone number you registered with, plus your password
          </p>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-base">⚠️</span>
                <p>{error}</p>
              </div>
            </div>
          ) : null}

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault(); // 🚨 STOP page reload
              handleHomeownerLogin();
            }}
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Phone number
              </label>
              <input
                type="text"
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm placeholder:text-black/40 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
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
                href="/signup/homeowner"
                className="font-medium text-[#ff6a00] hover:underline"
              >
                Sign up here
              </Link>
            </p>
          </form>
        </div>

        <div className="mt-8 rounded-2xl border border-[#ff6a00]/15 bg-[#fff3e6] p-6 sm:p-7">
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
