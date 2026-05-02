import type { Payment } from "./types";

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
