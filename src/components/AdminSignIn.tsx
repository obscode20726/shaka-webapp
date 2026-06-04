"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { apiRequest } from "@/lib/api";

function ShieldIcon() {
  return (
    <svg
      aria-hidden
      className="h-7 w-7 text-[#f97316]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l7.5 3.5v5.5c0 4.2-3.2 8.1-7.5 9-4.3-.9-7.5-4.8-7.5-9V6.5L12 3z"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      aria-hidden
      className="h-4 w-4 text-black/40"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 19v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1M12 11a4 4 0 100-8 4 4 0 000 8z"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden
      className="h-4 w-4 text-black/40"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 11V8a5 5 0 0110 0v3M6 11h12v9H6v-9z"
      />
    </svg>
  );
}

interface AdminLoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    type: string;
    role?: string;
  };
}

export default function AdminSignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      // Call the admin login endpoint with real database credentials
      const response = await apiRequest<AdminLoginResponse>("/auth/admin-login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (response.token && response.user) {
        // Store the JWT token and admin session
        localStorage.setItem("token", response.token);
        localStorage.setItem("admin_session", JSON.stringify({
          userId: response.user.id,
          email: response.user.email,
          role: response.user.role || "admin",
          loginTime: new Date().toISOString(),
        }));

        // Redirect to admin dashboard
        router.push("/admin/dashboard");
      } else {
        setError("Invalid response from server. Please try again.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_center,_#faf8f5_0%,_#f0ebe3_100%)] px-4 py-10">
      <div className="w-full max-w-[440px]">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff3e6]">
            <ShieldIcon />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-black">Shaka Admin</h1>
          <p className="mt-1 text-sm text-black/55">
            Platform Administration Portal
          </p>
        </div>

        <div className="rounded-2xl border border-black/[.06] bg-white p-6 shadow-[0_10px_28px_rgba(15,23,42,0.08)] sm:p-8">
          <h2 className="text-center text-lg font-medium text-black/80">
            Administrator Login
          </h2>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="admin-email"
                className="mb-1 block text-sm font-semibold text-black"
              >
                Email
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <UserIcon />
                </span>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-transparent bg-[#f3f4f6] py-2.5 pl-10 pr-3 text-sm text-black outline-none ring-[#f97316] placeholder:text-black/40 focus:ring-2"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-1 block text-sm font-semibold text-black"
              >
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <LockIcon />
                </span>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-transparent bg-[#f3f4f6] py-2.5 pl-10 pr-3 text-sm text-black outline-none ring-[#f97316] placeholder:text-black/40 focus:ring-2"
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            <div className="rounded-xl border border-[#bfdbfe] bg-[#eff6ff] px-3 py-2.5 text-sm text-[#1d4ed8]">
              <p className="font-semibold">Note:</p>
              <p className="mt-1">
                Please use your registered admin account credentials. Ensure your admin user account exists in the database with appropriate permissions.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#f97316] py-3 text-sm font-semibold text-white transition hover:bg-[#ea580c] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In as Admin"}
            </button>

            <Link
              href="/"
              className="flex w-full items-center justify-center rounded-xl border border-black/15 bg-white py-3 text-sm font-medium text-black transition hover:bg-black/[.02]"
            >
              Back to Home
            </Link>
          </form>
        </div>
      </div>
    </section>
  );
}
