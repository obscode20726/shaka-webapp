import type {
  AdminSummaryStats,
  PlatformStats,
  RecentBooking,
} from "./types";

export const summaryStats: AdminSummaryStats = {
  totalUsers: 1247,
  activeProviders: 342,
  pendingApprovals: 4,
  activeBookings: 89,
  platformRevenue: 6225,
};

export const recentBookings: RecentBooking[] = [
  {
    id: "1",
    service: "Plumbing",
    homeowner: "Alice Marie",
    provider: "Jean Baptiste",
    date: "2025-02-06",
    amount: 85000,
    status: "Approved",
  },
  {
    id: "2",
    service: "Plumbing",
    homeowner: "Bob Johnson",
    provider: "Marie Uwase",
    date: "2025-02-07",
    amount: 45000,
    status: "In Progress",
  },
  {
    id: "3",
    service: "Cleaning",
    homeowner: "Carol Davis",
    provider: "Patrick Nkunda",
    date: "2025-02-05",
    amount: 25000,
    status: "Completed",
  },
];

export const platformStats: PlatformStats = {
  totalTransactionVolume: 124500,
  platformFees: 6225,
  averageJobValue: 51667,
  completionRate: 94,
  customerSatisfaction: 4.7,
};
