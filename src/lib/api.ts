const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ApiRequestOptions = RequestInit & {
  auth?: boolean;
};

type ErrorBody = {
  detail?: unknown;
  details?: unknown;
  error?: unknown;
  errors?: Record<string, unknown>;
  message?: unknown;
};

function friendlyServerError(endpoint: string) {
  if (endpoint === "/auth/signup" || endpoint === "/auth/resend-signup-otp") {
    return "The account was submitted, but the server could not send the verification email. Please try again later or contact support.";
  }

  if (endpoint === "/auth/forgot-password") {
    return "We could not send the verification code to your email. Please try again later or contact support.";
  }

  if (endpoint === "/auth/reset-password") {
    return "Could not reset your password. Please check your verification code and try again.";
  }

  return "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_URL environment variable");
  }

  const { auth, headers, ...requestOptions } = options;
  const shouldSendAuth = auth ?? !endpoint.startsWith("/auth/");
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
      ...(shouldSendAuth && token && {
        Authorization: `Bearer ${token}`,
      }),
    },
    ...requestOptions,
  });

  const text = await res.text();
  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const body = typeof data === "object" && data ? (data as ErrorBody) : null;
    const msg = body?.message ?? body?.detail;
    const detail =
      Array.isArray(msg) ? msg.join(". ") : typeof msg === "string" ? msg : "";
    const detailList =
      Array.isArray(body?.details) || Array.isArray(body?.detail)
        ? ((body?.details ?? body?.detail) as unknown[]).join(". ")
        : "";
    const errors =
      body?.errors && typeof body.errors === "object"
        ? Object.entries(body.errors)
            .map(([key, value]) =>
              `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`,
            )
            .join("; ")
        : "";
    const error = typeof body?.error === "string" ? body.error : "";
    const fallback = typeof data === "string" ? data : "";
    const serverHint = res.status >= 500 ? friendlyServerError(endpoint) : "";
    const combined = (
      serverHint
        ? [serverHint]
        : [detail, detailList, errors, error, fallback]
    )
      .filter(Boolean)
      .join(" - ");

    throw new Error(combined || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const providerLogin = async (data: {
  email: string;
  password: string;
}) => {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
    auth: false,
  });
};

/**
 * Admin login using the regular /auth/login endpoint
 * Backend validates admin role and only returns token if user has admin privileges
 * @param credentials - Admin phone and password
 * @returns Token and user data with admin role
 */
export const adminLogin = async (credentials: {
  phone: string;
  password: string;
}) => {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
    auth: false,
  });
};

export interface Service {
  id: string;
  slug: string;
  title: string;
  description?: string;
  iconPath?: string;
}

export interface ProviderProfile {
  id: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  primaryService: string;
  yearsExperience?: number;
  serviceArea?: string;
  serviceDescription?: string;
  averageRating?: number;
  totalReviews?: number;
}

export const fetchServices = async (): Promise<Service[]> => {
  const response = await apiRequest<Service[]>("/services", { auth: false });
  return Array.isArray(response) ? response : [];
};

export const fetchProviders = async (): Promise<ProviderProfile[]> => {
  const response = await apiRequest<ProviderProfile[]>("/providers", {
    auth: false,
  });
  return Array.isArray(response) ? response : [];
};

/**
 * Create a service request (booking)
 * @param request - Service request data from booking form
 * @returns Created service request with ID
 */
export interface CreateServiceRequestPayload {
  serviceId: string;
  providerId?: string;
  city: string;
  address?: string;
  preferredDate: string;
  preferredTime: string;
  description: string;
}

