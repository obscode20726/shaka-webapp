import type { ServiceRequest } from "./types";

type Props = {
  requests: ServiceRequest[];
  statsLoading: boolean;
};

export default function QuotesTab({ requests, statsLoading }: Props) {
  return (
    <>
      <div className="mt-6">
        <h2 className="text-2xl font-semibold text-black">
          Booking Requests &amp; Quotes
        </h2>
        <p className="text-sm text-black/55">
          View requests and submit quotes to customers
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {statsLoading ? (
          <p className="py-8 text-center text-black/60">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="py-8 text-center text-black/60">
            No pending requests at the moment
          </p>
        ) : (
          requests.map((request) => (
            <article
              key={request.id}
              className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[28px] font-medium leading-none text-black sm:text-[30px]">
                      {request.service?.title || "Service"}
                    </h3>
                    <span className="rounded-full bg-[#fff4cf] px-2 py-0.5 text-xs text-[#987303]">
                      {request.status}
                    </span>
                  </div>
                  <p className="mt-2 text-lg text-black/70">
                    Location: {request.city}
                  </p>
                  <p className="text-lg text-black/70">
                    Preferred Date:{" "}
                    {new Date(request.preferredDate).toLocaleDateString()}
                  </p>
                </div>

                <button className="inline-flex items-center rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black/75 hover:bg-black/[.02]">
                💬 Message
                </button>
              </div>

              <div className="mt-4">
                <p className="text-lg font-medium text-black">Description:</p>
                <div className="mt-2 rounded-md bg-[#f5f6f8] px-4 py-3 text-base text-black/70">
                  {request.description}
                </div>
              </div>

              <button className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#ff6a00] px-4 py-3 text-sm font-medium text-white hover:bg-[#e85f00]">
              ✈ Submit Quote
              </button>
            </article>
          ))
        )}
      </div>
    </>
  );
}
