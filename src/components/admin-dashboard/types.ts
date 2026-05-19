export type AdminTabName =
  | "Overview"
  | "Provider Approvals"
  | "All Bookings"
  | "Users"
  | "Disputes"
  | "Analytics";

export type BookingStatus = "Approved" | "In Progress" | "Completed";

export type RecentBooking = {
  id: string;
  service: string;
  homeowner: string;
  provider: string;
  date: string;
  amount: number;
  status: BookingStatus;
};

export type PlatformStats = {
  totalTransactionVolume: number;
  platformFees: number;
  averageJobValue: number;
  completionRate: number;
  customerSatisfaction: number;
};

export type AdminSummaryStats = {
  totalUsers: number;
  activeProviders: number;
  pendingApprovals: number;
  activeBookings: number;
  platformRevenue: number;
};
