"use client";

import Link from "next/link";
import React from "react";
import { apiRequest } from "@/lib/api";

const topStats = [
  { title: "Upcoming", value: "1", icon: "📅" },
  { title: "In Progress", value: "1", icon: "🕒" },
  { title: "Completed", value: "1", icon: "✅" },
  { title: "Total Spent", value: "RWF 390", icon: "💳" },
];

const tabs = ["Quotes", "Bookings", "Favorites", "Payments", "Settings"];

const requests = [
  {
    service: "Removal Service",
    status: "Quote Sent",
    provider: "Jean Baptiste",
    location: "Kigali, Rwanda",
    preferredDate: "2025-02-15",
    requestedOn: "2025-02-09",
    description: "Need help moving a 2-bedroom apartment to a new location across town",
    quote: {
      timeline: "1 day",
      validUntil: "2025-02-20",
      amount: "RWF 85,000",
      details:
        "We provide a full moving service with 3 helpers and a truck. We will pack, load, transport, and unload all your belongings safely.",
      materials: "Moving truck, packing materials, furniture blankets, straps",
      terms:
        "Payment upon completion. Insurance coverage included for all items.",
    },
    primaryAction: "Approve & Pay",
    secondaryAction: "Reject",
  },
  {
    service: "Plumbing",
    status: "Quote Sent",
    provider: "Manzi Uwase",
    location: "Kigali, Rwanda",
    preferredDate: "2025-02-10",
    requestedOn: "2025-02-05",
    description: "Kitchen sink is leaking and needs repair",
    quote: {
      timeline: "2-3 days",
      validUntil: "2025-02-18",
      amount: "RWF 85,000",
      details:
        "I will fix the kitchen sink leak by replacing worn-out pipes and faucet seals. This includes checking all connections under the sink.",
      materials: "PVC pipes, faucet seals, pipe fittings, plumber tape, silicone sealant",
      terms:
        "Two-phase payment: materials upfront, labor after completion. All materials covered under 1-year warranty.",
    },
    primaryAction: "Pay Materials",
    secondaryAction: "Reject",
  },
  {
    service: "Gardening",
    status: "Pending",
    provider: "",
    location: "Kigali, Rwanda",
    preferredDate: "2025-02-12",
    requestedOn: "2025-02-08",
    description:
      "Need lawn mowing and hedge trimming for front and back yard. The grass is overgrown and hedges need shaping.",
    quote: null,
    primaryAction: "",
    secondaryAction: "",
  },
];

type HomeownerProfile = {
  fullName?: string;
  firstName?: string;
};

export default function HomeownerDashboard() {
  const [profile, setProfile] = React.useState<HomeownerProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [profileError, setProfileError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiRequest("/auth/me");
        setProfile(data);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Unable to load profile";
        setProfileError(message);

        // Token missing/expired/invalid: force re-authentication.
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

  const welcomeName =
    profile?.firstName ||
    profile?.fullName?.split(" ").at(0) ||
    "Homeowner";

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
                {loading ? "Loading dashboard..." : `Welcome back, ${welcomeName}!`}
              </h1>
              <p className="text-sm text-black/55">Manage your bookings and account</p>
              {profileError ? (
                <p className="mt-2 text-sm text-red-600">{profileError}</p>
              ) : null}
            </div>

            <button className="inline-flex items-center gap-2 rounded-lg bg-[#ff6a00] px-4 py-2 text-sm font-medium text-white hover:bg-[#e85f00]">
              <span>+</span>
              <span>Book Service</span>
            </button>
          </div>

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
                      {card.value}
                    </p>
                  </div>
                  <span className="text-lg">{card.icon}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 rounded-full bg-[#eff1f4] p-1">
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-5">
              {tabs.map((tab, idx) => (
                <button
                  key={tab}
                  className={`rounded-full px-3 py-2 text-xs font-medium sm:text-sm ${
                    idx === 0 ? "bg-white text-black shadow-sm" : "text-black/70"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-black">Service Requests &amp; Quotes</h2>
            <p className="text-sm text-black/55">Request services and manage quotes from providers</p>
          </div>

          <div className="mt-5 space-y-4">
            {requests.map((request) => (
              <article
                key={`${request.service}-${request.requestedOn}`}
                className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-medium leading-none text-black sm:text-[30px]">
                        {request.service}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          request.status === "Quote Sent"
                            ? "bg-[#e8f1ff] text-[#2a73d9]"
                            : "bg-[#fff4cf] text-[#987303]"
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>
                    {request.provider ? (
                      <p className="mt-2 text-sm text-black/70">Provider: {request.provider}</p>
                    ) : null}
                    <p className="text-sm text-black/70">Location: {request.location}</p>
                    <p className="text-sm text-black/70">Preferred Date: {request.preferredDate}</p>
                    <p className="text-sm text-black/45">Requested: {request.requestedOn}</p>
                  </div>

                  <button className="inline-flex items-center rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black/75 hover:bg-black/[.02]">
                    💬 Message
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-black">Description:</p>
                  <div className="mt-2 rounded-md bg-[#f5f6f8] px-4 py-3 text-sm text-black/70">
                    {request.description}
                  </div>
                </div>

                {request.quote ? (
                  <div className="mt-4 rounded-xl bg-[#f4f9ff] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-black">Quote Details</p>
                      <p className="text-sm font-semibold text-[#1f9d4a]">{request.quote.amount}</p>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-black/75 sm:grid-cols-2">
                      <p>
                        <span className="font-medium text-black">Timeline:</span>{" "}
                        {request.quote.timeline}
                      </p>
                      <p>
                        <span className="font-medium text-black">Valid Until:</span>{" "}
                        {request.quote.validUntil}
                      </p>
                    </div>

                    <p className="mt-3 text-sm text-black/75">
                      <span className="font-medium text-black">Details:</span>{" "}
                      {request.quote.details}
                    </p>
                    <p className="mt-2 text-sm text-black/75">
                      <span className="font-medium text-black">Materials:</span>{" "}
                      {request.quote.materials}
                    </p>
                    <p className="mt-2 text-sm text-black/75">
                      <span className="font-medium text-black">Terms:</span> {request.quote.terms}
                    </p>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <button className="inline-flex items-center justify-center rounded-lg bg-[#16a34a] px-4 py-2 text-sm font-medium text-white hover:bg-[#15803d]">
                        {request.primaryAction}
                      </button>
                      <button className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                        {request.secondaryAction}
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
