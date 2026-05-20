import type {
  AdminCustomer,
  AdminDispute,
  AdminProvider,
  AdminSummaryStats,
  PlatformStats,
  ProviderApproval,
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

export const providerApprovals: ProviderApproval[] = [
  {
    id: "emmanuel-niyonzima",
    name: "Emmanuel Niyonzima",
    service: "Plumbing",
    phone: "+250 788 123 456",
    location: "Kigali, Gasabo",
    yearsExperience: 5,
    appliedDate: "2025-05-05",
  },
  {
    id: "grace-uwamahoro",
    name: "Grace Uwamahoro",
    service: "Cleaning",
    phone: "+250 788 234 567",
    location: "Kigali, Kicukiro",
    yearsExperience: 3,
    appliedDate: "2025-05-06",
  },
  {
    id: "daniel-habimana",
    name: "Daniel Habimana",
    service: "Gardening",
    phone: "+250 788 345 678",
    location: "Kigali, Nyarugenge",
    yearsExperience: 7,
    appliedDate: "2025-05-06",
  },
  {
    id: "sarah-mukamana",
    name: "Sarah Mukamana",
    service: "Painting",
    phone: "+250 788 456 789",
    location: "Kigali, Gasabo",
    yearsExperience: 4,
    appliedDate: "2025-05-07",
  },
];

export const recentCustomers: AdminCustomer[] = [
  { id: "alice-marie", name: "Alice Marie", bookings: 1 },
  { id: "bob-johnson", name: "Bob Johnson", bookings: 2 },
  { id: "carol-davis", name: "Carol Davis", bookings: 3 },
  { id: "david-wilson", name: "David Wilson", bookings: 4 },
];

export const topProviders: AdminProvider[] = [
  { id: "jean-baptiste", name: "Jean Baptiste", rating: 4.9, jobs: 12 },
  { id: "marie-uwase", name: "Marie Uwase", rating: 4.8, jobs: 11 },
  { id: "patrick-nkunda", name: "Patrick Nkunda", rating: 4.7, jobs: 10 },
  { id: "grace-mukamana", name: "Grace Mukamana", rating: 4.6, jobs: 9 },
];

export const disputes: AdminDispute[] = [
  {
    id: "booking-b1",
    bookingId: "Booking #b1",
    customer: "Alice Marie",
    provider: "Jean Baptiste",
    reason: "Work not completed as agreed",
    filedDate: "2025-02-07",
    status: "Pending Review",
  },
];
