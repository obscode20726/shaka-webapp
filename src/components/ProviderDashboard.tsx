"use client";

import Link from "next/link";
import React from "react";
import { apiRequest } from "@/lib/api";

const topStats = [
  {
    title: "New Requests",
    value: "1",
    icon: "!",
    iconClass: "text-[#d9a300]",
  },
  {
    title: "Upcoming Jobs",
    value: "1",
    icon: "📅",
    iconClass: "text-[#2a73d9]",
  },
  {
    title: "This Month",
    value: "$120",
    icon: "$",
    iconClass: "text-[#22a355]",
  },
  {
    title: "Rating",
    value: "4.8 ⭐",
    icon: "↗",
    iconClass: "text-[#9333ea]",
  },
];

type TabName =
  | "Quotes"
  | "Overview"
  | "Requests"
  | "Schedule"
  | "Earnings"
  | "Profile";

const tabs: Array<{ name: TabName; badge?: string }> = [
  { name: "Quotes" },
  { name: "Overview" },
  { name: "Requests", badge: "1" },
  { name: "Schedule" },
  { name: "Earnings" },
  { name: "Profile" },
];

const requests = [
  {
    service: "Electrical",
    customer: "Alice Marie",
    location: "Kigali, Rwanda",
    preferredDate: "2025-02-15",
    requestedOn: "2025-02-06",
    description:
      "Need to install 3 new outlets in kitchen and replace old switches in living room",
  },
  {
    service: "Plumbing",
    customer: "Bob Johnson",
    location: "Kigali, Rwanda",
    preferredDate: "2025-02-10",
    requestedOn: "2025-02-05",
    description: "Kitchen sink is leaking and needs urgent repair",
  },
];
type ProviderProfile = {
  firstName: string;
  lastName: string;
  businessName?: string;
  primaryService?: string;
  yearsExperience?: number;
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
  homeownerId: string;
};

type Booking = {
  id: string;
  scheduledAt: string;
  escrowStatus: string;
  provider: { firstName: string; lastName: string };
};

type Payment = {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
};
const recentActivity = [
  {
    customer: "Alice Cooper",
    service: "Electrical",
    amount: "$200",
    status: "pending" as const,
  },
  {
    customer: "Bob Wilson",
    service: "Electrical",
    amount: "$150",
    status: "accepted" as const,
  },
  {
    customer: "Carol Davis",
    service: "Electrical",
    amount: "$120",
    status: "completed" as const,
  },
];

function StatusPill({
  status,
}: {
  status: "pending" | "accepted" | "completed";
}) {
  const styles =
    status === "pending"
      ? "bg-[#fff4cf] text-[#987303]"
      : status === "accepted"
        ? "bg-[#eaf2ff] text-[#2a73d9]"
        : "bg-[#e8f8ed] text-[#1f9d4a]";

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
}

