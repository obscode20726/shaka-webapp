"use client";

import Link from "next/link";
import React from "react";
import { apiRequest } from "@/lib/api";

type TabName =
  | "Quotes"
  | "Overview"
  | "Requests"
  | "Schedule"
  | "Earnings"
  | "Profile";

type ProviderProfile = {
  firstName: string;
  lastName: string;
  businessName?: string;
  primaryService?: string;
  yearsExperience?: number;
  averageRating?: number;
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
};

type RecentActivityItem = {
  customer: string;
  service: string;
  amount: string;
  status: "pending" | "accepted" | "completed";
};

type Payment = {
  id?: string;
  amount?: number;
  status?: string;
  createdAt?: string;
  homeowner?: {
    firstName?: string;
    lastName?: string;
  };
  homeownerName?: string;
};

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

  // ✅ NEW: State for dashboard statistics
  const [stats, setStats] = React.useState({
    newRequests: 0,
    upcomingJobs: 0,
    monthlyEarnings: 0,
    rating: 0,
    jobsCompleted: 0,
    responseRate: "0%",
  });
  const [requests, setRequests] = React.useState<ServiceRequest[]>([]);
  const [acceptedRequests, setAcceptedRequests] = React.useState<
    ServiceRequest[]
  >([]);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [recentActivity, setRecentActivity] = React.useState<
    RecentActivityItem[]
  >([]);
  const [statsLoading, setStatsLoading] = React.useState(true);

  const tabs = React.useMemo((): Array<{ name: TabName; badge?: string }> => {
    const requestBadge = stats.newRequests > 0 ? String(stats.newRequests) : "";
    return [
      { name: "Quotes" },
      { name: "Overview" },
      { name: "Requests", badge: requestBadge || undefined },
      { name: "Schedule" },
      { name: "Earnings" },
      { name: "Profile" },
    ];
  }, [stats.newRequests]);

  // ✅ Fetch provider profile
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userProfile = await apiRequest("/users/me");
        console.log("✅ Provider Profile:", userProfile);
        setProfile(userProfile.providerProfile);
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

  // ✅ NEW: Fetch dashboard statistics and requests
  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setStatsLoading(true);

        // 1️⃣ Get service requests
        console.log("📍 Fetching /service-requests...");
        let serviceRequests: ServiceRequest[] = [];
        try {
          const response = await apiRequest("/service-requests");
          console.log("✅ /service-requests response:", response);
          console.log(
            "   Type:",
            Array.isArray(response) ? "Array" : typeof response,
          );
          console.log(
            "   Length:",
            Array.isArray(response) ? response.length : "N/A",
          );

          if (Array.isArray(response)) {
            serviceRequests = response;
          }
        } catch (err) {
          console.error("❌ /service-requests error:", err);
        }

        // 2️⃣ Count requests by status (from provider perspective)
        console.log("📋 Service Request Status Breakdown:");
        serviceRequests.forEach((req: ServiceRequest) => {
          console.log(
            `   - ${req.service?.title || "Service"}: status = "${req.status}"`,
          );
        });

        // New Requests = pending (homeowner just created, no quote sent yet)
        const newRequests = serviceRequests.filter(
          (req: ServiceRequest) => req.status === "pending",
        );

        // Accepted/In Progress = provider sent quote, homeowner accepted
        const acceptedRequests = serviceRequests.filter(
          (req: ServiceRequest) =>
            req.status === "accepted" || req.status === "in-progress",
        );

        // Completed = service finished
        const completedRequests = serviceRequests.filter(
          (req: ServiceRequest) => req.status === "completed",
        );

        console.log("📊 New Requests (Pending):", newRequests.length);
        console.log("📊 Accepted/In Progress:", acceptedRequests.length);
        console.log("📊 Completed:", completedRequests.length);

        // 3️⃣ Get bookings (Upcoming Jobs)
        let upcomingJobs = 0;
        let jobsCompleted = 0;
        console.log("📍 Fetching /bookings...");
        try {
          const response = await apiRequest("/bookings");
          console.log("✅ /bookings response:", response);
          console.log(
            "   Type:",
            Array.isArray(response) ? "Array" : typeof response,
          );
          console.log(
            "   Length:",
            Array.isArray(response) ? response.length : "N/A",
          );

          if (Array.isArray(response)) {
            const typedBookings = response as Booking[];
            const now = new Date();
            upcomingJobs = typedBookings.filter((booking: Booking) => {
              const scheduledDate = new Date(booking.scheduledAt);
              return scheduledDate > now;
            }).length;

            jobsCompleted = typedBookings.filter(
              (b: Booking) => b.escrowStatus === "released",
            ).length;

            setBookings(typedBookings);
            console.log("📊 Upcoming Jobs (future dates):", upcomingJobs);
            console.log("📊 Completed Jobs (released escrow):", jobsCompleted);
          }
        } catch (err) {
          console.error("❌ /bookings error:", err);
        }

        // 4️⃣ Try to get payments for monthly earnings
        let monthlyEarnings = 0;
        console.log("📍 Fetching /payments...");
        try {
          const response = await apiRequest("/payments");
          console.log("✅ /payments response:", response);
          console.log(
            "   Type:",
            Array.isArray(response) ? "Array" : typeof response,
          );
          console.log(
            "   Length:",
            Array.isArray(response) ? response.length : "N/A",
          );

          if (Array.isArray(response)) {
            const typedPayments = response as Payment[];
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const monthlyPayments = typedPayments.filter((payment: Payment) => {
              if (payment.status !== "completed") return false;
              if (!payment.createdAt) return false;
              const paymentDate = new Date(payment.createdAt);
              return (
                paymentDate.getMonth() === currentMonth &&
                paymentDate.getFullYear() === currentYear
              );
            });

            monthlyEarnings = monthlyPayments.reduce(
              (sum: number, payment: Payment) => sum + (payment.amount || 0),
              0,
            );

            setPayments(typedPayments);
            console.log("📊 Monthly Earnings:", monthlyEarnings);
          }
        } catch (err) {
          console.error("❌ /payments error:", err);
        }

        // 5️⃣ Get provider rating
        let averageRating = 0;
        try {
          const userProfile = await apiRequest("/users/me");
          averageRating = userProfile.providerProfile?.averageRating || 0;
          console.log("📊 Average Rating:", averageRating);
        } catch (err) {
          console.error("❌ Error getting rating:", err);
        }

        // 6️⃣ Calculate response rate (requests sent quotes / total requests)
        const totalRequests = serviceRequests.length;
        const requestsWithQuotes = serviceRequests.filter(
          (req: ServiceRequest) => req.status !== "pending" && req.status !== "canceled",
        ).length;
        const responseRate =
          totalRequests > 0
            ? Math.round((requestsWithQuotes / totalRequests) * 100)
            : 0;

        console.log("📊 Calculated Stats:");
        console.log("   Total Requests:", totalRequests);
        console.log("   Requests with Quotes:", requestsWithQuotes);
        console.log("   Response Rate:", `${responseRate}%`);
        console.log("   New Requests:", newRequests.length);
        console.log("   Upcoming Jobs:", upcomingJobs);
        console.log("   Jobs Completed:", jobsCompleted);
        console.log("   Monthly Earnings:", monthlyEarnings);
        console.log("   Rating:", averageRating);

        setStats({
          newRequests: newRequests.length,
          upcomingJobs: upcomingJobs,
          monthlyEarnings: monthlyEarnings,
          rating: averageRating,
          jobsCompleted: jobsCompleted,
          responseRate: `${responseRate}%`,
        });

        setRequests(newRequests);
        setAcceptedRequests(acceptedRequests);

        const mappedActivity: RecentActivityItem[] = [
          ...completedRequests.slice(0, 3).map((req) => ({
            customer: "Customer",
            service: req.service?.title || "Service",
            amount: "$0",
            status: "completed" as const,
          })),
        ];
        setRecentActivity(mappedActivity);
      } catch (err: unknown) {
        console.error("❌ Overall error fetching dashboard data:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);
  };

  const formatMoney = (amount: number) => {
    if (!Number.isFinite(amount)) return "—";
    return `$${Math.round(amount)}`;
  };

  const formatShortDate = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toISOString().slice(0, 10);
  };

  const parsePaymentCustomer = (p: Payment) => {
    const fromObject = `${p.homeowner?.firstName || ""} ${p.homeowner?.lastName || ""}`.trim();
    const fallback = p.homeownerName?.trim();
    return fromObject || fallback || "Customer";
  };

  const earningsSnapshot = React.useMemo(() => {
    const completed = payments.filter((p) => p?.status === "completed");
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const lastMonthDate = new Date(year, month - 1, 1);

    const sum = (list: Payment[]) =>
      list.reduce((acc, p) => acc + (p.amount || 0), 0);

    const thisMonth = sum(
      completed.filter((p) => {
        const d = p.createdAt ? new Date(p.createdAt) : null;
        return (
          !!d &&
          !Number.isNaN(d.getTime()) &&
          d.getMonth() === month &&
          d.getFullYear() === year
        );
      }),
    );

    const lastMonth = sum(
      completed.filter((p) => {
        const d = p.createdAt ? new Date(p.createdAt) : null;
        return (
          !!d &&
          !Number.isNaN(d.getTime()) &&
          d.getMonth() === lastMonthDate.getMonth() &&
          d.getFullYear() === lastMonthDate.getFullYear()
        );
      }),
    );

    const yearToDate = sum(
      completed.filter((p) => {
        const d = p.createdAt ? new Date(p.createdAt) : null;
        return !!d && !Number.isNaN(d.getTime()) && d.getFullYear() === year;
      }),
    );

    const averageJobValue =
      completed.length > 0 ? Math.round(yearToDate / completed.length) : 0;

    const recentPayments = [...completed]
      .sort((a, b) => {
        const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bd - ad;
      })
      .slice(0, 5);

    return {
      thisMonth,
      lastMonth,
      yearToDate,
      averageJobValue,
      recentPayments,
    };
  }, [payments]);

  const [availability, setAvailability] = React.useState(() => {
    return {
      Monday: { enabled: true, start: "09:00", end: "17:00" },
      Tuesday: { enabled: true, start: "09:00", end: "17:00" },
      Wednesday: { enabled: true, start: "09:00", end: "17:00" },
      Thursday: { enabled: true, start: "09:00", end: "17:00" },
      Friday: { enabled: true, start: "09:00", end: "17:00" },
      Saturday: { enabled: false, start: "10:00", end: "14:00" },
      Sunday: { enabled: false, start: "10:00", end: "14:00" },
    } as Record<string, { enabled: boolean; start: string; end: string }>;
  });

  // ✅ Dynamic top stats based on fetched data
  const topStats = [
    {
      title: "New Requests",
      value: stats.newRequests,
      icon: "!",
      iconClass: "text-[#d9a300]",
    },
    {
      title: "Upcoming Jobs",
      value: stats.upcomingJobs,
      icon: "📅",
      iconClass: "text-[#2a73d9]",
    },
    {
      title: "This Month",
      value: formatCurrency(stats.monthlyEarnings),
      icon: "$",
      iconClass: "text-[#22a355]",
    },
    {
      title: "Rating",
      value: `${stats.rating.toFixed(1)} ⭐`,
      icon: "↗",
      iconClass: "text-[#9333ea]",
    },
  ];

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

          {/* ✅ UPDATED: Dynamic stats from database */}
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
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-black/60 py-4">
                      No recent activity
                    </p>
                  ) : (
                    recentActivity.map((item) => (
                      <article
                        key={`${item.customer}-${item.amount}`}
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
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-black/10 bg-white p-4 text-black sm:p-5">
                <h2 className="text-xl font-semibold">
                  This Month&apos;s Performance
                </h2>

                <dl className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-black/75">Jobs Completed</dt>
                    <dd className="text-sm font-semibold">
                      {statsLoading ? "..." : stats.jobsCompleted}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-black/75">Response Rate</dt>
                    <dd className="text-sm font-semibold">
                      {statsLoading ? "..." : stats.responseRate}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-black/75">
                      Customer Satisfaction
                    </dt>
                    <dd className="text-sm font-semibold">
                      {statsLoading ? "..." : `${stats.rating.toFixed(1)} ⭐`}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-black/75">Total Earnings</dt>
                    <dd className="text-sm font-semibold text-[#22a355]">
                      {statsLoading
                        ? "..."
                        : formatCurrency(stats.monthlyEarnings)}
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

              {/* ✅ UPDATED: Dynamic requests from database */}
              <div className="mt-5 space-y-4">
                {statsLoading ? (
                  <p className="text-center text-black/60 py-8">
                    Loading requests...
                  </p>
                ) : requests.length === 0 ? (
                  <p className="text-center text-black/60 py-8">
                    No pending requests at the moment
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
                            <h3 className="text-[28px] font-medium leading-none text-black sm:text-[30px]">
                              {request.service?.title || "Service"}
                            </h3>
                            <span className="rounded-full bg-[#fff4cf] px-2 py-0.5 text-xs text-[#987303]">
                              {request.status}
                            </span>
                          </div>
                          <p className="mt-2 text-lg text-black/70">
                            Location: {request.city}
                          </p>
                          <p className="text-lg text-black/70">
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
                  ))
                )}
              </div>
            </>
          ) : activeTab === "Requests" ? (
            <div className="mt-6 space-y-4">
              <section className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🟡</span>
                    <h2 className="text-xl font-semibold text-black">
                      New Requests ({statsLoading ? "…" : requests.length})
                    </h2>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {statsLoading ? (
                    <p className="py-4 text-sm text-black/60">
                      Loading requests...
                    </p>
                  ) : requests.length === 0 ? (
                    <p className="py-4 text-sm text-black/60">
                      No new requests right now.
                    </p>
                  ) : (
                    requests.map((req) => (
                      <article
                        key={req.id}
                        className="rounded-2xl border border-black/10 bg-white px-4 py-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-[220px]">
                            <div className="flex items-center gap-2">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/[.05] text-sm font-semibold text-black/70">
                                {(req.service?.title || "S")
                                  .slice(0, 1)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-black">
                                  {req.service?.title || "Service"}
                                </p>
                                <p className="text-xs text-black/60">
                                  {formatShortDate(req.preferredDate)} •{" "}
                                  {new Date(
                                    req.preferredDate,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>

                            <p className="mt-3 text-sm text-black/70">
                              📍 {req.city}
                            </p>
                            <p className="mt-2 text-sm text-black/60">
                              {req.description}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button className="inline-flex items-center rounded-lg bg-[#16a34a] px-4 py-2 text-sm font-medium text-white hover:bg-[#15803d]">
                              Accept Job
                            </button>
                            <button className="inline-flex items-center rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black/75 hover:bg-black/[.02]">
                              💬 Message
                            </button>
                            <button className="inline-flex items-center rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black/75 hover:bg-black/[.02]">
                              📞 Call
                            </button>
                            <button className="inline-flex items-center rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                              Decline
                            </button>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  <h2 className="text-xl font-semibold text-black">
                    Accepted Jobs (
                    {statsLoading ? "…" : acceptedRequests.length})
                  </h2>
                </div>

                <div className="mt-4 space-y-3">
                  {statsLoading ? (
                    <p className="py-4 text-sm text-black/60">
                      Loading accepted jobs...
                    </p>
                  ) : acceptedRequests.length === 0 ? (
                    <p className="py-4 text-sm text-black/60">
                      No accepted jobs yet.
                    </p>
                  ) : (
                    acceptedRequests.map((req) => (
                      <article
                        key={req.id}
                        className="rounded-2xl border border-black/10 bg-white px-4 py-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[.05] text-sm font-semibold text-black/70">
                              {(req.service?.title || "S")
                                .slice(0, 1)
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-black">
                                {req.service?.title || "Service"}
                              </p>
                              <p className="text-xs text-black/60">
                                {formatShortDate(req.preferredDate)} • {req.city}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-[#eaf2ff] px-2 py-0.5 text-xs text-[#2a73d9]">
                              scheduled
                            </span>
                            <button className="inline-flex items-center rounded-lg bg-[#0f172a] px-4 py-2 text-sm font-medium text-white hover:bg-black">
                              Message Customer
                            </button>
                            <button className="inline-flex items-center rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black/75 hover:bg-black/[.02]">
                              Start Job
                            </button>
                            <button className="inline-flex items-center rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black/75 hover:bg-black/[.02]">
                              Get Directions
                            </button>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>
          ) : activeTab === "Schedule" ? (
            <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-black">
                Availability Settings
              </h2>
              <p className="mt-1 text-sm text-black/55">
                Set your weekly availability to receive relevant booking requests
              </p>

              <div className="mt-5 space-y-3">
                {Object.entries(availability).map(([day, cfg]) => (
                  <div
                    key={day}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-[90px] text-sm font-medium text-black">
                        {day}
                      </span>
                      <button
                        type="button"
                        aria-label={`toggle ${day} availability`}
                        onClick={() =>
                          setAvailability((prev) => ({
                            ...prev,
                            [day]: { ...prev[day], enabled: !prev[day].enabled },
                          }))
                        }
                        className={`relative h-5 w-9 rounded-full ${
                          cfg.enabled ? "bg-[#0f172a]" : "bg-black/20"
                        }`}
                      >
                        <span
                          className={`absolute top-[2px] h-4 w-4 rounded-full bg-white transition-all ${
                            cfg.enabled ? "right-[2px]" : "left-[2px]"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={cfg.start}
                        disabled={!cfg.enabled}
                        onChange={(e) =>
                          setAvailability((prev) => ({
                            ...prev,
                            [day]: { ...prev[day], start: e.target.value },
                          }))
                        }
                        className="w-[120px] rounded-lg border border-black/10 bg-[#f5f6f8] px-3 py-2 text-sm text-black disabled:opacity-50"
                      />
                      <span className="text-sm text-black/50">to</span>
                      <input
                        type="time"
                        value={cfg.end}
                        disabled={!cfg.enabled}
                        onChange={(e) =>
                          setAvailability((prev) => ({
                            ...prev,
                            [day]: { ...prev[day], end: e.target.value },
                          }))
                        }
                        className="w-[120px] rounded-lg border border-black/10 bg-[#f5f6f8] px-3 py-2 text-sm text-black disabled:opacity-50"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-black/10 bg-white p-4">
                <h3 className="text-sm font-semibold text-black">
                  Upcoming bookings
                </h3>
                <div className="mt-3 space-y-2">
                  {statsLoading ? (
                    <p className="py-2 text-sm text-black/60">Loading…</p>
                  ) : bookings.length === 0 ? (
                    <p className="py-2 text-sm text-black/60">
                      No upcoming bookings yet.
                    </p>
                  ) : (
                    bookings
                      .filter((b) => new Date(b.scheduledAt) > new Date())
                      .slice(0, 5)
                      .map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-black">
                              Booking
                            </p>
                            <p className="text-xs text-black/60">
                              {new Date(b.scheduledAt).toLocaleString()}
                            </p>
                          </div>
                          <span className="rounded-full bg-[#eaf2ff] px-2 py-0.5 text-xs text-[#2a73d9]">
                            {b.escrowStatus}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert("Availability saved (UI only for now).")}
                className="mt-6 inline-flex items-center rounded-lg bg-[#0f172a] px-5 py-3 text-sm font-medium text-white hover:bg-black"
              >
                Save Availability
              </button>
            </div>
          ) : activeTab === "Earnings" ? (
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <section className="rounded-2xl border border-black/10 bg-white p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-black">
                  Earnings Summary
                </h2>

                <dl className="mt-4 divide-y divide-black/10">
                  <div className="flex items-center justify-between py-3">
                    <dt className="text-sm text-black/70">This Month</dt>
                    <dd className="text-sm font-semibold text-[#22a355]">
                      {statsLoading ? "…" : formatMoney(earningsSnapshot.thisMonth)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <dt className="text-sm text-black/70">Last Month</dt>
                    <dd className="text-sm font-semibold">
                      {statsLoading ? "…" : formatMoney(earningsSnapshot.lastMonth)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <dt className="text-sm text-black/70">Year to Date</dt>
                    <dd className="text-sm font-semibold">
                      {statsLoading ? "…" : formatMoney(earningsSnapshot.yearToDate)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <dt className="text-sm text-black/70">Average Job Value</dt>
                    <dd className="text-sm font-semibold">
                      {statsLoading
                        ? "…"
                        : formatMoney(earningsSnapshot.averageJobValue)}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-2xl border border-black/10 bg-white p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-black">
                  Recent Payments
                </h2>

                <div className="mt-4 space-y-3">
                  {statsLoading ? (
                    <p className="py-4 text-sm text-black/60">
                      Loading payments...
                    </p>
                  ) : earningsSnapshot.recentPayments.length === 0 ? (
                    <p className="py-4 text-sm text-black/60">
                      No payments yet.
                    </p>
                  ) : (
                    earningsSnapshot.recentPayments.map((p, idx) => (
                      <article
                        key={p.id || `${p.createdAt || "p"}-${idx}`}
                        className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-black">
                            {parsePaymentCustomer(p)}
                          </p>
                          <p className="text-xs text-black/60">
                            {formatShortDate(p.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#22a355]">
                            {formatMoney(p.amount || 0)}
                          </p>
                          <p className="text-xs text-black/60">Paid</p>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>
          ) : activeTab === "Profile" ? (
            <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-black">Profile</h2>
              <p className="mt-1 text-sm text-black/55">
                Your business details and preferences
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-black/10 bg-white px-4 py-3">
                  <p className="text-xs text-black/60">Name</p>
                  <p className="mt-1 text-sm font-medium text-black">
                    {loading
                      ? "…"
                      : `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
                        "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-black/10 bg-white px-4 py-3">
                  <p className="text-xs text-black/60">Business</p>
                  <p className="mt-1 text-sm font-medium text-black">
                    {loading ? "…" : profile?.businessName || "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-black/10 bg-white px-4 py-3">
                  <p className="text-xs text-black/60">Primary Service</p>
                  <p className="mt-1 text-sm font-medium text-black">
                    {loading ? "…" : profile?.primaryService || "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-black/10 bg-white px-4 py-3">
                  <p className="text-xs text-black/60">Experience</p>
                  <p className="mt-1 text-sm font-medium text-black">
                    {loading
                      ? "…"
                      : profile?.yearsExperience != null
                        ? `${profile.yearsExperience} years`
                        : "—"}
                  </p>
                </div>
              </div>
            </div>
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