export interface ServiceRequestResponse {
  id: string;
  homeownerId: string;
  serviceId: string;
  providerId?: string;
  city: string;
  address?: string;
  preferredDate: string;
  preferredTime?: string;
  description: string;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export const createServiceRequest = async (
  payload: CreateServiceRequestPayload,
): Promise<ServiceRequestResponse> => {
  return apiRequest("/service-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export interface ServiceRequestHomeowner {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  contactPhone?: string;
  averageRating?: number;
}

export interface ServiceRequestProviderRef {
  id?: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
}

export interface ServiceRequestItem {
  id: string;
  status: string;
  description: string;
  preferredDate: string;
  preferredTime?: string;
  city: string;
  address?: string;
  providerId?: string;
  homeownerId?: string;
  priority?: string;
  service?: {
    title: string;
    slug: string;
  };
  homeowner?: ServiceRequestHomeowner;
  provider?: ServiceRequestProviderRef;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function readId(value: unknown) {
  if (typeof value === "string" && value.length > 0) return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

/** Unwrap list responses whether the API returns a bare array or `{ data: [...] }`. */
export function unwrapArrayResponse<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];

  if (response && typeof response === "object") {
    const record = response as Record<string, unknown>;
    const keys = [
      "data",
      "items",
      "results",
      "bookings",
      "payments",
      "serviceRequests",
      "service_requests",
      "requests",
    ];

    for (const key of keys) {
      const value = record[key];
      if (Array.isArray(value)) return value as T[];
    }
  }

  return [];
}

function mapServiceRequestFromApi(raw: unknown): ServiceRequestItem | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const id = readId(record.id) ?? readId(record._id);
  if (!id) return null;

  const serviceRaw = record.service;
  const service =
    serviceRaw && typeof serviceRaw === "object"
      ? {
          title: readString((serviceRaw as Record<string, unknown>).title) || "Service",
          slug: readString((serviceRaw as Record<string, unknown>).slug) || "",
        }
      : undefined;

  const homeownerRaw = record.homeowner ?? record.homeownerProfile;
  const homeowner =
    homeownerRaw && typeof homeownerRaw === "object"
      ? (homeownerRaw as ServiceRequestHomeowner)
      : undefined;

  const providerRaw = record.provider ?? record.providerProfile;
  const provider =
    providerRaw && typeof providerRaw === "object"
      ? (providerRaw as ServiceRequestProviderRef)
      : undefined;

  const providerId =
    readString(record.providerId) ??
    readString(record.provider_id) ??
    provider?.id;

  return {
    id,
    status: readString(record.status) || "pending",
    description: readString(record.description) || "",
    preferredDate:
      readString(record.preferredDate) ??
      readString(record.preferred_date) ??
      "",
    preferredTime:
      readString(record.preferredTime) ?? readString(record.preferred_time),
    city: readString(record.city) || "",
    address: readString(record.address),
    providerId,
    homeownerId:
      readString(record.homeownerId) ?? readString(record.homeowner_id),
    priority: readString(record.priority) ?? "normal",
    service,
    homeowner,
    provider,
  };
}

function mapServiceRequestList(items: unknown[]): ServiceRequestItem[] {
  return items
    .map(mapServiceRequestFromApi)
    .filter((item): item is ServiceRequestItem => item !== null);
}

function unwrapServiceRequests(response: unknown): ServiceRequestItem[] {
  if (Array.isArray(response)) {
    return mapServiceRequestList(response);
  }

  if (response && typeof response === "object") {
    const record = response as Record<string, unknown>;
    const keys = [
      "data",
      "serviceRequests",
      "service_requests",
      "items",
      "requests",
      "assignedRequests",
      "providerServiceRequests",
      "results",
    ];

    for (const key of keys) {
      const value = record[key];
      if (Array.isArray(value)) {
        return mapServiceRequestList(value);
      }
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const nested = unwrapServiceRequests(value);
        if (nested.length > 0) return nested;
      }
    }
  }

  return [];
}

function dedupeServiceRequests(requests: ServiceRequestItem[]) {
  const seen = new Set<string>();
  return requests.filter((request) => {
    if (seen.has(request.id)) return false;
    seen.add(request.id);
    return true;
  });
}

/**
 * List service requests for the authenticated user.
 * Homeowners see their own requests; providers see requests assigned to them.
 */
export const fetchServiceRequests = async (): Promise<ServiceRequestItem[]> => {
  const response = await apiRequest<unknown>("/service-requests");
  return unwrapServiceRequests(response);
};

export interface ProviderDashboardMetrics {
  provider_stats?: {
    new_requests_count?: number;
    upcoming_jobs_count?: number;
    revenue_this_month?: number;
    average_rating?: number;
    total_reviews?: number;
    total_bookings?: number;
  };
}

