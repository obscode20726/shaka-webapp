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

export type ProviderApproval = {
  id: string;
  name: string;
  service: string;
  phone: string;
  location: string;
  yearsExperience: number;
  appliedDate: string;
};

export type AdminCustomer = {
  id: string;
  name: string;
  bookings: number;
};

export type AdminProvider = {
  id: string;
  name: string;
  rating: number;
  jobs: number;
};

export type AdminDispute = {
  id: string;
  bookingId: string;
  customer: string;
  provider: string;
  reason: string;
  filedDate: string;
  status: "Pending Review";
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
