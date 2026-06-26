"use client";

import React from "react";
import AllBookingsTab from "./admin-dashboard/AllBookingsTab";
import AnalyticsTab from "./admin-dashboard/AnalyticsTab";
import DashboardHeader from "./admin-dashboard/DashboardHeader";
import DashboardTabs from "./admin-dashboard/DashboardTabs";
import DisputesTab from "./admin-dashboard/DisputesTab";
import EmptyTab from "./admin-dashboard/EmptyTab";
import OverviewTab from "./admin-dashboard/OverviewTab";
import ProviderApprovalsTab from "./admin-dashboard/ProviderApprovalsTab";
import StatsGrid from "./admin-dashboard/StatsGrid";
import UsersTab from "./admin-dashboard/UsersTab";
import type { AdminTabName } from "./admin-dashboard/types";
import {
  fetchAdminSummaryStats,
  fetchAdminPlatformStats,
  fetchAdminRecentBookings,
  fetchProviderApprovals,
  fetchAdminCustomers,
  fetchAdminProviders,
  fetchAdminDisputes,
  type AdminSummaryStats,
  type PlatformStats,
  type RecentBooking,
  type ProviderApproval,
  type AdminCustomer,
  type AdminProvider,
  type AdminDispute,
} from "../lib/api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = React.useState<AdminTabName>("Overview");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [summaryStats, setSummaryStats] = React.useState<AdminSummaryStats>({
    totalUsers: 0,
    activeProviders: 0,
    pendingApprovals: 0,
    activeBookings: 0,
    platformRevenue: 0,
  });
  const [platformStats, setPlatformStats] = React.useState<PlatformStats>({
    totalTransactionVolume: 0,
    platformFees: 0,
    averageJobValue: 0,
    completionRate: 0,
    customerSatisfaction: 0,
  });
  const [recentBookings, setRecentBookings] = React.useState<RecentBooking[]>([]);
  const [providerApprovals, setProviderApprovals] = React.useState<ProviderApproval[]>([]);
  const [recentCustomers, setRecentCustomers] = React.useState<AdminCustomer[]>([]);
  const [topProviders, setTopProviders] = React.useState<AdminProvider[]>([]);
  const [disputes, setDisputes] = React.useState<AdminDispute[]>([]);

  const refreshDashboardData = React.useCallback(async () => {
    try {
      setError(null);

      const [
        summaryData,
        platformData,
        bookingsData,
        approvalsData,
        customersData,
        providersData,
        disputesData,
      ] = await Promise.all([
        fetchAdminSummaryStats(),
        fetchAdminPlatformStats(),
        fetchAdminRecentBookings(),
        fetchProviderApprovals(),
        fetchAdminCustomers(),
        fetchAdminProviders(),
        fetchAdminDisputes(),
      ]);

      setSummaryStats(summaryData);
      setPlatformStats(platformData);
      setRecentBookings(bookingsData);
      setProviderApprovals(approvalsData);
      setRecentCustomers(customersData);
      setTopProviders(providersData);
      setDisputes(disputesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    }
  }, []);

  React.useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        await refreshDashboardData();
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [refreshDashboardData]);

  const adminTabs: Array<{
    name: AdminTabName;
    badge?: number;
    badgeClass?: string;
  }> = React.useMemo(() => [
    { name: "Overview" },
    { name: "Provider Approvals", badge: summaryStats.pendingApprovals },
    { name: "All Bookings" },
    { name: "Users" },
    { name: "Disputes", badge: disputes.length, badgeClass: "bg-[#fb2c36]" },
    { name: "Analytics" },
  ], [summaryStats.pendingApprovals, disputes.length]);

  const handleLogout = React.useCallback(() => {
    sessionStorage.removeItem("admin_session");
    window.location.href = "/signin/admin";
  }, []);

  if (loading) {
    return (
      <section className="min-h-screen bg-[#f6f7f9] py-10 sm:py-16 lg:py-[84px]">
        <div className="mx-auto w-full max-w-[1376px] px-4 sm:px-6 lg:px-8">
          <DashboardHeader onLogout={handleLogout} />
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen bg-[#f6f7f9] py-10 sm:py-16 lg:py-[84px]">
        <div className="mx-auto w-full max-w-[1376px] px-4 sm:px-6 lg:px-8">
          <DashboardHeader onLogout={handleLogout} />
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-600">Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f6f7f9] py-10 sm:py-16 lg:py-[84px]">
      <div className="mx-auto w-full max-w-[1376px] px-4 sm:px-6 lg:px-8">
        <DashboardHeader onLogout={handleLogout} />
        <StatsGrid stats={summaryStats} />
        <DashboardTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={adminTabs}
        />

        {activeTab === "Overview" ? (
          <OverviewTab bookings={recentBookings} stats={platformStats} />
        ) : activeTab === "Provider Approvals" ? (
          <ProviderApprovalsTab providers={providerApprovals} onRefresh={refreshDashboardData} />
        ) : activeTab === "All Bookings" ? (
          <AllBookingsTab bookings={recentBookings} />
        ) : activeTab === "Users" ? (
          <UsersTab customers={recentCustomers} providers={topProviders} />
        ) : activeTab === "Disputes" ? (
          <DisputesTab disputes={disputes} />
        ) : activeTab === "Analytics" ? (
          <AnalyticsTab stats={platformStats} />
        ) : (
          <EmptyTab label={activeTab} />
        )}
      </div>
    </section>
  );
}
