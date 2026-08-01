const API_URL = process.env.NEXT_PUBLIC_API_URL;



const USE_PROXY = false; // Set to false to disable proxy and use direct backend calls

function buildApiUrl(endpoint: string) {
  const normalizedEndpoint =
    API_URL?.endsWith("/api") && endpoint.startsWith("/api/")
      ? endpoint.slice("/api".length)
      : endpoint;

  return USE_PROXY ? `/api/proxy${normalizedEndpoint}` : `${API_URL}${normalizedEndpoint}`;
}







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







export type AuthTokenResponse = {
  token?: string;
  access_token?: string;
  user?: unknown;
};

export type UserMeResponse = {
  id?: string;
  homeownerProfile?: {
    fullName?: string;
    city?: string;
    address?: string;
    contactEmail?: string;
    contactPhone?: string;
  };
  providerProfile?: {
    id?: string;
    userId?: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    primaryService?: string;
    yearsExperience?: number;
    averageRating?: number;
  };
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







export async function apiRequest<T = unknown>(



  endpoint: string,



  options: ApiRequestOptions = {},



): Promise<T> {



  if (!API_URL) {



    throw new Error("Missing NEXT_PUBLIC_API_URL environment variable");



  }







  const { auth, headers, ...requestOptions } = options;



  const shouldSendAuth = auth ?? !endpoint.startsWith("/auth/");







  // Use proxy for cookie-based auth, otherwise use direct API calls



  const url = buildApiUrl(endpoint);



  



  // When using proxy, auth is handled by middleware via HttpOnly cookies



  // When not using proxy, fall back to localStorage (for backward compatibility)



  const token = !USE_PROXY ? localStorage.getItem("token") : null;







  const res = await fetch(url, {



    headers: {



      "Content-Type": "application/json",



      ...(headers || {}),



      ...(shouldSendAuth && !USE_PROXY && token ? { Authorization: `Bearer ${token}` } : {}),



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



  fullName?: string;



  phone?: string;



  email?: string;



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



  return apiRequest("/api/service-requests", {



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







export interface QuoteItem {
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



  quote?: QuoteItem;



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



  const quoteRaw = record.quote;



  const quote =



    quoteRaw && typeof quoteRaw === "object"



      ? {



          id: readString((quoteRaw as Record<string, unknown>).id),



          amount: typeof (quoteRaw as Record<string, unknown>).amount === "number"



            ? (quoteRaw as Record<string, unknown>).amount as number



            : undefined,



          description: readString((quoteRaw as Record<string, unknown>).description),



          estimatedDuration: readString((quoteRaw as Record<string, unknown>).estimatedDuration),



          materials: Array.isArray((quoteRaw as Record<string, unknown>).materials)



            ? (quoteRaw as Record<string, unknown>).materials as string[]



            : undefined,



          terms: readString((quoteRaw as Record<string, unknown>).terms),



          validUntil: readString((quoteRaw as Record<string, unknown>).validUntil),



          materialCost: typeof (quoteRaw as Record<string, unknown>).materialCost === "number"



            ? (quoteRaw as Record<string, unknown>).materialCost as number



            : undefined,



          laborCost: typeof (quoteRaw as Record<string, unknown>).laborCost === "number"



            ? (quoteRaw as Record<string, unknown>).laborCost as number



            : undefined,



          status: readString((quoteRaw as Record<string, unknown>).status),



          createdAt: readString((quoteRaw as Record<string, unknown>).createdAt),



        }



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



    quote,



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



  const response = await apiRequest<unknown>("/api/service-requests");



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



      `/api/service-requests?providerId=${encodeURIComponent(profileId)}`,






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



export interface SubmitQuotePayload {



  serviceRequestId: string;



  amount: number;



  description?: string;



  estimatedDuration?: string;



  materials?: string[];



}



export type QuoteStatus = "pending" | "accepted" | "rejected";

export const updateQuoteStatus = async (
  id: string,
  status: QuoteStatus,
): Promise<ServiceRequestItem | null> => {
  const response = await apiRequest<unknown>(
    `/api/quotes/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
  return mapServiceRequestFromApi(response);
};

export interface ApproveQuotePayload {
  quoteId: string;
  serviceRequestId: string;
  paymentMethod: string;
}

export interface ApproveQuoteResponse {
  success: boolean;
  bookingId?: string;
  paymentReference?: string;
  amount: number;
  serviceFee: number;
  totalAmount: number;
}

export const approveQuote = async (
  payload: ApproveQuotePayload,
): Promise<ApproveQuoteResponse> => {
  return apiRequest<ApproveQuoteResponse>("/api/quotes/approve", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export interface RejectQuotePayload {
  quoteId: string;
  serviceRequestId: string;
  reason?: string;
}

export const rejectQuote = async (
  payload: RejectQuotePayload,
): Promise<{ success: boolean }> => {
  return apiRequest<{ success: boolean }>("/api/quotes/reject", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const submitQuote = async (



  payload: SubmitQuotePayload,



): Promise<ServiceRequestItem | null> => {



  const response = await apiRequest<unknown>("/api/quotes", {



    method: "POST",



    body: JSON.stringify(payload),



  });







  return mapServiceRequestFromApi(response);



};







/**



 * Update a service request's status (e.g. provider accept/decline).



 * Maps to PATCH /service-requests/{id}/status.



 */



export const fetchServiceRequestById = async (
  id: string,
): Promise<ServiceRequestItem | null> => {
  const response = await apiRequest<unknown>(
    `/api/service-requests/${encodeURIComponent(id)}`,
  );
  return mapServiceRequestFromApi(response);
};

export const deleteServiceRequest = async (id: string): Promise<void> => {
  await apiRequest(`/api/service-requests/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};

export interface CreateBookingPayload {
  quoteId: string;
  serviceRequestId: string;
}

export interface BookingResponse {
  id: string;
  quoteId: string;
  serviceRequestId: string;
  status: string;
  createdAt: string;
}

export const createBooking = async (
  payload: CreateBookingPayload,
): Promise<BookingResponse> => {
  return apiRequest<BookingResponse>("/api/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export type EscrowStatus = "pending" | "funded" | "released" | "refunded";

export const updateBookingEscrow = async (
  id: string,
  escrowStatus: EscrowStatus,
): Promise<BookingResponse> => {
  return apiRequest<BookingResponse>(
    `/api/bookings/${encodeURIComponent(id)}/escrow`,
    {
      method: "PATCH",
      body: JSON.stringify({ escrowStatus }),
    },
  );
};

export interface InitializePaymentPayload {
  bookingId: string;
  amount: number;
  currency?: string;
  redirectUrl?: string;
}

export interface PaymentInitializeResponse {
  paymentUrl: string;
  reference: string;
  amount: number;
  shakaFee: number;
  totalAmount: number;
}

export const initializePayment = async (
  payload: InitializePaymentPayload,
): Promise<PaymentInitializeResponse> => {
  return apiRequest<PaymentInitializeResponse>("/api/payment/initialize", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export interface VerifyPaymentPayload {
  reference: string;
  transactionId?: string;
}

export interface PaymentVerifyResponse {
  status: "success" | "failed" | "pending";
  reference: string;
  amount: number;
  transactionId?: string;
}

export const verifyPayment = async (
  payload: VerifyPaymentPayload,
): Promise<PaymentVerifyResponse> => {
  return apiRequest<PaymentVerifyResponse>("/api/payment/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export interface PaymentWebhookPayload {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: string;
    transactionId?: string;
  };
}

export const processPaymentWebhook = async (
  payload: PaymentWebhookPayload,
): Promise<{ success: boolean }> => {
  return apiRequest<{ success: boolean }>("/api/payment/webhook", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateServiceRequestStatus = async (



  id: string,



  status: ServiceRequestStatus,



): Promise<ServiceRequestItem | null> => {



  const response = await apiRequest<unknown>(



    `/api/service-requests/${encodeURIComponent(id)}/status`,



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







function mapAdminCustomerFromApi(raw: unknown): AdminCustomer | null {



  if (!raw || typeof raw !== "object") return null;







  const record = raw as Record<string, unknown>;



  const id = readId(record.id) ?? readId(record._id);



  if (!id) return null;







  const fullName = readString(record.fullName);



  const firstName = readString(record.firstName);



  const lastName = readString(record.lastName);



  const name =



    fullName || [firstName, lastName].filter(Boolean).join(" ") || "Unknown";







  return { id, name, bookings: 0 };



}







function mapAdminProviderFromApi(raw: unknown): AdminProvider | null {



  if (!raw || typeof raw !== "object") return null;







  const record = raw as Record<string, unknown>;



  const id = readId(record.id) ?? readId(record._id);



  if (!id) return null;







  const firstName = readString(record.firstName);



  const lastName = readString(record.lastName);



  const businessName = readString(record.businessName);



  const name =



    [firstName, lastName].filter(Boolean).join(" ") || businessName || "Unknown";



  const rating =



    typeof record.averageRating === "number" ? record.averageRating : 0;







  return { id, name, rating, jobs: 0 };



}







function formatServiceRequestPersonName(



  person?: ServiceRequestHomeowner | ServiceRequestProviderRef,



) {



  if (!person) return undefined;



  if ("fullName" in person && person.fullName) return person.fullName;



  const parts = [person.firstName, person.lastName].filter(Boolean);



  return parts.length > 0 ? parts.join(" ") : undefined;



}







export const fetchAdminSummaryStats = async (): Promise<AdminSummaryStats> => {



  try {



    const [users, providers, serviceRequestsResponse] = await Promise.all([



      apiRequest<unknown[]>("/users"),



      apiRequest<unknown[]>("/providers"),



      apiRequest<unknown>("/service-requests"),



    ]);







    const totalUsers = Array.isArray(users) ? users.length : 0;



    const activeProviders = Array.isArray(providers) ? providers.length : 0;



    const pendingApprovals = 0;



    const allRequests = unwrapServiceRequests(serviceRequestsResponse);



    const activeBookings = allRequests.filter(



      (r) => r.status === "in_progress" || r.status === "accepted",



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



    const serviceRequestsResponse = await apiRequest<unknown>("/service-requests");



    const allRequests = unwrapServiceRequests(serviceRequestsResponse);







    const totalTransactionVolume = 0;



    const platformFees = 0;



    const averageJobValue = 0;



    const completionRate =



      allRequests.length > 0



        ? (allRequests.filter((r) => r.status === "completed").length /



            allRequests.length) *



          100



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



    const serviceRequestsResponse = await apiRequest<unknown>("/service-requests");



    const allRequests = unwrapServiceRequests(serviceRequestsResponse);







    return allRequests.slice(0, 10).map((r) => ({



      id: r.id,



      service: r.service?.title || "Service",



      homeowner: formatServiceRequestPersonName(r.homeowner) || "Unknown",



      provider: formatServiceRequestPersonName(r.provider) || "Unassigned",



      date: r.preferredDate || "",



      amount: 0,



      status:



        r.status === "completed"



          ? "Completed"



          : r.status === "in_progress"



            ? "In Progress"



            : "Approved",



    }));



  } catch {



    return [];



  }



};







export const fetchProviderApprovals = async (): Promise<ProviderApproval[]> => {
  try {
    const response = await apiRequest<unknown>("/users/providers/approvals");
    const approvals = unwrapArrayResponse(response);

    return approvals
      .map((item) => {
        if (!item || typeof item !== "object") return null;

        const record = item as Record<string, unknown>;
        const id = readId(record.id) ?? readId(record._id);
        if (!id) return null;

        const providerApprovalStatus = readString(record.providerApprovalStatus);
        if (providerApprovalStatus !== "pending") return null;

        const firstName = readString(record.firstName);
        const lastName = readString(record.lastName);
        const businessName = readString(record.businessName);
        const name =
          [firstName, lastName].filter(Boolean).join(" ") || businessName || "Unknown";

        const primaryService = readString(record.primaryService) || "General";

        const user = record.user as Record<string, unknown> | undefined;
        const phone = readString(user?.phone) || readString(record.phone) || readString(record.contactPhone) || "N/A";

        const serviceArea = readString(record.serviceArea) || "N/A";
        const yearsExperience =
          typeof record.yearsExperience === "number" ? record.yearsExperience : 0;

        const createdAt = readString(record.createdAt) || readString(record.created_at);
        const appliedDate = createdAt ? new Date(createdAt).toLocaleDateString() : "Unknown";

        return {
          id,
          name,
          service: primaryService,
          phone,
          location: serviceArea,
          yearsExperience,
          appliedDate,
        };
      })
      .filter((item): item is ProviderApproval => item !== null);
  } catch (error) {
    console.error("[API] Failed to fetch provider approvals:", error);
    return [];
  }
};

export const approveProvider = async (id: string): Promise<void> => {
  await apiRequest(`/users/providers/approvals/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ providerApprovalStatus: "approved" }),
  });
};

export const rejectProvider = async (id: string): Promise<void> => {
  await apiRequest(`/users/providers/approvals/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ providerApprovalStatus: "rejected" }),
  });
};

export interface ProviderAvailability {
  isAvailable: boolean;
  status: "active" | "suspended" | "pending";
}

export const updateProviderAvailability = async (
  isAvailable: boolean,
): Promise<ProviderAvailability> => {
  const status: ProviderAvailability["status"] = isAvailable
    ? "active"
    : "suspended";

  return apiRequest<ProviderAvailability>("/api/v1/provider/profile/status", {
    method: "PATCH",
    body: JSON.stringify({ isAvailable, status }),
  });
};

export interface WeeklyAvailability {
  [day: string]: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export const updateWeeklyAvailability = async (
  availability: WeeklyAvailability,
): Promise<void> => {
  await apiRequest("/api/v1/provider/profile/status", {
    method: "PATCH",
    body: JSON.stringify({ availability }),
  });
};

const shouldSendAuth = true;

const uploadProfileImageInternal = async (
  file: File,
  options: { checkApiUrl: boolean; useAuthGuard: boolean; endpoint: string }
): Promise<{ profileImageUrl?: string }> => {
  const formData = new FormData();
  formData.append("image", file);

  if (options.checkApiUrl && !API_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_URL environment variable");
  }

  const token = !USE_PROXY ? localStorage.getItem("token") : null;
  const url = buildApiUrl(options.endpoint);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...(options.useAuthGuard && shouldSendAuth && !USE_PROXY && token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!options.useAuthGuard && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Upload failed with status ${res.status}`);
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Upload succeeded but response was not valid JSON");
  }

  if (data.profileImageUrl) {
    return { profileImageUrl: data.profileImageUrl };
  }
  throw new Error("Upload succeeded but no profile image URL was returned");
};

export const uploadProfilePicture = async (file: File): Promise<{ url?: string }> => {
  const result = await uploadProfileImageInternal(file, { checkApiUrl: true, useAuthGuard: true, endpoint: "/api/v1/provider/profile-image" });
  return { url: result.profileImageUrl };
};

export const uploadPortfolioImage = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append("file", file);

  if (!API_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_URL environment variable");
  }

  const token = !USE_PROXY ? localStorage.getItem("token") : null;
  const url = buildApiUrl("/api/v1/provider/portfolio");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...(shouldSendAuth && !USE_PROXY && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Upload failed with status ${res.status}`);
  }

  return res.json();
};

export interface PaymentMethod {
  id: string;
  type: "mobile_money" | "bank_account" | "card";
  provider?: string;
  accountNumber?: string;
  accountName?: string;
  isDefault: boolean;
}

export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  return apiRequest<PaymentMethod[]>("/providers/payment-methods");
};

export interface AddPaymentMethodPayload {
  type: "mobile_money" | "bank_account" | "card";
  provider?: string;
  accountNumber: string;
  accountName: string;
}

export const addPaymentMethod = async (
  payload: AddPaymentMethodPayload,
): Promise<PaymentMethod> => {
  return apiRequest<PaymentMethod>("/providers/payment-methods", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const deletePaymentMethod = async (id: string): Promise<void> => {
  await apiRequest(`/providers/payment-methods/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};

export const setDefaultPaymentMethod = async (id: string): Promise<void> => {
  await apiRequest(`/providers/payment-methods/${encodeURIComponent(id)}/default`, {
    method: "PATCH",
  });
};

export interface PaymentTransaction {
  id: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  createdAt: string;
  homeowner?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
  };
  bookingId?: string;
  serviceRequestId?: string;
}

interface PaymentHistoryBooking {
  id: string;
  amount?: number;
  escrowStatus?: EscrowStatus | string;
  scheduledAt?: string;
  createdAt?: string;
  serviceRequestId?: string;
}

interface PaymentHistoryServiceRequest {
  id: string;
  homeowner?: ServiceRequestHomeowner;
}

export const fetchPaymentHistory = async (): Promise<PaymentTransaction[]> => {
  try {
    const bookingsResponse = await apiRequest<unknown>("/api/bookings");
    const bookings = unwrapArrayResponse<PaymentHistoryBooking>(bookingsResponse);
    
    // Fetch service requests to get homeowner information
    let serviceRequestsData: PaymentHistoryServiceRequest[] = [];
    try {
      const serviceRequestsResponse = await apiRequest<unknown>("/api/service-requests");
      serviceRequestsData = unwrapArrayResponse<PaymentHistoryServiceRequest>(serviceRequestsResponse);
    } catch {
      // Continue without homeowner data if service requests fail
    }
    
    // Create a map of serviceRequestId to homeowner data
    const homeownerMap = new Map<string, ServiceRequestHomeowner>();
    serviceRequestsData.forEach((sr) => {
      if (sr.id && sr.homeowner) {
        homeownerMap.set(sr.id, sr.homeowner);
      }
    });
    
    // Transform bookings into payment transactions with homeowner data
    return bookings.map((booking) => {
      const homeowner = booking.serviceRequestId ? homeownerMap.get(booking.serviceRequestId) : null;
      return {
        id: booking.id,
        amount: booking.amount || 0,
        status: booking.escrowStatus === "released" ? "completed" : 
                booking.escrowStatus === "pending" ? "pending" : "failed",
        createdAt: booking.scheduledAt || booking.createdAt || "",
        bookingId: booking.id,
        serviceRequestId: booking.serviceRequestId,
        homeowner: homeowner ? {
          firstName: homeowner.firstName,
          lastName: homeowner.lastName,
          fullName: homeowner.fullName,
        } : undefined,
      };
    });
  } catch {
    return [];
  }
};







export const fetchAdminCustomers = async (): Promise<AdminCustomer[]> => {



  try {



    const homeowners = await apiRequest<unknown[]>("/homeowners");



    const allHomeowners = Array.isArray(homeowners) ? homeowners : [];







    return allHomeowners



      .slice(0, 10)



      .map(mapAdminCustomerFromApi)



      .filter((customer): customer is AdminCustomer => customer !== null);



  } catch {



    return [];



  }



};







export const fetchAdminProviders = async (): Promise<AdminProvider[]> => {



  try {



    const providers = await apiRequest<unknown[]>("/providers");



    const allProviders = Array.isArray(providers) ? providers : [];







    return allProviders



      .slice(0, 10)



      .map(mapAdminProviderFromApi)



      .filter((provider): provider is AdminProvider => provider !== null);



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



export interface UpdateHomeownerProfilePayload {
  fullName?: string;
  city?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  ownerStats?: {
    upcomingBookings?: number;
    jobsInProgress?: number;
    completedJobs?: number;
    totalAmountSpent?: number;
  };
}

export const updateHomeownerProfile = async (
  payload: UpdateHomeownerProfilePayload,
): Promise<UserMeResponse> => {
  return apiRequest<UserMeResponse>("/api/homeowners", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateHomeownerProfileImage = async (imageFile: File): Promise<{ success: boolean; imageUrl?: string }> => {
  try {
    const result = await uploadProfileImageInternal(imageFile, { checkApiUrl: false, useAuthGuard: false, endpoint: "/api/v1/homeowner/profile-image" });
    return { success: true, imageUrl: result.profileImageUrl };
  } catch {
    return { success: false };
  }
};

export const updateProviderProfileImage = async (imageFile: File): Promise<{ success: boolean; imageUrl?: string }> => {
  try {
    const result = await uploadProfileImageInternal(imageFile, { checkApiUrl: false, useAuthGuard: false, endpoint: "/api/v1/provider/profile-image" });
    return { success: true, imageUrl: result.profileImageUrl };
  } catch {
    return { success: false };
  }
};

export interface RescheduleBookingPayload {

  bookingId: string;

  newScheduledAt: string;

  reason?: string;

}

export const rescheduleBooking = async (

  payload: RescheduleBookingPayload,

): Promise<BookingResponse> => {

  return apiRequest<BookingResponse>(`/api/bookings/${encodeURIComponent(payload.bookingId)}/reschedule`, {

    method: "PATCH",

    body: JSON.stringify({

      newScheduledAt: payload.newScheduledAt,

      reason: payload.reason,

    }),

  });

};

export const cancelBooking = async (bookingId: string): Promise<{ success: boolean }> => {

  return apiRequest<{ success: boolean }>(`/api/bookings/${encodeURIComponent(bookingId)}/cancel`, {

    method: "PATCH",

    body: JSON.stringify({ status: "cancelled" }),

  });

};

export const cancelServiceRequest = async (serviceRequestId: string): Promise<{ success: boolean }> => {

  return apiRequest<{ success: boolean }>(`/api/service-requests/${encodeURIComponent(serviceRequestId)}/cancel`, {

    method: "PATCH",

    body: JSON.stringify({ status: "cancelled" }),

  });

};