export const fetchProviderDashboardMetrics =
  async (): Promise<ProviderDashboardMetrics | null> => {
    try {
      return await apiRequest<ProviderDashboardMetrics>(
        "/v1/provider/dashboard/metrics",
      );
    } catch {
      return null;
    }
  };

function resolveProviderMatchIds(userProfile: {
  id?: string;
  providerProfile?: { id?: string; userId?: string };
}) {
  return new Set(
    [
      userProfile.providerProfile?.id,
      userProfile.providerProfile?.userId,
      userProfile.id,
    ].filter((value): value is string => Boolean(value)),
  );
}

function preferProviderAssignedRequests(
  requests: ServiceRequestItem[],
  matchIds: Set<string>,
) {
  if (requests.length === 0 || matchIds.size === 0) return requests;

  const assigned = requests.filter((request) => {
    const assignedId = request.providerId ?? request.provider?.id;
    return assignedId ? matchIds.has(assignedId) : false;
  });
  if (assigned.length > 0) return assigned;

  const unassigned = requests.filter(
    (request) => !(request.providerId ?? request.provider?.id),
  );
  if (unassigned.length > 0) return unassigned;

  return requests;
}

/**
 * Service requests for the provider dashboard — same endpoint as homeowners,
 * with provider ID resolution and fallbacks when the default list is empty.
 */
export const fetchServiceRequestsForProvider = async (): Promise<
  ServiceRequestItem[]
> => {
  const userProfile = await apiRequest<{
    id?: string;
    providerProfile?: { id?: string; userId?: string };
  }>("/users/me");

  const profileId = userProfile.providerProfile?.id;
  const matchIds = resolveProviderMatchIds(userProfile);
  const collected: ServiceRequestItem[] = [];

  try {
    collected.push(...(await fetchServiceRequests()));
  } catch {
    // Fall through to alternate endpoints.
  }

  if (profileId) {
    const fallbacks = [
      `/service-requests?providerId=${encodeURIComponent(profileId)}`,
      `/providers/${encodeURIComponent(profileId)}/service-requests`,
    ];

    for (const endpoint of fallbacks) {
      try {
        const response = await apiRequest<unknown>(endpoint);
        collected.push(...unwrapServiceRequests(response));
      } catch {
        // Try the next fallback shape.
      }
    }
  }

  return preferProviderAssignedRequests(
    dedupeServiceRequests(collected),
    matchIds,
  );
};

export type ServiceRequestStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

/**
 * Update a service request's status (e.g. provider accept/decline).
 * Maps to PATCH /service-requests/{id}/status.
 */
