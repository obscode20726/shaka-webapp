"use client";



import React from "react";

import {

  apiRequest,

  fetchProviderDashboardMetrics,

  fetchServiceRequestsForProvider,

  unwrapArrayResponse,

  updateServiceRequestStatus,

  type UserMeResponse,

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

  ProviderProfile,

  RecentActivityItem,

  ServiceRequest,

} from "./types";



const initialStats: DashboardStats = {

  newRequests: 0,

  upcomingJobs: 0,

  monthlyEarnings: 0,

  lastMonthEarnings: 0,

  yearToDateEarnings: 0,

  averageJobValue: 0,

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

        const userProfile = await apiRequest<UserMeResponse>("/users/me");

        setProfile((userProfile.providerProfile as ProviderProfile | undefined) ?? null);

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

          console.log("DEBUG: Fetched bookings:", typedBookings);

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
        let lastMonthEarnings = 0;
        let yearToDateEarnings = 0;
        let averageJobValue = 0;

        // Calculate monthly earnings from bookings
        try {
          const response = await apiRequest("/bookings");
          const typedBookings = unwrapArrayResponse<Booking>(response);
          console.log("DEBUG: Bookings for earnings calculation:", typedBookings);
          
          if (typedBookings.length > 0) {
            const now = new Date();
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const currentYear = now.getFullYear();
            console.log("DEBUG: Current date:", now);
            console.log("DEBUG: Last month date:", lastMonth);
            console.log("DEBUG: Current year:", currentYear);
            
            monthlyEarnings = typedBookings.reduce((sum: number, booking: Booking) => {
              if (!booking.amount) return sum;
              const bookingDate = new Date(booking.scheduledAt);
              const isCurrentMonth =
                bookingDate.getMonth() === now.getMonth() &&
                bookingDate.getFullYear() === now.getFullYear();
              
              console.log("DEBUG: Processing booking for this month:", {
                id: booking.id,
                amount: booking.amount,
                scheduledAt: booking.scheduledAt,
                isCurrentMonth
              });
              
              return isCurrentMonth ? sum + booking.amount : sum;
            }, 0);
            
            lastMonthEarnings = typedBookings.reduce((sum: number, booking: Booking) => {
              if (!booking.amount) return sum;
              const bookingDate = new Date(booking.scheduledAt);
              const isLastMonth =
                bookingDate.getMonth() === lastMonth.getMonth() &&
                bookingDate.getFullYear() === lastMonth.getFullYear();
              
              console.log("DEBUG: Processing booking for last month:", {
                id: booking.id,
                amount: booking.amount,
                scheduledAt: booking.scheduledAt,
                isLastMonth
              });
              
              return isLastMonth ? sum + booking.amount : sum;
            }, 0);
            
            yearToDateEarnings = typedBookings.reduce((sum: number, booking: Booking) => {
              if (!booking.amount) return sum;
              const bookingDate = new Date(booking.scheduledAt);
              const isCurrentYear = bookingDate.getFullYear() === currentYear;
              
              console.log("DEBUG: Processing booking for year to date:", {
                id: booking.id,
                amount: booking.amount,
                scheduledAt: booking.scheduledAt,
                isCurrentYear
              });
              
              return isCurrentYear ? sum + booking.amount : sum;
            }, 0);
            
            // Calculate average job value from all bookings with amounts
            const bookingsWithAmounts = typedBookings.filter((booking) => booking.amount && booking.amount > 0);
            const totalAmount = bookingsWithAmounts.reduce((sum: number, booking: Booking) => sum + (booking.amount || 0), 0);
            averageJobValue = bookingsWithAmounts.length > 0 ? totalAmount / bookingsWithAmounts.length : 0;
            
            console.log("DEBUG: Calculated monthlyEarnings:", monthlyEarnings);
            console.log("DEBUG: Calculated lastMonthEarnings:", lastMonthEarnings);
            console.log("DEBUG: Calculated yearToDateEarnings:", yearToDateEarnings);
            console.log("DEBUG: Calculated averageJobValue:", averageJobValue);
          }
        } catch (err) {
          console.error("Unable to calculate monthly earnings:", err);
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

          monthlyEarnings: monthlyEarnings,

          lastMonthEarnings: lastMonthEarnings,

          yearToDateEarnings: yearToDateEarnings,

          averageJobValue: averageJobValue,

          rating: providerStats?.average_rating ?? 0,

          jobsCompleted:

            providerStats?.total_bookings ?? jobsCompleted,

          responseRate: `${responseRate}%`,

        });

        console.log("DEBUG: Final stats set:", {
          newRequests: pendingRequests.length,
          upcomingJobs: providerStats?.upcoming_jobs_count ?? upcomingJobs,
          monthlyEarnings: providerStats?.revenue_this_month ?? monthlyEarnings,
          rating: providerStats?.average_rating ?? 0,
          jobsCompleted: providerStats?.total_bookings ?? jobsCompleted,
          responseRate: `${responseRate}%`
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