export default function ProviderDashboard() {
  const [profile, setProfile] = React.useState<ProviderProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [profileError, setProfileError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<TabName>("Overview");

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await apiRequest("/users/me");

        // The response should have provider fields like firstName, lastName, businessName, etc.
        setProfile(profile.providerProfile);
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
          window.location.href = "/signin/provider";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);
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
                  : `Welcome ${profile?.firstName || "Provider"} 👋`}
              </h1>
              <p className="text-sm text-black/55">
                Manage your bookings and grow your business
              </p>
              {profileError ? (
                <p className="mt-2 text-sm text-red-600">{profileError}</p>
              ) : null}
            </div>

            <div className="flex items-center gap-2 rounded-full bg-black/[.03] px-3 py-1.5">
              <button
                aria-label="toggle availability"
                className="relative h-5 w-9 rounded-full bg-[#0f172a]"
              >
                <span className="absolute right-[2px] top-[2px] h-4 w-4 rounded-full bg-white" />
              </button>
              <span className="text-sm text-black/70">Available</span>
              <span className="rounded-full bg-[#e8f8ed] px-2 py-0.5 text-xs text-[#1f9d4a]">
                Online
              </span>
            </div>
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
                  <span className={`text-lg ${card.iconClass}`}>
                    {card.icon}
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 rounded-full bg-[#eff1f4] p-1">
            <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  className={`rounded-full px-3 py-2 text-xs font-medium sm:text-sm ${
                    tab.name === activeTab
                      ? "bg-white text-black shadow-sm"
                      : "text-black/70"
                  }`}
                  onClick={() => setActiveTab(tab.name)}
                >
                  <span>{tab.name}</span>
                  {tab.badge ? (
                    <span className="ml-1 rounded-full bg-[#ef4444] px-1.5 py-0.5 text-[10px] text-white">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "Overview" ? (
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <section className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-black">
                    Recent Activity
                  </h2>
                </div>

                <div className="mt-4 space-y-3">
                  {recentActivity.map((item) => (
                    <article
                      key={`${item.customer}-${item.amount}-${item.status}`}
                      className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-3 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/[.05] text-sm font-semibold text-black/70">
                          {item.customer.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black">
                            {item.customer}
                          </p>
                          <p className="text-xs text-black/60">
                            {item.service} • {item.amount}
                          </p>
                        </div>
                      </div>
                      <StatusPill status={item.status} />
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-black/10 bg-white p-4 text-black sm:p-5">
                <h2 className="text-xl font-semibold">
                  This Month&apos;s Performance
                </h2>

                <dl className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-black/75">Jobs Completed</dt>
                    <dd className="text-sm font-semibold">1</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-black/75">Response Rate</dt>
                    <dd className="text-sm font-semibold">98%</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-black/75">
                      Customer Satisfaction
                    </dt>
                    <dd className="text-sm font-semibold">4.8 ⭐</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-black/75">Total Earnings</dt>
                    <dd className="text-sm font-semibold text-[#22a355]">
                      $120
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          ) : activeTab === "Quotes" ? (
            <>
              <div className="mt-6">
                <h2 className="text-2xl font-semibold text-black">
                  Booking Requests &amp; Quotes
                </h2>
                <p className="text-sm text-black/55">
                  View requests and submit quotes to customers
                </p>
              </div>

              <div className="mt-5 space-y-4">
                {requests.map((request) => (
                  <article
                    key={`${request.service}-${request.customer}`}
                    className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[28px] font-medium leading-none text-black sm:text-[30px]">
                            {request.service}
                          </h3>
                          <span className="rounded-full bg-[#fff4cf] px-2 py-0.5 text-xs text-[#987303]">
                            Pending
                          </span>
                        </div>
                        <p className="mt-2 text-lg text-black/70">
                          Customer: {request.customer}
                        </p>
                        <p className="text-lg text-black/70">
                          Location: {request.location}
                        </p>
                        <p className="text-lg text-black/70">
                          Preferred Date: {request.preferredDate}
                        </p>
                        <p className="text-base text-black/45">
                          Requested: {request.requestedOn}
                        </p>
                      </div>

                      <button className="inline-flex items-center rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black/75 hover:bg-black/[.02]">
                        💬 Message
                      </button>
                    </div>

                    <div className="mt-4">
                      <p className="text-lg font-medium text-black">
                        Description:
                      </p>
                      <div className="mt-2 rounded-md bg-[#f5f6f8] px-4 py-3 text-base text-black/70">
                        {request.description}
                      </div>
                    </div>

                    <button className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#ff6a00] px-4 py-3 text-sm font-medium text-white hover:bg-[#e85f00]">
                      ✈ Submit Quote
                    </button>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6 text-center">
              <p className="text-sm text-black/60">
                {activeTab} tab coming soon.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-5 right-4 z-10 flex flex-col gap-3 sm:right-6">
        <button
          aria-label="notifications"
          className="h-11 w-11 rounded-full bg-[#ff6a00] text-xl text-white shadow-lg"
        >
          🔔
        </button>
        <button
          aria-label="help"
          className="h-11 w-11 rounded-full bg-[#2a73d9] text-xl text-white shadow-lg"
        >
          💬
        </button>
      </div>
    </section>
  );
}
