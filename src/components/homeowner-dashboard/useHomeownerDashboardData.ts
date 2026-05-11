"use client";

import React from "react";
import { apiRequest } from "@/lib/api";
import type {
  Booking,
  HomeownerProfile,
  HomeownerStats,
  Payment,
  ServiceRequest,
} from "./types";

const initialStats: HomeownerStats = {
  upcoming: 0,
  inProgress: 0,
  completed: 0,
  totalSpent: 0,
};

export function useHomeownerDashboardData() {
  const [profile, setProfile] = React.useState<HomeownerProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [profileError, setProfileError] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState<HomeownerStats>(initialStats);
  const [requests, setRequests] = React.useState<ServiceRequest[]>([]);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
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

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setStatsLoading(true);

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

        console.log("📋 Service Request Status Breakdown:");
        serviceRequests.forEach((request) => {
          console.log(
            `   - ${request.service?.title || "Service"}: status = "${request.status}"`,
          );
        });

        const upcomingRequests = serviceRequests.filter(
          (request) => request.status === "pending",
        );
        const inProgressRequests = serviceRequests.filter(
          (request) =>
            request.status === "accepted" || request.status === "in-progress",
        );
        const completedRequests = serviceRequests.filter(
          (request) => request.status === "completed",
        );
        const canceledRequests = serviceRequests.filter(
          (request) => request.status === "canceled",
        );

        console.log("📊 Pending (Awaiting Quote):", upcomingRequests.length);
        console.log("📊 In Progress:", inProgressRequests.length);
        console.log("📊 Completed:", completedRequests.length);
        console.log("📊 Canceled:", canceledRequests.length);

        let totalSpent = 0;

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
            const upcomingCount = typedBookings.filter((booking) => {
              const scheduledDate = new Date(booking.scheduledAt);
              return scheduledDate > now;
            }).length;
            setBookings(typedBookings);
            console.log("📊 Upcoming Bookings:", upcomingCount);
          }
        } catch (err) {
          console.error("❌ /bookings error:", err);
        }

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
            totalSpent = typedPayments.reduce((sum, payment) => {
              if (payment.status === "completed") {
                return sum + (payment.amount || 0);
              }
              return sum;
            }, 0);
            setPayments(typedPayments);
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
          totalSpent,
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

  return {
    loading,
    profile,
    profileError,
    bookings,
    payments,
    requests,
    stats,
    statsLoading,
  };
}
