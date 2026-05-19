import type { BookingStatus } from "./types";

const styles: Record<BookingStatus, string> = {
  Approved: "bg-[#dcfce7] text-[#008236]",
  "In Progress": "bg-[#f3e8ff] text-[#8200db]",
  Completed: "bg-[#f3f4f6] text-[#364153]",
};

export default function StatusPill({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}
