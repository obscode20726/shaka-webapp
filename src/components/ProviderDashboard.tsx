"use client";

import React from "react";
import DashboardHeader from "./provider-dashboard/DashboardHeader";
import DashboardTabs from "./provider-dashboard/DashboardTabs";
import EarningsTab from "./provider-dashboard/EarningsTab";
import FloatingActions from "./provider-dashboard/FloatingActions";
import OverviewTab from "./provider-dashboard/OverviewTab";
import ProfileTab from "./provider-dashboard/ProfileTab";
import QuotesTab from "./provider-dashboard/QuotesTab";
import RequestsTab from "./provider-dashboard/RequestsTab";
import ScheduleTab from "./provider-dashboard/ScheduleTab";
import StatsGrid from "./provider-dashboard/StatsGrid";
import { buildEarningsSnapshot, formatCurrency } from "./provider-dashboard/formatters";
import { useProviderDashboardData } from "./provider-dashboard/useProviderDashboardData";
import type { Availability, TabName } from "./provider-dashboard/types";

const initialAvailability: Availability = {
  Monday: { enabled: true, start: "09:00", end: "17:00" },
  Tuesday: { enabled: true, start: "09:00", end: "17:00" },
  Wednesday: { enabled: true, start: "09:00", end: "17:00" },
  Thursday: { enabled: true, start: "09:00", end: "17:00" },
  Friday: { enabled: true, start: "09:00", end: "17:00" },
  Saturday: { enabled: false, start: "10:00", end: "14:00" },
  Sunday: { enabled: false, start: "10:00", end: "14:00" },
};

export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = React.useState<TabName>("Overview");
  const [availability, setAvailability] =
    React.useState<Availability>(initialAvailability);
  const handleLogout = React.useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/signin/provider";
  }, []);

  const {
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
  } = useProviderDashboardData();

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

  const earningsSnapshot = React.useMemo(
    () => buildEarningsSnapshot(payments),
    [payments],
  );

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
          <DashboardHeader
            loading={loading}
            onLogout={handleLogout}
            profile={profile}
            profileError={profileError}
          />
          <StatsGrid cards={topStats} loading={statsLoading} />
          <DashboardTabs
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={tabs}
          />

          {activeTab === "Overview" ? (
            <OverviewTab
              recentActivity={recentActivity}
              stats={stats}
              statsLoading={statsLoading}
            />
          ) : activeTab === "Quotes" ? (
            <QuotesTab requests={requests} statsLoading={statsLoading} />
          ) : activeTab === "Requests" ? (
            <RequestsTab
              acceptedRequests={acceptedRequests}
              requests={requests}
              statsLoading={statsLoading}
            />
          ) : activeTab === "Schedule" ? (
            <ScheduleTab
              availability={availability}
              bookings={bookings}
              setAvailability={setAvailability}
              statsLoading={statsLoading}
            />
          ) : activeTab === "Earnings" ? (
            <EarningsTab
              earningsSnapshot={earningsSnapshot}
              statsLoading={statsLoading}
            />
          ) : activeTab === "Profile" ? (
            <ProfileTab loading={loading} profile={profile} />
          ) : null}
        </div>
      </div>

      <FloatingActions />
    </section>
  );
}
