import type { Payment, ServiceRequest } from "./types";

export function normalizeRequestStatus(status?: string) {
  if (!status) return "pending";
  const normalized = status.toLowerCase().replace(/_/g, "-");
  return normalized === "cancelled" ? "canceled" : normalized;
}

export function isPendingRequest(status?: string) {
  const normalized = normalizeRequestStatus(status);
  return (
    normalized === "pending" ||
    normalized === "open" ||
    normalized === "new" ||
    normalized === "awaiting" ||
    normalized === "awaiting-quote"
  );
}

export function isActiveRequest(status?: string) {
  const normalized = normalizeRequestStatus(status);
  return (
    normalized === "accepted" ||
    normalized === "in-progress" ||
    normalized === "scheduled" ||
    normalized === "active"
  );
}

/** Requests that belong on the provider Requests tab (not completed/canceled). */
export function isProviderVisibleRequest(status?: string) {
  return isPendingRequest(status) || isActiveRequest(status);
}

export function isCompletedRequest(status: string) {
  return normalizeRequestStatus(status) === "completed";
}

export function isCanceledRequest(status: string) {
  return normalizeRequestStatus(status) === "canceled";
}

export function parseHomeownerName(
  homeowner?: ServiceRequest["homeowner"],
) {
  const fullName = homeowner?.fullName?.trim();
  if (fullName) return fullName;

  const name = `${homeowner?.firstName || ""} ${homeowner?.lastName || ""}`.trim();
  return name || "Customer";
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("rw-RW", {
    style: "currency",
    currency: "RWF",
  }).format(amount);
}

export function formatMoney(amount: number) {
  if (!Number.isFinite(amount)) return "-";
  return `$${Math.round(amount)}`;
}

export function formatShortDate(iso?: string) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toISOString().slice(0, 10);
}

export function formatRequestTime(
  preferredDate?: string,
  preferredTime?: string,
) {
  if (preferredTime?.trim()) return preferredTime.trim();

  if (!preferredDate) return "-";
  const date = new Date(preferredDate);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatRequestLocation(request: {
  address?: string;
  city?: string;
}) {
  const parts = [request.address, request.city].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "-";
}

export function formatAcceptedStatus(status: string) {
  const normalized = normalizeRequestStatus(status);
  if (normalized === "in-progress") return "In Progress";
  if (normalized === "accepted") return "Scheduled";
  return status.replace(/_/g, " ");
}

export function parsePaymentCustomer(payment: Payment) {
  const fromObject = `${payment.homeowner?.firstName || ""} ${
    payment.homeowner?.lastName || ""
  }`.trim();
  const fallback = payment.homeownerName?.trim();
  return fromObject || fallback || "Customer";
}

export function buildEarningsSnapshot(payments: Payment[]) {
  const completed = payments.filter((payment) => payment?.status === "completed");
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const lastMonthDate = new Date(year, month - 1, 1);

  const sum = (list: Payment[]) =>
    list.reduce((acc, payment) => acc + (payment.amount || 0), 0);

  const inMonth = (payment: Payment, targetMonth: number, targetYear: number) => {
    if (!payment.createdAt) return false;
    const date = new Date(payment.createdAt);
    return (
      !Number.isNaN(date.getTime()) &&
      date.getMonth() === targetMonth &&
      date.getFullYear() === targetYear
    );
  };

  const thisMonth = sum(
    completed.filter((payment) => inMonth(payment, month, year)),
  );
  const lastMonth = sum(
    completed.filter((payment) =>
      inMonth(payment, lastMonthDate.getMonth(), lastMonthDate.getFullYear()),
    ),
  );
  const yearToDate = sum(
    completed.filter((payment) => {
      if (!payment.createdAt) return false;
      const date = new Date(payment.createdAt);
      return !Number.isNaN(date.getTime()) && date.getFullYear() === year;
    }),
  );

  const averageJobValue =
    completed.length > 0 ? Math.round(yearToDate / completed.length) : 0;

  const recentPayments = [...completed]
    .sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    })
    .slice(0, 5);

  return {
    thisMonth,
    lastMonth,
    yearToDate,
    averageJobValue,
    recentPayments,
  };
}
