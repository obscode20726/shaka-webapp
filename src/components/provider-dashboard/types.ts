export type TabName =
  | "Quotes"
  | "Overview"
  | "Requests"
  | "Schedule"
  | "Earnings"
  | "Profile";

export type ProviderProfile = {
  id?: string;
  userId?: string;
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
  preferredTime?: string;
  city: string;
  address?: string;
  providerId?: string;
  homeownerId?: string;
  service?: {
    title: string;
    slug: string;
  };
  priority?: string;
  homeowner?: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    contactPhone?: string;
    averageRating?: number;
  };
};

export type Booking = {
  id: string;
  scheduledAt: string;
  escrowStatus: string;
  amount?: number;
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
  lastMonthEarnings: number;
  yearToDateEarnings: number;
  averageJobValue: number;
  rating: number;
  jobsCompleted: number;
  responseRate: string;
};

export type Availability = Record<
  string,
  { enabled: boolean; start: string; end: string }
>;
