import type { RecentActivityItem } from "./types";

export default function StatusPill({
  status,
}: {
  status: RecentActivityItem["status"];
}) {
  const styles =
    status === "pending"
      ? "bg-[#fff4cf] text-[#987303]"
      : status === "accepted"
        ? "bg-[#eaf2ff] text-[#2a73d9]"
        : "bg-[#e8f8ed] text-[#1f9d4a]";

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
}
