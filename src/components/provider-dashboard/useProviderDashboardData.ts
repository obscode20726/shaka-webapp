"use client";

import React from "react";
import { apiRequest } from "@/lib/api";
import type {
  Booking,
  DashboardStats,
  Payment,
  ProviderProfile,
  RecentActivityItem,
  ServiceRequest,
} from "./types";

const initialStats: DashboardStats = {
  newRequests: 0,
  upcomingJobs: 0,
  monthlyEarnings: 0,
  rating: 0,
  jobsCompleted: 0,
  responseRate: "0%",
};

export function useProviderDashboardData() {
  const [profile, setProfile] = React.useState<ProviderProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [profileError, setProfileError] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState<DashboardStats>(initialStats);
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

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setStatsLoading(true);

        let serviceRequests: ServiceRequest[] = [];
        console.log("📍 Fetching /service-requests...");
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
          if (Array.isArray(response)) serviceRequests = response;
        } catch (err) {
          console.error("❌ /service-requests error:", err);
        }

        console.log("📋 Service Request Status Breakdown:");
        serviceRequests.forEach((request) => {
          console.log(
            `   - ${request.service?.title || "Service"}: status = "${request.status}"`,
          );
        });

        const newRequests = serviceRequests.filter(
          (request) => request.status === "pending",
        );
        const acceptedRequests = serviceRequests.filter(
          (request) =>
            request.status === "accepted" || request.status === "in-progress",
        );
        const completedRequests = serviceRequests.filter(
          (request) => request.status === "completed",
        );

        console.log("📊 New Requests (Pending):", newRequests.length);
        console.log("📊 Accepted/In Progress:", acceptedRequests.length);
        console.log("📊 Completed:", completedRequests.length);

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
            upcomingJobs = typedBookings.filter(
              (booking) => new Date(booking.scheduledAt) > now,
            ).length;
            jobsCompleted = typedBookings.filter(
              (booking) => booking.escrowStatus === "released",
            ).length;
            setBookings(typedBookings);
            console.log("📊 Upcoming Jobs (future dates):", upcomingJobs);
            console.log("📊 Completed Jobs (released escrow):", jobsCompleted);
          }
        } catch (err) {
          console.error("❌ /bookings error:", err);
        }

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
            monthlyEarnings = typedPayments.reduce((sum, payment) => {
              if (payment.status !== "completed" || !payment.createdAt) {
                return sum;
              }
              const paymentDate = new Date(payment.createdAt);
              const isCurrentMonth =
                paymentDate.getMonth() === now.getMonth() &&
                paymentDate.getFullYear() === now.getFullYear();
              return isCurrentMonth ? sum + (payment.amount || 0) : sum;
            }, 0);
            setPayments(typedPayments);
            console.log("📊 Monthly Earnings:", monthlyEarnings);
          }
        } catch (err) {
          console.error("❌ /payments error:", err);
        }

        let averageRating = 0;
        try {
          const userProfile = await apiRequest("/users/me");
          averageRating = userProfile.providerProfile?.averageRating || 0;
          console.log("📊 Average Rating:", averageRating);
        } catch (err) {
          console.error("❌ Error getting rating:", err);
        }

        const requestsWithQuotes = serviceRequests.filter(
          (request) =>
            request.status !== "pending" && request.status !== "canceled",
        ).length;
        const responseRate =
          serviceRequests.length > 0
            ? Math.round((requestsWithQuotes / serviceRequests.length) * 100)
            : 0;

        console.log("📊 Calculated Stats:");
        console.log("   Total Requests:", serviceRequests.length);
        console.log("   Requests with Quotes:", requestsWithQuotes);
        console.log("   Response Rate:", `${responseRate}%`);
        console.log("   New Requests:", newRequests.length);
        console.log("   Upcoming Jobs:", upcomingJobs);
        console.log("   Jobs Completed:", jobsCompleted);
        console.log("   Monthly Earnings:", monthlyEarnings);
        console.log("   Rating:", averageRating);

        setStats({
          newRequests: newRequests.length,
          upcomingJobs,
          monthlyEarnings,
          rating: averageRating,
          jobsCompleted,
          responseRate: `${responseRate}%`,
        });
        setRequests(newRequests);
        setAcceptedRequests(acceptedRequests);
        setRecentActivity(
          completedRequests.slice(0, 3).map((request) => ({
            customer: "Customer",
            service: request.service?.title || "Service",
            amount: "$0",
            status: "completed",
          })),
        );
      } catch (err) {
        console.error("❌ Overall error fetching dashboard data:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    acceptedRequests,
    bookings,
    loading,
    payments,
    profile,
    profileError,
    recentActivity,
    requests,
    stats,
    statsLoading,
  };
}
