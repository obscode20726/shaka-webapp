"use client";

import React from "react";
import BookingsTab from "./homeowner-dashboard/BookingsTab";
import BookingFlow from "./homeowner-dashboard/BookingFlow";
import DashboardHeader from "./homeowner-dashboard/DashboardHeader";
import DashboardTabs, {
  homeownerTabs,
} from "./homeowner-dashboard/DashboardTabs";
import EmptyTab from "./homeowner-dashboard/EmptyTab";
import FavoritesTab from "./homeowner-dashboard/FavoritesTab";
import PaymentsTab from "./homeowner-dashboard/PaymentsTab";
import QuotesTab from "./homeowner-dashboard/QuotesTab";
import SettingsTab from "./homeowner-dashboard/SettingsTab";
import StatsGrid from "./homeowner-dashboard/StatsGrid";
import { useHomeownerDashboardData } from "./homeowner-dashboard/useHomeownerDashboardData";

export default function HomeownerDashboard() {
  const [activeTab, setActiveTab] = React.useState(0);
  const [isBookingFlowOpen, setIsBookingFlowOpen] = React.useState(false);
  const handleLogout = React.useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/signin/homeowner";
  }, []);

  const {
    bookings,
    loading,
    payments,
    profile,
    profileError,
    requests,
    stats,
    statsLoading,
  } = useHomeownerDashboardData();

  if (isBookingFlowOpen) {
    return (
      <BookingFlow onBackToDashboard={() => setIsBookingFlowOpen(false)} />
    );
  }

  return (
    <section className="min-h-screen bg-[#f3f4f6] py-6 sm:py-10">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6">
        <div className="rounded-2xl border border-black/[.07] bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-6">
          <DashboardHeader
            loading={loading}
            onBookService={() => setIsBookingFlowOpen(true)}
            onLogout={handleLogout}
            profile={profile}
            profileError={profileError}
          />

          <StatsGrid stats={stats} statsLoading={statsLoading} />
          <DashboardTabs activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === 0 ? (
            <QuotesTab requests={requests} statsLoading={statsLoading} />
          ) : activeTab === 1 ? (
            <BookingsTab
              bookings={bookings}
              requests={requests}
              statsLoading={statsLoading}
            />
          ) : activeTab === 2 ? (
            <FavoritesTab requests={requests} statsLoading={statsLoading} />
          ) : activeTab === 3 ? (
            <PaymentsTab payments={payments} statsLoading={statsLoading} />
          ) : activeTab === 4 ? (
            <SettingsTab loading={loading} profile={profile} />
          ) : (
            <EmptyTab label={homeownerTabs[activeTab]} />
          )}
        </div>
      </div>
    </section>
  );
}
