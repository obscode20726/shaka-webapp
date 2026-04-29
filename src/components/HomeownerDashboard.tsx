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

type Booking = {
  id: string;
  scheduledAt: string;
  escrowStatus: string;
  provider?: {
    firstName: string;
    lastName: string;
  };
};

const tabs = ["Quotes", "Bookings", "Favorites", "Payments", "Settings"];

export default function HomeownerDashboard() {
  const [profile, setProfile] = React.useState<HomeownerProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [profileError, setProfileError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState(0);

  // ✅ State for dashboard statistics
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
        console.log("✅ Homeowner Profile:", userProfile);
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

  // ✅ Fetch dashboard statistics and service requests
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

        // 2️⃣ Count requests by status (from homeowner perspective)
        console.log("📋 Service Request Status Breakdown:");
        serviceRequests.forEach((req: any) => {
          console.log(
            `   - ${req.service?.title || "Service"}: status = "${req.status}"`,
          );
        });

        // Upcoming = Provider hasn't sent quote yet (waiting for provider action)
        const upcomingRequests = serviceRequests.filter(
          (req: any) => req.status === "pending",
        );

        // In Progress = Homeowner accepted and payment made (work in progress)
        const inProgressRequests = serviceRequests.filter(
          (req: any) =>
            req.status === "accepted" || req.status === "in-progress",
        );

        // Completed = Service finished successfully
        const completedRequests = serviceRequests.filter(
          (req: any) => req.status === "completed",
        );

        // Canceled = Service was canceled
        const canceledRequests = serviceRequests.filter(
          (req: any) => req.status === "canceled",
        );

        console.log("📊 Pending (Awaiting Quote):", upcomingRequests.length);
        console.log("📊 In Progress:", inProgressRequests.length);
        console.log("📊 Completed:", completedRequests.length);
        console.log("📊 Canceled:", canceledRequests.length);

        // 3️⃣ Get bookings (Upcoming)
        let upcomingCount = 0;
        let totalSpent = 0; // ✅ Initialize before using it

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
            const now = new Date();
            upcomingCount = response.filter((booking: any) => {
              const scheduledDate = new Date(booking.scheduledAt);
              return scheduledDate > now;
            }).length;

            console.log("📊 Upcoming Bookings:", upcomingCount);
          }
        } catch (err) {
          console.error("❌ /bookings error:", err);
        }

        // 4️⃣ Try to get payments for total spent
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
            totalSpent = response.reduce((sum: number, payment: any) => {
              if (payment.status === "completed") {
                return sum + (payment.amount || 0);
              }
              return sum;
            }, 0);
            console.log("📊 Total Spent:", totalSpent);
          }
        } catch (err) {
          console.error("❌ /payments error:", err);
        }

        console.log("📊 Dashboard Stats Summary:");
        console.log("   Upcoming:", upcomingRequests.length);
        console.log("   In Progress:", inProgressRequests.length);
        console.log("   Completed:", completedRequests.length);
        console.log("   Total Spent:", totalSpent);

        setStats({
          upcoming: upcomingRequests.length,
          inProgress: inProgressRequests.length,
          completed: completedRequests.length,
          totalSpent: totalSpent,
        });

        setRequests(serviceRequests);
      } catch (err: unknown) {
        console.error("❌ Overall error fetching dashboard data:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const welcomeName = profile?.fullName?.split(" ").at(0) || "Homeowner";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);
  };

  // ✅ Dynamic top stats based on fetched data
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
              {profileError ? (
                <p className="mt-2 text-sm text-red-600">{profileError}</p>
              ) : null}
            </div>

            <button className="inline-flex items-center gap-2 rounded-lg bg-[#ff6a00] px-4 py-2 text-sm font-medium text-white hover:bg-[#e85f00]">
              <span>+</span>
              <span>Book Service</span>
            </button>
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

              {/* ✅ UPDATED: Dynamic requests from database */}
              <div className="mt-5 space-y-4">
                {statsLoading ? (
                  <p className="text-center text-black/60 py-8">
                    Loading requests...
                  </p>
                ) : requests.length === 0 ? (
                  <p className="text-center text-black/60 py-8">
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
                          {request.provider ? (
                            <p className="mt-2 text-sm text-black/70">
                              Provider: {request.provider.firstName}{" "}
                              {request.provider.lastName}
                            </p>
                          ) : null}
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
