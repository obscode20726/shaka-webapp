export type TabName =
  | "Quotes"
  | "Overview"
  | "Requests"
  | "Schedule"
  | "Earnings"
  | "Profile";

export type ProviderProfile = {
  firstName: string;
  lastName: string;
  businessName?: string;
  primaryService?: string;
  yearsExperience?: number;
  averageRating?: number;
};

export type ServiceRequest = {
  id: string;
  status: string;
  description: string;
  preferredDate: string;
  city: string;
  service: {
    title: string;
    slug: string;
  };
  homeownerId: string;
};

export type Booking = {
  id: string;
  scheduledAt: string;
  escrowStatus: string;
};

export type RecentActivityItem = {
  customer: string;
  service: string;
  amount: string;
  status: "pending" | "accepted" | "completed";
};

export type Payment = {
  id?: string;
  amount?: number;
  status?: string;
  createdAt?: string;
  homeowner?: {
    firstName?: string;
    lastName?: string;
  };
  homeownerName?: string;
};

export type DashboardStats = {
  newRequests: number;
  upcomingJobs: number;
  monthlyEarnings: number;
  rating: number;
  jobsCompleted: number;
  responseRate: string;
};

export type Availability = Record<
  string,
  { enabled: boolean; start: string; end: string }
>;
