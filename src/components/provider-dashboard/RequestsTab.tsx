import type { ReactNode } from "react";
import {
  formatAcceptedStatus,
  formatRequestLocation,
  formatRequestTime,
  formatShortDate,
  parseHomeownerName,
} from "./formatters";
import type { ServiceRequest } from "./types";

type Props = {
  acceptedRequests: ServiceRequest[];
  requests: ServiceRequest[];
  statsLoading: boolean;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  updatingRequestId: string | null;
  actionError?: string | null;
};

export default function RequestsTab({
  acceptedRequests,
  requests,
  statsLoading,
  onAccept,
  onDecline,
  updatingRequestId,
  actionError,
}: Props) {
  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-[10px] border border-black/10 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <AlertIcon />
          <h2 className="text-base font-medium text-black">
            New Requests ({statsLoading ? "..." : requests.length})
          </h2>
        </div>

        {actionError ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {actionError}
          </p>
        ) : null}

        <div className="mt-8 space-y-3">
          {statsLoading ? (
            <p className="py-4 text-sm text-black/60">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="py-4 text-sm text-black/60">
              No new requests right now.
            </p>
          ) : (
            requests.map((request) => (
              <NewRequestCard
                key={request.id}
                request={request}
                onAccept={onAccept}
                onDecline={onDecline}
                isUpdating={updatingRequestId === request.id}
              />
            ))
          )}
        </div>
      </section>

      <section className="rounded-[10px] border border-black/10 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <CheckIcon />
          <h2 className="text-base font-medium text-black">Accepted Jobs</h2>
        </div>

        <div className="mt-8 space-y-3">
          {statsLoading ? (
            <p className="py-4 text-sm text-black/60">
              Loading accepted jobs...
            </p>
          ) : acceptedRequests.length === 0 ? (
            <p className="py-4 text-sm text-black/60">No accepted jobs yet.</p>
          ) : (
            acceptedRequests.map((request) => (
              <AcceptedRequestCard key={request.id} request={request} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function NewRequestCard({
  request,
  onAccept,
  onDecline,
  isUpdating,
}: {
  request: ServiceRequest;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  isUpdating: boolean;
}) {
  const customerName = parseHomeownerName(request.homeowner);
  const priority = (request.priority || "normal").toLowerCase();
  const location = formatRequestLocation(request);
  const phone = request.homeowner?.contactPhone?.trim();
  const rating = request.homeowner?.averageRating;

  const handleMessage = () => {
    // Navigate to messaging interface for this customer
    window.location.href = `/messages?requestId=${request.id}`;
  };

  return (
    <article className="rounded-[9px] border border-black/10 bg-white p-4 sm:px-4 sm:py-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <CustomerAvatar name={customerName} />
            <div className="min-w-0">
              <p className="text-base font-semibold leading-tight text-black">
                {customerName}
              </p>
              {rating != null ? (
                <p className="mt-1 flex items-center gap-1 text-sm text-[#4f5c70]">
                  <StarIcon />
                  <span>{rating.toFixed(1)}</span>
                </p>
              ) : null}
            </div>
          </div>

          <span className="mt-1 shrink-0 rounded-lg bg-[#d9fbe4] px-4 py-1 text-center text-xs font-medium lowercase text-[#047a34]">
            {priority}
          </span>
        </div>

        <div className="grid gap-3 text-sm text-[#4f5c70] sm:grid-cols-3">
          <InfoItem
            icon={<CalendarIcon />}
            text={formatShortDate(request.preferredDate)}
          />
          <InfoItem
            icon={<ClockIcon />}
            text={formatRequestTime(
              request.preferredDate,
              request.preferredTime,
            )}
          />
          <InfoItem icon={<PinIcon />} text={location} />
        </div>

        {request.description ? (
          <p className="text-sm leading-relaxed text-black/85">
            {request.description}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onAccept(request.id)}
            disabled={isUpdating}
            className="inline-flex h-8 items-center rounded-lg bg-[#00a83f] px-4 text-sm font-medium text-white hover:bg-[#008f36] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUpdating ? "Working..." : "Accept Job"}
          </button>
          <button
            type="button"
            onClick={handleMessage}
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-sm font-medium text-black hover:bg-black/[.02]"
          >
            <MessageIcon />
            Message {customerName}
          </button>
          {phone ? (
            <a
              href={`tel:${phone}`}
              className="inline-flex h-8 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-sm font-medium text-black hover:bg-black/[.02]"
            >
              <PhoneIcon />
              Call
            </a>
          ) : (
            <button
              type="button"
              className="inline-flex h-8 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-sm font-medium text-black hover:bg-black/[.02]"
            >
              <PhoneIcon />
              Call
            </button>
          )}
          <button
            type="button"
            onClick={() => onDecline(request.id)}
            disabled={isUpdating}
            className="inline-flex h-8 items-center rounded-lg border border-black/10 bg-white px-4 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Decline
          </button>
        </div>
      </div>
    </article>
  );
}

function AcceptedRequestCard({ request }: { request: ServiceRequest }) {
  const customerName = parseHomeownerName(request.homeowner);
  const serviceTitle = request.service?.title || "Service";
  const statusLabel = formatAcceptedStatus(request.status);
  const location = formatRequestLocation(request);

  const handleMessageCustomer = () => {
    // Navigate to messaging interface for this customer
    window.location.href = `/messages?requestId=${request.id}`;
  };

  const handleStartJob = () => {
    // Update request status to in-progress
    // This would typically call an API endpoint to update the status
    alert(`Starting job for ${customerName}`);
  };

  const handleGetDirections = () => {
    // Open Google Maps with the address
    const query = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <article className="rounded-[9px] border border-[#cfdff2] bg-[#eef6ff] p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <CustomerAvatar name={customerName} variant="accepted" />
          <div className="min-w-0">
            <p className="text-base font-semibold leading-tight text-black">
              {customerName}
            </p>
            <p className="mt-0.5 text-sm text-[#4f5c70]">{serviceTitle}</p>
          </div>
        </div>

        <span className="self-start rounded-lg bg-[#2f80ed] px-3 py-1 text-xs font-medium capitalize text-white sm:self-center">
          {statusLabel}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleMessageCustomer}
          className="inline-flex h-8 items-center gap-2 rounded-lg bg-[#020013] px-4 text-sm font-medium text-white hover:bg-black"
        >
          <MessageIcon />
          Message {customerName}
        </button>
        <button
          type="button"
          onClick={handleStartJob}
          className="inline-flex h-8 items-center rounded-lg border border-black/10 bg-white px-4 text-sm font-medium text-black hover:bg-black/[.02]"
        >
          Start Job
        </button>
        <button
          type="button"
          onClick={handleGetDirections}
          className="inline-flex h-8 items-center rounded-lg border border-black/10 bg-white px-4 text-sm font-medium text-black hover:bg-black/[.02]"
        >
          Get Directions
        </button>
      </div>
    </article>
  );
}

function CustomerAvatar({
  name,
  variant = "new",
}: {
  name: string;
  variant?: "new" | "accepted";
}) {
  const initial = name.slice(0, 1).toUpperCase();

  if (variant === "accepted") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#c8d4c0,#4e5d41)] text-sm font-semibold text-white">
        {initial}
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ededf0] text-base font-medium text-black/80">
      {initial}
    </div>
  );
}

function InfoItem({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 text-[#4f5c70]">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}

function AlertIcon() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fff4cf] text-[11px] font-bold text-[#f5a400]">
      !
    </span>
  );
}

function CheckIcon() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8f8ed] text-[11px] font-bold text-[#00c853]">
      ✓
    </span>
  );
}

function StarIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 text-[#ffc107]"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="m10 2 2.4 5 5.5.8-4 3.9.9 5.5L10 14.6 5.1 17.2l.9-5.5-4-3.9 5.5-.8L10 2Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
      <path
        d="M6.5 3v3M13.5 3v3M4.2 7.5h11.6M5.2 4.8h9.6c.9 0 1.7.7 1.7 1.7v9c0 .9-.7 1.7-1.7 1.7H5.2c-.9 0-1.7-.7-1.7-1.7v-9c0-.9.7-1.7 1.7-1.7Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M10 6.5V10l2.5 1.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
      <path
        d="M15 8.5c0 4-5 8-5 8s-5-4-5-8a5 5 0 1 1 10 0Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="10" cy="8.5" r="1.7" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
      <path
        d="M4.5 5.2h11v8.2h-7L4.5 16V5.2Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
      <path
        d="M6.2 4.2 8 7.6l-1.4 1.2c.8 1.7 2 3 3.7 3.7l1.2-1.4 3.4 1.8-.6 2.8c-.1.4-.5.7-.9.7A10.7 10.7 0 0 1 3.7 6.6c0-.4.3-.8.7-.9l2.8-.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
