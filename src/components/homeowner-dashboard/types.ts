export type HomeownerProfile = {
  fullName?: string;
  city?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  profileImageUrl?: string;
};

export type Quote = {
  id?: string;
  amount?: number;
  description?: string;
  estimatedDuration?: string;
  materials?: string[];
  terms?: string;
  validUntil?: string;
  materialCost?: number;
  laborCost?: number;
  status?: string;
  createdAt?: string;
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
  provider?: {
    firstName: string;
    lastName: string;
    businessName?: string;
    phone?: string;
    contactPhone?: string;
    profileImageUrl?: string;
    user?: {
      phone?: string;
    };
  };
  quote?: Quote;
};

export type Booking = {
  id: string;
  scheduledAt: string;
  escrowStatus: string;
  provider?: {
    firstName: string;
    lastName: string;
    businessName?: string;
    phone?: string;
    contactPhone?: string;
    profileImageUrl?: string;
    user?: {
      phone?: string;
    };
  };
  serviceRequest?: ServiceRequest;
};

export type Payment = {
  id?: string;
  amount?: number;
  status?: string;
  createdAt?: string;
  provider?: {
    firstName?: string;
    lastName?: string;
    businessName?: string;
  };
  providerName?: string;
  service?: {
    title?: string;
  };
  serviceRequest?: ServiceRequest;
};

export type HomeownerStats = {
  upcoming: number;
  inProgress: number;
  completed: number;
  totalSpent: number;
};

export type HomeownerTab = "Quotes" | "Bookings" | "Favorites" | "Payments" | "Settings";
