"use client";

import React from "react";
import DashboardHeader from "./admin-dashboard/DashboardHeader";
import DashboardTabs from "./admin-dashboard/DashboardTabs";
import EmptyTab from "./admin-dashboard/EmptyTab";
import OverviewTab from "./admin-dashboard/OverviewTab";
import StatsGrid from "./admin-dashboard/StatsGrid";
import {
  platformStats,
  recentBookings,
  summaryStats,
} from "./admin-dashboard/mockData";
import type { AdminTabName } from "./admin-dashboard/types";

const adminTabs: Array<{
  name: AdminTabName;
  badge?: number;
  badgeClass?: string;
}> = [
  { name: "Overview" },
  { name: "Provider Approvals", badge: summaryStats.pendingApprovals },
  { name: "All Bookings" },
  { name: "Users" },
  { name: "Disputes", badge: 1, badgeClass: "bg-[#fb2c36]" },
  { name: "Analytics" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = React.useState<AdminTabName>("Overview");

  const handleLogout = React.useCallback(() => {
    sessionStorage.removeItem("admin_session");
    window.location.href = "/signin/admin";
  }, []);

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
        ) : (
          <EmptyTab label={activeTab} />
        )}
      </div>
    </section>
  );
}
