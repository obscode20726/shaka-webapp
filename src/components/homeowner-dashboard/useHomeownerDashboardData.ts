"use client";

import React from "react";
import { apiRequest, fetchServiceRequests } from "@/lib/api";
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

function normalizeRequestStatus(status: string) {
  const normalized = status.toLowerCase().replace(/_/g, "-");
  return normalized === "cancelled" ? "canceled" : normalized;
}

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
          serviceRequests = (await fetchServiceRequests()) as ServiceRequest[];
        } catch (err) {
          console.error("Unable to load service requests:", err);
        }

        const upcomingRequests = serviceRequests.filter(
          (request) => normalizeRequestStatus(request.status) === "pending",
        );
        const inProgressRequests = serviceRequests.filter((request) => {
          const status = normalizeRequestStatus(request.status);
          return status === "accepted" || status === "in-progress";
        });
        const completedRequests = serviceRequests.filter(
          (request) => normalizeRequestStatus(request.status) === "completed",
        );

        let totalSpent = 0;

        try {
          const response = await apiRequest("/bookings");
          if (Array.isArray(response)) {
            setBookings(response as Booking[]);
          }
        } catch (err) {
          console.error("Unable to load bookings:", err);
        }

        try {
          const response = await apiRequest("/payments");
          if (Array.isArray(response)) {
            const typedPayments = response as Payment[];
            totalSpent = typedPayments.reduce((sum, payment) => {
              if (payment.status === "completed") {
                return sum + (payment.amount || 0);
              }
              return sum;
            }, 0);
            setPayments(typedPayments);
          }
        } catch (err) {
          console.error("Unable to load payments:", err);
        }

        setStats({
          upcoming: upcomingRequests.length,
          inProgress: inProgressRequests.length,
          completed: completedRequests.length,
          totalSpent,
        });
        setRequests(serviceRequests);
      } catch (err: unknown) {
        console.error("Error fetching homeowner dashboard data:", err);
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
