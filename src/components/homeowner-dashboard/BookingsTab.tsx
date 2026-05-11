import {
  formatDateTime,
  formatShortDate,
  fullName,
  statusClassName,
} from "./formatters";
import type React from "react";
import type { Booking, ServiceRequest } from "./types";

type Props = {
  bookings: Booking[];
  requests: ServiceRequest[];
  statsLoading: boolean;
};

export default function BookingsTab({
  bookings,
  requests,
  statsLoading,
}: Props) {
  const activeRequests = requests.filter((request) =>
    ["accepted", "in-progress"].includes(request.status),
  );
  const completedRequests = requests.filter(
    (request) => request.status === "completed",
  );
  const pendingBookings = bookings
    .filter((booking) => new Date(booking.scheduledAt) > new Date())
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );

  return (
    <div className="mt-6 space-y-5">
      <BookingSection title="Upcoming Bookings" tone="blue">
        {statsLoading ? (
          <EmptyMessage>Loading bookings...</EmptyMessage>
        ) : pendingBookings.length === 0 ? (
          <EmptyMessage>No upcoming bookings yet.</EmptyMessage>
        ) : (
          pendingBookings.map((booking) => (
            <article
              key={booking.id}
              className="rounded-xl border border-black/10 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-black">
                    {fullName(booking.provider)}
                  </p>
                  <p className="text-sm text-black/55">
                    {booking.serviceRequest?.service?.title || "Service"} on{" "}
                    {formatDateTime(booking.scheduledAt)}
                  </p>
                </div>
                <span className="rounded-full bg-[#e8f1ff] px-2 py-1 text-xs font-medium text-[#2a73d9]">
                  Upcoming
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <ActionButton>Message</ActionButton>
                <ActionButton>Call</ActionButton>
                <ActionButton>Reschedule</ActionButton>
                <ActionButton danger>Cancel</ActionButton>
              </div>
            </article>
          ))
        )}
      </BookingSection>

      <BookingSection title="In Progress" tone="amber">
        {statsLoading ? (
          <EmptyMessage>Loading active services...</EmptyMessage>
        ) : activeRequests.length === 0 ? (
          <EmptyMessage>No active services right now.</EmptyMessage>
        ) : (
          activeRequests.map((request) => (
            <article
              key={request.id}
              className="rounded-xl border border-[#f3df90] bg-[#fffbe8] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-black">
                    {fullName(request.provider)}
                  </p>
                  <p className="text-sm text-black/55">
                    {request.service?.title || "Service"} in {request.city}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClassName(request.status)}`}>
                  {request.status}
                </span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-black/60">
                  <span>Service Progress</span>
                  <span>{request.status === "in-progress" ? "75%" : "35%"}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-black/15">
                  <div
                    className="h-full rounded-full bg-black"
                    style={{
                      width: request.status === "in-progress" ? "75%" : "35%",
                    }}
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <ActionButton primary>Chat Live</ActionButton>
                <ActionButton>Call Provider</ActionButton>
              </div>
            </article>
          ))
        )}
      </BookingSection>

      <BookingSection title="Recent Completed" tone="green">
        {statsLoading ? (
          <EmptyMessage>Loading completed services...</EmptyMessage>
        ) : completedRequests.length === 0 ? (
          <EmptyMessage>No completed bookings yet.</EmptyMessage>
        ) : (
          completedRequests.slice(0, 4).map((request) => (
            <article
              key={request.id}
              className="rounded-xl border border-black/10 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-black">
                    {fullName(request.provider)}
                  </p>
                  <p className="text-sm text-black/55">
                    {request.service?.title || "Service"} completed on{" "}
                    {formatShortDate(request.preferredDate)}
                  </p>
                </div>
                <span className="rounded-full bg-[#e8f8ed] px-2 py-1 text-xs font-medium text-[#1f9d4a]">
                  Completed
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <ActionButton>Write Review</ActionButton>
                <ActionButton>Book Again</ActionButton>
                <ActionButton>View Invoice</ActionButton>
              </div>
            </article>
          ))
        )}
      </BookingSection>
    </div>
  );
}

function BookingSection({
  children,
  title,
  tone,
}: {
  children: React.ReactNode;
  title: string;
  tone: "blue" | "amber" | "green";
}) {
  const toneClass = {
    blue: "text-[#2a73d9]",
    amber: "text-[#b57900]",
    green: "text-[#1f9d4a]",
  }[tone];

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5">
      <h2 className={`text-sm font-semibold ${toneClass}`}>{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function EmptyMessage({ children }: { children: React.ReactNode }) {
  return <p className="py-4 text-sm text-black/55">{children}</p>;
}

function ActionButton({
  children,
  danger = false,
  primary = false,
}: {
  children: React.ReactNode;
  danger?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      className={`rounded-lg border px-3 py-2 text-xs font-medium ${
        primary
          ? "border-[#ff6b00] bg-[#ffb000] text-black"
          : danger
            ? "border-[#ffd0d0] bg-white text-[#dc2626]"
            : "border-black/15 bg-white text-black/75 hover:bg-black/[.02]"
      }`}
    >
      {children}
    </button>
  );
}
