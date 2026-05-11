export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("rw-RW", {
    style: "currency",
    currency: "RWF",
  }).format(amount);
}

export function formatMoney(amount?: number) {
  if (!Number.isFinite(amount)) return "RWF 0";
  return formatCurrency(amount || 0);
}

export function formatShortDate(iso?: string) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toISOString().slice(0, 10);
}

export function formatDateTime(iso?: string) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function fullName(person?: {
  firstName?: string;
  lastName?: string;
  businessName?: string;
}) {
  const name = `${person?.firstName || ""} ${person?.lastName || ""}`.trim();
  return person?.businessName || name || "Provider";
}

export function statusClassName(status: string) {
  if (status === "pending") return "bg-[#fff4cf] text-[#987303]";
  if (status === "accepted" || status === "in-progress") {
    return "bg-[#e8f1ff] text-[#2a73d9]";
  }
  if (status === "completed") return "bg-[#e8f8ed] text-[#1f9d4a]";
  return "bg-[#ffe8e8] text-[#dc2626]";
}
