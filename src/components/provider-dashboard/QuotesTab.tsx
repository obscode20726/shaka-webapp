import { useState } from "react";
import { parseHomeownerName } from "./formatters";
import type { ServiceRequest } from "./types";
import { submitQuote } from "@/lib/api";

type Props = {
  requests: ServiceRequest[];
  statsLoading: boolean;
};

export default function QuotesTab({ requests, statsLoading }: Props) {
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteDescription, setQuoteDescription] = useState("");
  const [quoteDuration, setQuoteDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmitQuote = async () => {
    if (!selectedRequest || !quoteAmount) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitQuote({
        serviceRequestId: selectedRequest.id,
        amount: parseFloat(quoteAmount),
        description: quoteDescription || undefined,
        estimatedDuration: quoteDuration || undefined,
      });

      setSelectedRequest(null);
      setQuoteAmount("");
      setQuoteDescription("");
      setQuoteDuration("");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit quote");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMessage = (request: ServiceRequest) => {
    const phone = request.homeowner?.contactPhone?.trim() ||
                  request.homeowner?.phone?.trim() ||
                  request.homeowner?.user?.phone?.trim();
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

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
            No service requests yet.
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
                    <h3 className="text-lg font-medium text-black">
                      {request.service?.title || "Service"}
                    </h3>
                    <span className="rounded-full bg-[#fff4cf] px-2 py-0.5 text-xs text-[#987303]">
                      {request.status}
                    </span>
                  </div>
                  <p className="mt-2 text-lg text-black/70">
                    Customer: {parseHomeownerName(request.homeowner)}
                  </p>
                  <p className="text-lg text-black/70">
                    Location: {request.city}
                  </p>
                  <p className="text-lg text-black/70">
                    Preferred Date:{" "}
                    {new Date(request.preferredDate).toLocaleDateString()}
                    {request.preferredTime ? ` • ${request.preferredTime}` : ""}
                  </p>
                </div>

                <button
                  onClick={() => handleMessage(request)}
                  className="inline-flex items-center rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black/75 hover:bg-black/[.02]"
                >
                  💬 Message
                </button>
              </div>

              <div className="mt-4">
                <p className="text-lg font-medium text-black">Description:</p>
                <div className="mt-2 rounded-md bg-[#f5f6f8] px-4 py-3 text-base text-black/70">
                  {request.description}
                </div>
              </div>

              <button
                onClick={() => setSelectedRequest(request)}
                className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#ff6a00] px-4 py-3 text-sm font-medium text-white hover:bg-[#e85f00]"
              >
                ✈ Submit Quote
              </button>
            </article>
          ))
        )}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="text-xl font-semibold text-black">Submit Quote</h3>
            <p className="mt-1 text-sm text-black/60">
              Quote for: {selectedRequest.service?.title || "Service"}
            </p>

            {submitError && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {submitError}
              </p>
            )}

            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-black">
                  Quote Amount (RWF)
                </label>
                <input
                  id="amount"
                  type="number"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-black/10 bg-[#f5f6f8] px-4 py-2 text-black"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-black">
                  Estimated Duration
                </label>
                <input
                  id="duration"
                  type="text"
                  value={quoteDuration}
                  onChange={(e) => setQuoteDuration(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-black/10 bg-[#f5f6f8] px-4 py-2 text-black"
                  placeholder="e.g., 2 hours, 1 day"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-black">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  value={quoteDescription}
                  onChange={(e) => setQuoteDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-black/10 bg-[#f5f6f8] px-4 py-2 text-black"
                  rows={3}
                  placeholder="Additional details about your quote"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setQuoteAmount("");
                  setQuoteDescription("");
                  setQuoteDuration("");
                  setSubmitError(null);
                }}
                className="flex-1 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-black/[.02]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitQuote}
                disabled={!quoteAmount || isSubmitting}
                className="flex-1 rounded-lg bg-[#ff6a00] px-4 py-2 text-sm font-medium text-white hover:bg-[#e85f00] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Submit Quote"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
