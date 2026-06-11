"use client";

import React from "react";
import {
  apiRequest,
  fetchProviderDashboardMetrics,
  fetchServiceRequestsForProvider,
  unwrapArrayResponse,
  updateServiceRequestStatus,
} from "@/lib/api";
import type { ServiceRequestStatus } from "@/lib/api";
import {
  isActiveRequest,
  isCompletedRequest,
  isPendingRequest,
  isProviderVisibleRequest,
  normalizeRequestStatus,
  parseHomeownerName,
} from "./formatters";
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
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [recentActivity, setRecentActivity] = React.useState<
    RecentActivityItem[]
  >([]);
  const [statsLoading, setStatsLoading] = React.useState(true);
  const [updatingRequestId, setUpdatingRequestId] = React.useState<
    string | null
  >(null);
  const [requestActionError, setRequestActionError] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userProfile = await apiRequest("/users/me");
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
        try {
          serviceRequests =
            (await fetchServiceRequestsForProvider()) as ServiceRequest[];
        } catch (err) {
          console.error("Unable to load service requests:", err);
        }

        serviceRequests = serviceRequests.filter((request) =>
          isProviderVisibleRequest(request.status),
        );

        const pendingRequests = serviceRequests.filter((request) =>
          isPendingRequest(request.status),
        );
        const completedRequests = serviceRequests.filter((request) =>
          isCompletedRequest(request.status),
        );

        let upcomingJobs = 0;
        let jobsCompleted = 0;

        try {
          const response = await apiRequest("/bookings");
          const typedBookings = unwrapArrayResponse<Booking>(response);
          if (typedBookings.length > 0) {
            const now = new Date();
            upcomingJobs = typedBookings.filter(
              (booking) => new Date(booking.scheduledAt) > now,
            ).length;
            jobsCompleted = typedBookings.filter(
              (booking) => booking.escrowStatus === "released",
            ).length;
            setBookings(typedBookings);
          }
        } catch (err) {
          console.error("Unable to load bookings:", err);
        }

        let monthlyEarnings = 0;

        try {
          const response = await apiRequest("/payments");
          const typedPayments = unwrapArrayResponse<Payment>(response);
          if (typedPayments.length > 0) {
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
          }
        } catch (err) {
          console.error("Unable to load payments:", err);
        }

        const requestsWithQuotes = serviceRequests.filter((request) => {
          const status = normalizeRequestStatus(request.status);
          return status !== "pending" && status !== "canceled";
        }).length;
        const responseRate =
          serviceRequests.length > 0
            ? Math.round((requestsWithQuotes / serviceRequests.length) * 100)
            : 0;

        const metrics = await fetchProviderDashboardMetrics();
        const providerStats = metrics?.provider_stats;

        setStats({
          newRequests: pendingRequests.length,
          upcomingJobs:
            providerStats?.upcoming_jobs_count ?? upcomingJobs,
          monthlyEarnings:
            providerStats?.revenue_this_month ?? monthlyEarnings,
          rating: providerStats?.average_rating ?? 0,
          jobsCompleted:
            providerStats?.total_bookings ?? jobsCompleted,
          responseRate: `${responseRate}%`,
        });
        setRequests(serviceRequests);
        setRecentActivity(
          completedRequests.slice(0, 3).map((request) => ({
            customer: parseHomeownerName(request.homeowner),
            service: request.service?.title || "Service",
            amount: "$0",
            status: "completed" as const,
          })),
        );
      } catch (err: unknown) {
        console.error("Error fetching provider dashboard data:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const acceptedRequests = React.useMemo(() => {
    return requests.filter((request) => isActiveRequest(request.status));
  }, [requests]);

  const pendingRequests = React.useMemo(() => {
    return requests.filter((request) => isPendingRequest(request.status));
  }, [requests]);

  const liveStats = React.useMemo<DashboardStats>(
    () => ({ ...stats, newRequests: pendingRequests.length }),
    [stats, pendingRequests.length],
  );

  const updateRequestStatus = React.useCallback(
    async (id: string, status: ServiceRequestStatus) => {
      setRequestActionError(null);
      setUpdatingRequestId(id);
      try {
        await updateServiceRequestStatus(id, status);
        setRequests((prev) =>
          prev.map((request) =>
            request.id === id ? { ...request, status } : request,
          ),
        );
      } catch (err: unknown) {
        setRequestActionError(
          err instanceof Error ? err.message : "Unable to update the request",
        );
      } finally {
        setUpdatingRequestId(null);
      }
    },
    [],
  );

  const acceptRequest = React.useCallback(
    (id: string) => updateRequestStatus(id, "accepted"),
    [updateRequestStatus],
  );

  const declineRequest = React.useCallback(
    (id: string) => updateRequestStatus(id, "cancelled"),
    [updateRequestStatus],
  );

  return {
    acceptRequest,
    acceptedRequests,
    bookings,
    declineRequest,
    loading,
    payments,
    pendingRequests,
    profile,
    profileError,
    recentActivity,
    requestActionError,
    requests,
    stats: liveStats,
    statsLoading,
    updatingRequestId,
  };
}
