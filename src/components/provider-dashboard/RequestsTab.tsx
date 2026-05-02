import { formatShortDate } from "./formatters";
import type { ServiceRequest } from "./types";

type Props = {
  acceptedRequests: ServiceRequest[];
  requests: ServiceRequest[];
  statsLoading: boolean;
};

export default function RequestsTab({
  acceptedRequests,
  requests,
  statsLoading,
}: Props) {
  return (
    <div className="mt-6 space-y-4">
      <section className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
          <span className="text-lg">🟡</span>
            <h2 className="text-xl font-semibold text-black">
              New Requests ({statsLoading ? "..." : requests.length})
            </h2>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {statsLoading ? (
            <p className="py-4 text-sm text-black/60">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="py-4 text-sm text-black/60">
              No new requests right now.
            </p>
          ) : (
            requests.map((request) => <NewRequestCard key={request.id} request={request} />)
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2">
        <span className="text-lg">✅</span>
          <h2 className="text-xl font-semibold text-black">
            Accepted Jobs ({statsLoading ? "..." : acceptedRequests.length})
          </h2>
        </div>

        <div className="mt-4 space-y-3">
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

function NewRequestCard({ request }: { request: ServiceRequest }) {
  return (
    <article className="rounded-2xl border border-black/10 bg-white px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <RequestSummary request={request} showTime />

        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center rounded-lg bg-[#16a34a] px-4 py-2 text-sm font-medium text-white hover:bg-[#15803d]">
            Accept Job
          </button>
          <button className="inline-flex items-center rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black/75 hover:bg-black/[.02]">
          💬 Message
          </button>
          <button className="inline-flex items-center rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black/75 hover:bg-black/[.02]">
          📞 Call
          </button>
          <button className="inline-flex items-center rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            Decline
          </button>
        </div>
      </div>
    </article>
  );
}

function AcceptedRequestCard({ request }: { request: ServiceRequest }) {
  return (
    <article className="rounded-2xl border border-black/10 bg-white px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <RequestSummary request={request} />

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#eaf2ff] px-2 py-0.5 text-xs text-[#2a73d9]">
            scheduled
          </span>
          <button className="inline-flex items-center rounded-lg bg-[#0f172a] px-4 py-2 text-sm font-medium text-white hover:bg-black">
            Message Customer
          </button>
          <button className="inline-flex items-center rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black/75 hover:bg-black/[.02]">
            Start Job
          </button>
          <button className="inline-flex items-center rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black/75 hover:bg-black/[.02]">
            Get Directions
          </button>
        </div>
      </div>
    </article>
  );
}

function RequestSummary({
  request,
  showTime = false,
}: {
  request: ServiceRequest;
  showTime?: boolean;
}) {
  const serviceTitle = request.service?.title || "Service";
  return (
    <div className="min-w-[220px]">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/[.05] text-sm font-semibold text-black/70">
          {serviceTitle.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-black">{serviceTitle}</p>
          <p className="text-xs text-black/60">
            {formatShortDate(request.preferredDate)}
            {showTime ? (
              <>
                {" "}
                •{" "}
                {new Date(request.preferredDate).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </>
            ) : (
              <> • {request.city}</>
            )}
          </p>
        </div>
      </div>

      {showTime ? (
        <>
          <p className="mt-3 text-sm text-black/70">📍 {request.city}</p>
          <p className="mt-2 text-sm text-black/60">{request.description}</p>
        </>
      ) : null}
    </div>
  );
}
