import {
  formatDateTime,
  formatShortDate,
  fullName,
  statusClassName,
} from "./formatters";
import type React from "react";
import Image from "next/image";
import { useState } from "react";
import type { Booking, ServiceRequest } from "./types";
import RatingModal from "./RatingModal";
import { cancelBooking, cancelServiceRequest, rescheduleBooking as rescheduleBookingApi } from "@/lib/api";

type Props = {
  bookings: Booking[];
  requests: ServiceRequest[];
  statsLoading: boolean;
  onRefresh?: () => void;
};

export default function BookingsTab({
  bookings,
  requests,
  statsLoading,
  onRefresh,
}: Props) {
  const [reviewRequest, setReviewRequest] = useState<ServiceRequest | null>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [newScheduledAt, setNewScheduledAt] = useState<string>("");
  const [cancelBookingItem, setCancelBookingItem] = useState<Booking | null>(null);
  const [cancelRequestItem, setCancelRequestItem] = useState<ServiceRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  const handleMessage = (provider: Booking["provider"], serviceRequest?: ServiceRequest) => {
    const phoneNumber =
      provider?.contactPhone ??
      provider?.phone ??
      provider?.user?.phone ??
      serviceRequest?.provider?.contactPhone ??
      serviceRequest?.provider?.phone ??
      serviceRequest?.provider?.user?.phone ??
      "";

    if (phoneNumber) {
      window.open(`https://wa.me/${phoneNumber.replace(/\D/g, "")}`, "_blank", "noopener,noreferrer");
    } else {
      setActionMessage({ type: "error", text: "Provider contact not available" });
    }
  };

  const handleCall = (provider: Booking["provider"], serviceRequest?: ServiceRequest) => {
    const phoneNumber =
      provider?.contactPhone ??
      provider?.phone ??
      provider?.user?.phone ??
      serviceRequest?.provider?.contactPhone ??
      serviceRequest?.provider?.phone ??
      serviceRequest?.provider?.user?.phone ??
      "";

    if (phoneNumber) {
      window.open(`tel:${phoneNumber.replace(/\D/g, "")}`, "_self");
    } else {
      setActionMessage({ type: "error", text: "Provider phone not available" });
    }
  };

  const handleReschedule = async (newDate: string) => {
    if (!rescheduleBooking) return;

    // Validate newScheduledAt before processing
    if (!newDate || newDate.trim() === "") {
      setActionMessage({ type: "error", text: "Please select a date and time for rescheduling" });
      return;
    }

    const parsedDate = new Date(newDate);
    if (isNaN(parsedDate.getTime())) {
      setActionMessage({ type: "error", text: "Invalid date format. Please select a valid date and time" });
      return;
    }

    setIsProcessing(true);
    try {
      // Convert datetime-local format (YYYY-MM-DDTHH:mm) to ISO timestamp
      const isoTimestamp = parsedDate.toISOString();
      await rescheduleBookingApi({
        bookingId: rescheduleBooking.id,
        newScheduledAt: isoTimestamp,
      });
      setActionMessage({ type: "success", text: "Booking rescheduled successfully" });
      setRescheduleBooking(null);
      setNewScheduledAt("");
      onRefresh?.();
    } catch (error) {
      setActionMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to reschedule" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelBookingItem) return;

    setIsProcessing(true);
    try {
      await cancelBooking(cancelBookingItem.id);
      setActionMessage({ type: "success", text: "Booking cancelled successfully" });
      setCancelBookingItem(null);
      onRefresh?.();
    } catch (error) {
      setActionMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to cancel booking" });
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="mt-6 space-y-5">
      {actionMessage && (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            actionMessage.type === "success"
              ? "border border-[#9ae6b4] bg-[#edfff4] text-[#008a3d]"
              : "border border-[#fc8181] bg-[#fff5f5] text-[#c53030]"
          }`}
        >
          {actionMessage.text}
        </div>
      )}

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
                <div className="flex items-center gap-3">
                  {booking.provider?.profileImageUrl && (
                    <Image
                      src={booking.provider.profileImageUrl}
                      alt={fullName(booking.provider)}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-black">
                      {fullName(booking.provider)}
                    </p>
                    <p className="text-sm text-black/55">
                      {booking.serviceRequest?.service?.title || "Service"} on{" "}
                      {formatDateTime(booking.scheduledAt)}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#e8f1ff] px-2 py-1 text-xs font-medium text-[#2a73d9]">
                  Upcoming
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <ActionButton onClick={() => handleMessage(booking.provider, booking.serviceRequest)}>Message</ActionButton>
                <ActionButton onClick={() => handleCall(booking.provider, booking.serviceRequest)}>Call</ActionButton>
                <ActionButton onClick={() => {
                  setRescheduleBooking(booking);
                  setNewScheduledAt(booking.scheduledAt.slice(0, 16));
                }}>Reschedule</ActionButton>
                <ActionButton danger onClick={() => setCancelBookingItem(booking)}>Cancel</ActionButton>
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
                <div className="flex items-center gap-3">
                  {request.provider?.profileImageUrl && (
                    <Image
                      src={request.provider.profileImageUrl}
                      alt={fullName(request.provider)}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-black">
                      {fullName(request.provider)}
                    </p>
                    <p className="text-sm text-black/55">
                      {request.service?.title || "Service"} in {request.city}
                    </p>
                  </div>
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
                <ActionButton primary onClick={() => handleMessage(request.provider)}>Chat Live</ActionButton>
                <ActionButton onClick={() => handleCall(request.provider)}>Call Provider</ActionButton>
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
                <div className="flex items-center gap-3">
                  {request.provider?.profileImageUrl && (
                    <Image
                      src={request.provider.profileImageUrl}
                      alt={fullName(request.provider)}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-black">
                      {fullName(request.provider)}
                    </p>
                    <p className="text-sm text-black/55">
                      {request.service?.title || "Service"} completed on{" "}
                      {formatShortDate(request.preferredDate)}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#e8f8ed] px-2 py-1 text-xs font-medium text-[#1f9d4a]">
                  Completed
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <ActionButton onClick={() => setReviewRequest(request)}>Write Review</ActionButton>
                <ActionButton>Book Again</ActionButton>
                <ActionButton>View Invoice</ActionButton>
              </div>
            </article>
          ))
        )}
      </BookingSection>
      <RatingModal isOpen={Boolean(reviewRequest)} onClose={() => setReviewRequest(null)} providerName={fullName(reviewRequest?.provider)} serviceName={reviewRequest?.service?.title || "Service"} />

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="text-lg font-semibold text-black">Reschedule Booking</h3>
            <p className="mt-2 text-sm text-black/55">
              Select a new date and time for your booking with {fullName(rescheduleBooking.provider)}.
            </p>
            <input
              type="datetime-local"
              className="mt-4 w-full rounded-lg border border-black/10 bg-[#f0f1f3] px-4 py-3 text-sm text-black outline-none"
              value={newScheduledAt}
              onChange={(e) => setNewScheduledAt(e.target.value)}
            />
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setRescheduleBooking(null);
                  setNewScheduledAt("");
                }}
                className="flex-1 rounded-lg border border-black/10 px-4 py-3 text-sm font-medium text-black/75 hover:bg-black/[.02]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReschedule(newScheduledAt)}
                disabled={isProcessing || !newScheduledAt || newScheduledAt.trim() === "" || isNaN(new Date(newScheduledAt).getTime())}
                className="flex-1 rounded-lg bg-[#ff6b00] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isProcessing ? "Rescheduling..." : "Confirm Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Confirmation Modal */}
      {cancelBookingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="text-lg font-semibold text-black">Cancel Booking</h3>
            <p className="mt-2 text-sm text-black/55">
              Are you sure you want to cancel your booking with {fullName(cancelBookingItem.provider)}? This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setCancelBookingItem(null)}
                className="flex-1 rounded-lg border border-black/10 px-4 py-3 text-sm font-medium text-black/75 hover:bg-black/[.02]"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={isProcessing}
                className="flex-1 rounded-lg border border-[#ffd0d0] bg-white px-4 py-3 text-sm font-semibold text-[#dc2626] disabled:opacity-50"
              >
                {isProcessing ? "Cancelling..." : "Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
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
  onClick,
}: {
  children: React.ReactNode;
  danger?: boolean;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
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
