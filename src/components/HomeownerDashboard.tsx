"use client";

import Link from "next/link";
import React from "react";
import { apiRequest } from "@/lib/api";

type HomeownerProfile = {
  fullName?: string;
  city?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
};

type ServiceRequest = {
  id: string;
  status: string;
  description: string;
  preferredDate: string;
  city: string;
  service: {
    title: string;
    slug: string;
  };
  provider?: {
    firstName: string;
    lastName: string;
    businessName?: string;
  };
};

// ─── Booking Flow Types ───────────────────────────────────────────────────────

type ServiceOption = {
  label: string;
  emoji: string;
  slug: string;
};

type Provider = {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  skills: string[];
  availability: string;
  availabilityColor: string;
  avatar: string;
};

type BookingFormData = {
  service: ServiceOption | null;
  city: string;
  address: string;
  provider: Provider | null;
  date: string;
  time: string;
  description: string;
  fullName: string;
  phone: string;
  email: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICE_OPTIONS: ServiceOption[] = [
  { label: "Removal Service", emoji: "🚛", slug: "removal" },
  { label: "Plumbing", emoji: "🔧", slug: "plumbing" },
  { label: "Gardening", emoji: "🌱", slug: "gardening" },
  { label: "Cleaning", emoji: "✨", slug: "cleaning" },
  { label: "Painting", emoji: "🎨", slug: "painting" },
];

const MOCK_PROVIDERS: Provider[] = [
  {
    id: "1",
    name: "John Smith",
    rating: 4.9,
    reviews: 127,
    distance: "2.3 miles away",
    skills: ["Residential Wiring", "Panel Upgrades", "Emergency Repairs"],
    availability: "Available Today",
    availabilityColor: "text-green-600",
    avatar: "JS",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    rating: 4.8,
    reviews: 89,
    distance: "3.5 miles away",
    skills: ["Smart Home Installation", "LED Lighting", "Outlet Installation"],
    availability: "Available Tomorrow",
    availabilityColor: "text-green-600",
    avatar: "SJ",
  },
  {
    id: "3",
    name: "Mike Rodriguez",
    rating: 4.7,
    reviews: 156,
    distance: "5.1 miles away",
    skills: [
      "Commercial Electric",
      "Generator Installation",
      "Troubleshooting",
    ],
    availability: "Available This Week",
    availabilityColor: "text-green-600",
    avatar: "MR",
  },
];

const TIME_OPTIONS = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

const STEP_LABELS = ["Service", "Location", "Provider", "Details"];

const tabs = ["Quotes", "Bookings", "Favorites", "Payments", "Settings"];

// ─── Step Components ──────────────────────────────────────────────────────────

function Step1Service({
  selected,
  onSelect,
}: {
  selected: ServiceOption | null;
  onSelect: (s: ServiceOption) => void;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
      <h2 className="text-2xl font-semibold text-black">
        What service do you need?
      </h2>
      <p className="mt-1 text-sm text-black/55">
        Select the type of service you&apos;re looking for
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SERVICE_OPTIONS.map((svc) => (
          <button
            key={svc.slug}
            onClick={() => onSelect(svc)}
            className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 py-6 text-sm font-medium transition-all ${
              selected?.slug === svc.slug
                ? "border-[#ff6a00] bg-orange-50 text-[#ff6a00]"
                : "border-black/10 bg-white text-black hover:border-[#ff6a00]/40"
            }`}
          >
            <span className="text-3xl">{svc.emoji}</span>
            <span>{svc.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step2Location({
  city,
  address,
  onCity,
  onAddress,
}: {
  city: string;
  address: string;
  onCity: (v: string) => void;
  onAddress: (v: string) => void;
}) {
  const cities = [
    "kigali",
    "Gisenyi",
    "Ruhengeri",
    "Butare",
    "Kibuye",
    "Nyamata",
  ];

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
      <h2 className="text-2xl font-semibold text-black">
        Where do you need the service?
      </h2>
      <p className="mt-1 text-sm text-black/55">
        Select your location to find nearby providers
      </p>
      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Service Location
          </label>
          <select
            value={city}
            onChange={(e) => onCity(e.target.value)}
            className="w-full rounded-lg border border-black/15 bg-[#f5f6f8] px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#ff6a00]/40"
          >
            <option value="">Select your city</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Specific Address{" "}
            <span className="text-black/40 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => onAddress(e.target.value)}
            placeholder="Enter your street address"
            className="w-full rounded-lg border border-black/15 bg-[#f5f6f8] px-4 py-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#ff6a00]/40"
          />
        </div>
      </div>
    </div>
  );
}

function Step3Provider({
  selected,
  onSelect,
}: {
  selected: Provider | null;
  onSelect: (p: Provider) => void;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
      <h2 className="text-2xl font-semibold text-black">Choose a Provider</h2>
      <p className="mt-1 text-sm text-black/55">
        Select from vetted professionals in your area
      </p>
      <div className="mt-6 space-y-3">
        {MOCK_PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            onClick={() => onSelect(provider)}
            className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
              selected?.id === provider.id
                ? "border-[#ff6a00] bg-orange-50"
                : "border-black/10 bg-white hover:border-[#ff6a00]/40"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-black/60">
                {provider.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-black">{provider.name}</p>
                <p className="text-sm text-black/55">
                  ⭐ {provider.rating} ({provider.reviews} reviews)
                  &nbsp;·&nbsp; 📍 {provider.distance}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {provider.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-black/10 px-2 py-0.5 text-xs text-black/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <p
                  className={`mt-2 text-sm font-medium ${provider.availabilityColor}`}
                >
                  🕐 {provider.availability}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step4Details({
  form,
  onChange,
}: {
  form: BookingFormData;
  onChange: (field: keyof BookingFormData, value: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
      <h2 className="text-2xl font-semibold text-black">Booking Details</h2>
      <p className="mt-1 text-sm text-black/55">
        When would you like the service and tell us about your project
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Select Date
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40">
              📅
            </span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => onChange("date", e.target.value)}
              className="w-full rounded-lg border border-black/15 bg-[#f5f6f8] py-3 pl-9 pr-4 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#ff6a00]/40"
            />
          </div>
        </div>

        {/* Project Description */}
        <div className="row-span-2">
          <label className="block text-sm font-medium text-black mb-1">
            Project Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Describe what you need help with..."
            rows={4}
            className="w-full rounded-lg border border-black/15 bg-[#f5f6f8] px-4 py-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#ff6a00]/40 resize-none"
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Preferred Time
          </label>
          <select
            value={form.time}
            onChange={(e) => onChange("time", e.target.value)}
            className="w-full rounded-lg border border-black/15 bg-[#f5f6f8] px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#ff6a00]/40"
          >
            <option value="">Select time</option>
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mt-6">
        <h3 className="text-base font-semibold text-black">
          Contact Information
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => onChange("fullName", e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-black/15 bg-[#f5f6f8] px-4 py-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#ff6a00]/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="Your phone number"
              className="w-full rounded-lg border border-black/15 bg-[#f5f6f8] px-4 py-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#ff6a00]/40"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-black mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="Your email"
              className="w-full rounded-lg border border-black/15 bg-[#f5f6f8] px-4 py-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#ff6a00]/40"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepConfirmed({
  form,
  onDashboard,
}: {
  form: BookingFormData;
  onDashboard: () => void;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 text-center">
      {/* Check icon */}
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg
          className="h-8 w-8 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-semibold text-black">
        Booking Request Sent!
      </h2>
      <p className="mt-1 text-sm text-black/55">
        Your booking request has been sent to the provider
      </p>

      {/* Summary card */}
      <div className="mx-auto mt-6 max-w-md rounded-2xl border border-black/10 bg-white p-5 text-left">
        <p className="font-semibold text-black">Booking Summary</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-black/60">
            {form.provider?.avatar}
          </div>
          <div>
            <p className="font-medium text-black">{form.provider?.name}</p>
            <p className="text-xs text-black/55">{form.service?.label}</p>
          </div>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          {[
            {
              label: "Date:",
              value: form.date
                ? new Date(form.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—",
            },
            { label: "Time:", value: form.time || "—" },
            { label: "Location:", value: form.city || "—" },
            { label: "Contact:", value: form.phone || form.email || "—" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span className="text-black/55">{label}</span>
              <span className="font-medium text-black">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What happens next */}
      <div className="mx-auto mt-4 max-w-md rounded-2xl bg-blue-50 p-5 text-left">
        <p className="text-sm font-semibold text-blue-700">
          What happens next?
        </p>
        <ul className="mt-2 space-y-1.5 text-sm text-blue-600">
          {[
            "The provider will visit your location at the scheduled time",
            "They'll assess the work and create a detailed quote",
            "You'll receive the quote in your dashboard for review",
            "Once you approve, payment will be held in escrow",
            "Payment is released after work is completed",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span>•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onDashboard}
        className="mt-6 w-full max-w-md rounded-xl bg-[#ff6a00] py-3 text-sm font-medium text-white hover:bg-[#e85f00]"
      >
        Go to Dashboard
      </button>
    </div>
  );
}

// ─── Stepper Header ───────────────────────────────────────────────────────────

function StepperHeader({
  step,
  total,
  onBack,
  backLabel,
}: {
  step: number;
  total: number;
  onBack: () => void;
  backLabel: string;
}) {
  const progress = (step / total) * 100;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm text-black/60 hover:text-black"
        >
          <span>←</span>
          <span>{backLabel}</span>
        </button>
        <span className="text-sm text-black/55">
          Step {step} of {total}
        </span>
      </div>

      {/* Step labels */}
      <div className="mt-4 grid grid-cols-4 text-center text-xs font-medium">
        {STEP_LABELS.map((label, i) => (
          <span
            key={label}
            className={i + 1 <= step ? "text-[#ff6a00]" : "text-black/30"}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-1 h-1 w-full rounded-full bg-black/10">
        <div
          className="h-1 rounded-full bg-[#ff6a00] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const EMPTY_FORM: BookingFormData = {
  service: null,
  city: "",
  address: "",
  provider: null,
  date: "",
  time: "",
  description: "",
  fullName: "",
  phone: "",
  email: "",
};

export default function HomeownerDashboard() {
  const [profile, setProfile] = React.useState<HomeownerProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [profileError, setProfileError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState(0);

  // Booking flow state
  const [bookingStep, setBookingStep] = React.useState<number>(0); // 0 = dashboard, 1-4 = steps, 5 = confirmed
  const [bookingForm, setBookingForm] =
    React.useState<BookingFormData>(EMPTY_FORM);

  // Stats
  const [stats, setStats] = React.useState({
    upcoming: 0,
    inProgress: 0,
    completed: 0,
    totalSpent: 0,
  });
  const [requests, setRequests] = React.useState<ServiceRequest[]>([]);
  const [statsLoading, setStatsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userProfile = await apiRequest("/users/me");
        setProfile(userProfile.homeownerProfile);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Unable to load profile";
        setProfileError(message);
        const lowerMessage = message.toLowerCase();
        if (
          lowerMessage.includes("unauthorized") ||
          lowerMessage.includes("token") ||
          lowerMessage.includes("forbidden")
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          document.cookie =
            "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          window.location.href = "/signin/homeowner";
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setStatsLoading(true);
        let serviceRequests: ServiceRequest[] = [];
        try {
          const response = await apiRequest("/service-requests");
          if (Array.isArray(response)) serviceRequests = response;
        } catch {}

        const upcomingRequests = serviceRequests.filter(
          (r) => r.status === "pending",
        );
        const inProgressRequests = serviceRequests.filter(
          (r) => r.status === "accepted" || r.status === "in-progress",
        );
        const completedRequests = serviceRequests.filter(
          (r) => r.status === "completed",
        );

        type Payment = { status: string; amount?: number };
        let totalSpent = 0;
        try {
          const response = await apiRequest("/payments");
          if (Array.isArray(response)) {
            totalSpent = (response as Payment[]).reduce(
              (sum: number, p: Payment) =>
                p.status === "completed" ? sum + (p.amount || 0) : sum,
              0,
            );
          }
        } catch {}

        setStats({
          upcoming: upcomingRequests.length,
          inProgress: inProgressRequests.length,
          completed: completedRequests.length,
          totalSpent,
        });
        setRequests(serviceRequests);
      } catch {
      } finally {
        setStatsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const welcomeName = profile?.fullName?.split(" ").at(0) || "Homeowner";

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);

  const topStats = [
    { title: "Upcoming", value: stats.upcoming, icon: "📅" },
    { title: "In Progress", value: stats.inProgress, icon: "🕒" },
    { title: "Completed", value: stats.completed, icon: "✅" },
    {
      title: "Total Spent",
      value: formatCurrency(stats.totalSpent),
      icon: "💳",
    },
  ];

  const updateForm = (field: keyof BookingFormData, value: BookingFormData[keyof BookingFormData]) =>
    setBookingForm((prev) => ({ ...prev, [field]: value }));

  const canProceed = () => {
    if (bookingStep === 1) return !!bookingForm.service;
    if (bookingStep === 2) return !!bookingForm.city;
    if (bookingStep === 3) return !!bookingForm.provider;
    if (bookingStep === 4)
      return !!bookingForm.date && !!bookingForm.time && !!bookingForm.fullName;
    return true;
  };

  // ── Booking Flow View ──────────────────────────────────────────────────────
  if (bookingStep > 0) {
    const isConfirmed = bookingStep === 5;

    return (
      <section className="min-h-screen bg-[#f3f4f6] py-6 sm:py-10">
        <div className="mx-auto w-full max-w-[760px] px-4 sm:px-6">
          {isConfirmed ? (
            <StepConfirmed
              form={bookingForm}
              onDashboard={() => {
                setBookingStep(0);
                setBookingForm(EMPTY_FORM);
              }}
            />
          ) : (
            <>
              <StepperHeader
                step={bookingStep}
                total={4}
                onBack={() => {
                  if (bookingStep === 1) {
                    setBookingStep(0);
                    setBookingForm(EMPTY_FORM);
                  } else {
                    setBookingStep((s) => s - 1);
                  }
                }}
                backLabel={bookingStep === 1 ? "Back to Home" : "Previous"}
              />

              {bookingStep === 1 && (
                <Step1Service
                  selected={bookingForm.service}
                  onSelect={(s) => updateForm("service", s)}
                />
              )}
              {bookingStep === 2 && (
                <Step2Location
                  city={bookingForm.city}
                  address={bookingForm.address}
                  onCity={(v) => updateForm("city", v)}
                  onAddress={(v) => updateForm("address", v)}
                />
              )}
              {bookingStep === 3 && (
                <Step3Provider
                  selected={bookingForm.provider}
                  onSelect={(p) => updateForm("provider", p)}
                />
              )}
              {bookingStep === 4 && (
                <Step4Details form={bookingForm} onChange={updateForm} />
              )}

              {/* Footer buttons */}
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => {
                    if (bookingStep < 4) setBookingStep((s) => s + 1);
                    else setBookingStep(5);
                  }}
                  disabled={!canProceed()}
                  className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white transition-all ${
                    canProceed()
                      ? "bg-[#ff6a00] hover:bg-[#e85f00]"
                      : "bg-[#ff6a00]/40 cursor-not-allowed"
                  }`}
                >
                  {bookingStep === 4 ? "Book Service" : "Continue"}
                  <span>→</span>
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    );
  }

  // ── Dashboard View ─────────────────────────────────────────────────────────
  return (
    <section className="min-h-screen bg-[#f3f4f6] py-6 sm:py-10">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6">
        <div className="rounded-2xl border border-black/[.07] bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Link
                href="/"
                className="inline-flex items-center text-sm text-black/60 hover:text-black"
              >
                <span className="mr-1 text-lg">←</span>
                <span>Back to Home</span>
              </Link>
              <h1 className="mt-2 text-2xl font-semibold text-black sm:text-[34px]">
                {loading
                  ? "Loading dashboard..."
                  : `Welcome back, ${welcomeName}!`}
              </h1>
              <p className="text-sm text-black/55">
                Manage your bookings and account
              </p>
              {profileError && (
                <p className="mt-2 text-sm text-red-600">{profileError}</p>
              )}
            </div>

            <button
              onClick={() => setBookingStep(1)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#ff6a00] px-4 py-2 text-sm font-medium text-white hover:bg-[#e85f00]"
            >
              <span>+</span>
              <span>Book Service</span>
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {topStats.map((card) => (
              <article
                key={card.title}
                className="rounded-xl border border-black/10 bg-white px-4 py-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-black/60">{card.title}</p>
                    <p className="mt-1 text-[30px] font-semibold leading-none text-black">
                      {statsLoading ? "..." : card.value}
                    </p>
                  </div>
                  <span className="text-lg">{card.icon}</span>
                </div>
              </article>
            ))}
          </div>

          {/* Tabs */}
          <div className="mt-5 rounded-full bg-[#eff1f4] p-1">
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-5">
              {tabs.map((tab, idx) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(idx)}
                  className={`rounded-full px-3 py-2 text-xs font-medium sm:text-sm ${
                    idx === activeTab
                      ? "bg-white text-black shadow-sm"
                      : "text-black/70"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 0 && (
            <>
              <div className="mt-6">
                <h2 className="text-2xl font-semibold text-black">
                  Service Requests &amp; Quotes
                </h2>
                <p className="text-sm text-black/55">
                  Request services and manage quotes from providers
                </p>
              </div>
              <div className="mt-5 space-y-4">
                {statsLoading ? (
                  <p className="py-8 text-center text-black/60">
                    Loading requests...
                  </p>
                ) : requests.length === 0 ? (
                  <p className="py-8 text-center text-black/60">
                    No service requests yet. Click &quot;Book Service&quot; to
                    get started!
                  </p>
                ) : (
                  requests.map((request) => (
                    <article
                      key={request.id}
                      className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-2xl font-medium leading-none text-black sm:text-[30px]">
                              {request.service?.title || "Service"}
                            </h3>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs ${
                                request.status === "pending"
                                  ? "bg-[#fff4cf] text-[#987303]"
                                  : request.status === "accepted" ||
                                      request.status === "in-progress"
                                    ? "bg-[#e8f1ff] text-[#2a73d9]"
                                    : request.status === "completed"
                                      ? "bg-[#e8f8ed] text-[#1f9d4a]"
                                      : "bg-[#ffe8e8] text-[#dc2626]"
                              }`}
                            >
                              {request.status}
                            </span>
                          </div>
                          {request.provider && (
                            <p className="mt-2 text-sm text-black/70">
                              Provider: {request.provider.firstName}{" "}
                              {request.provider.lastName}
                            </p>
                          )}
                          <p className="text-sm text-black/70">
                            Location: {request.city}
                          </p>
                          <p className="text-sm text-black/70">
                            Preferred Date:{" "}
                            {new Date(
                              request.preferredDate,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <button className="inline-flex items-center rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black/75 hover:bg-black/[.02]">
                          💬 Message
                        </button>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm font-medium text-black">
                          Description:
                        </p>
                        <div className="mt-2 rounded-md bg-[#f5f6f8] px-4 py-3 text-sm text-black/70">
                          {request.description}
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 1 && (
            <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6 text-center">
              <p className="text-sm text-black/60">Bookings tab coming soon.</p>
            </div>
          )}
          {activeTab === 2 && (
            <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6 text-center">
              <p className="text-sm text-black/60">
                Favorites tab coming soon.
              </p>
            </div>
          )}
          {activeTab === 3 && (
            <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6 text-center">
              <p className="text-sm text-black/60">Payments tab coming soon.</p>
            </div>
          )}
          {activeTab === 4 && (
            <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6 text-center">
              <p className="text-sm text-black/60">Settings tab coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