export const updateServiceRequestStatus = async (
  id: string,
  status: ServiceRequestStatus,
): Promise<ServiceRequestItem | null> => {
  const response = await apiRequest<unknown>(
    `/service-requests/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );

  return mapServiceRequestFromApi(response);
};

// Admin API functions

export interface AdminSummaryStats {
  totalUsers: number;
  activeProviders: number;
  pendingApprovals: number;
  activeBookings: number;
  platformRevenue: number;
}

export interface PlatformStats {
  totalTransactionVolume: number;
  platformFees: number;
  averageJobValue: number;
  completionRate: number;
  customerSatisfaction: number;
}

export interface RecentBooking {
  id: string;
  service: string;
  homeowner: string;
  provider: string;
  date: string;
  amount: number;
  status: "Approved" | "In Progress" | "Completed";
}

export interface ProviderApproval {
  id: string;
  name: string;
  service: string;
  phone: string;
  location: string;
  yearsExperience: number;
  appliedDate: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  bookings: number;
}

export interface AdminProvider {
  id: string;
  name: string;
  rating: number;
  jobs: number;
}

export interface AdminDispute {
  id: string;
  bookingId: string;
  customer: string;
  provider: string;
  reason: string;
  filedDate: string;
  status: "Pending Review";
}

export const fetchAdminSummaryStats = async (): Promise<AdminSummaryStats> => {
  try {
    const [users, providers, serviceRequests] = await Promise.all([
      apiRequest<unknown[]>("/users"),
      apiRequest<unknown[]>("/providers"),
      apiRequest<unknown[]>("/service-requests"),
    ]);

    const totalUsers = Array.isArray(users) ? users.length : 0;
    const allProviders = Array.isArray(providers) ? providers : [];
    const activeProviders = allProviders.length;
    const pendingApprovals = 0;
    const allRequests = Array.isArray(serviceRequests) ? serviceRequests : [];
    const activeBookings = allRequests.filter((r: any) => 
      r.status === "in_progress" || r.status === "accepted"
    ).length;
    const platformRevenue = 0;

    return {
      totalUsers,
      activeProviders,
      pendingApprovals,
      activeBookings,
      platformRevenue,
    };
  } catch {
    return {
      totalUsers: 0,
      activeProviders: 0,
      pendingApprovals: 0,
      activeBookings: 0,
      platformRevenue: 0,
    };
  }
};

export const fetchAdminPlatformStats = async (): Promise<PlatformStats> => {
  try {
    const serviceRequests = await apiRequest<unknown[]>("/service-requests");
    const allRequests = Array.isArray(serviceRequests) ? serviceRequests : [];
    
    const totalTransactionVolume = 0;
    const platformFees = 0;
    const averageJobValue = 0;
    const completionRate = allRequests.length > 0 
      ? (allRequests.filter((r: any) => r.status === "completed").length / allRequests.length) * 100 
      : 0;
    const customerSatisfaction = 4.5;

    return {
      totalTransactionVolume,
      platformFees,
      averageJobValue,
      completionRate,
      customerSatisfaction,
    };
  } catch {
    return {
      totalTransactionVolume: 0,
      platformFees: 0,
      averageJobValue: 0,
      completionRate: 0,
      customerSatisfaction: 0,
    };
  }
};

export const fetchAdminRecentBookings = async (): Promise<RecentBooking[]> => {
  try {
    const serviceRequests = await apiRequest<unknown[]>("/service-requests");
    const allRequests = Array.isArray(serviceRequests) ? serviceRequests : [];
    
    return allRequests.slice(0, 10).map((r: any) => ({
      id: r.id || r._id || "",
      service: r.service?.title || "Service",
      homeowner: r.homeowner?.fullName || r.homeowner?.firstName + " " + r.homeowner?.lastName || "Unknown",
      provider: r.provider?.firstName + " " + r.provider?.lastName || "Unassigned",
      date: r.preferredDate || r.createdAt || "",
      amount: 0,
      status: r.status === "completed" ? "Completed" : 
              r.status === "in_progress" ? "In Progress" : 
              r.status === "accepted" ? "Approved" : "Approved",
    }));
  } catch {
    return [];
  }
};

export const fetchProviderApprovals = async (): Promise<ProviderApproval[]> => {
  try {
    const providers = await apiRequest<unknown[]>("/providers");
    const allProviders = Array.isArray(providers) ? providers : [];
    
    return [];
  } catch {
    return [];
  }
};

export const fetchAdminCustomers = async (): Promise<AdminCustomer[]> => {
  try {
    const homeowners = await apiRequest<unknown[]>("/homeowners");
    const allHomeowners = Array.isArray(homeowners) ? homeowners : [];
    
    return allHomeowners.slice(0, 10).map((h: any) => ({
      id: h.id || h._id || "",
      name: h.fullName || h.firstName + " " + h.lastName || "Unknown",
      bookings: 0,
    }));
  } catch {
    return [];
  }
};

export const fetchAdminProviders = async (): Promise<AdminProvider[]> => {
  try {
    const providers = await apiRequest<unknown[]>("/providers");
    const allProviders = Array.isArray(providers) ? providers : [];
    
    return allProviders.slice(0, 10).map((p: any) => ({
      id: p.id || p._id || "",
      name: p.firstName + " " + p.lastName || p.businessName || "Unknown",
      rating: p.averageRating || 0,
      jobs: 0,
    }));
  } catch {
    return [];
  }
};

export const fetchAdminDisputes = async (): Promise<AdminDispute[]> => {
  try {
    return [];
  } catch {
    return [];
  }
};
