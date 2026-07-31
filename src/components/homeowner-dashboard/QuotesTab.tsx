"use client";

import { useState, useEffect } from "react";
import { statusClassName } from "./formatters";
import type { ServiceRequest } from "./types";
import PaymentModal from "./PaymentModal";
import { updateQuoteStatus, createBooking, initializePayment } from "@/lib/api";
import { fetchQuotesForServiceRequest, type QuoteItem } from "@/lib/quotes-api";

type Props = {
  requests: ServiceRequest[];
  statsLoading: boolean;
  onRequestUpdate?: () => void;
};

export default function QuotesTab({ requests, statsLoading, onRequestUpdate }: Props) {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [quotesMap, setQuotesMap] = useState<Record<string, QuoteItem[]>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllQuotes = async () => {
      const newQuotesMap: Record<string, QuoteItem[]> = {};
      for (const request of requests) {
        try {
          const quotes = await fetchQuotesForServiceRequest(request.id);
          newQuotesMap[request.id] = quotes;
          // Add small delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Failed to fetch quotes for request ${request.id}:`, error);
          newQuotesMap[request.id] = [];
        }
      }
      setQuotesMap(newQuotesMap);
    };

    if (requests.length > 0) {
      fetchAllQuotes();
    }
  }, [requests]);

  const handleApproveClick = (request: ServiceRequest, quote: QuoteItem) => {
    setSelectedRequest({ ...request, quote });
    setPaymentModalOpen(true);
  };

  const handlePaymentConfirm = async () => {
    if (!selectedRequest?.quote?.id) return;

    setIsProcessingPayment(true);
    setError(null);
    try {
      // Step 1: Accept the quote
      await updateQuoteStatus(selectedRequest.quote.id, "accepted");

      // Step 2: Create booking from accepted quote
      const booking = await createBooking({
        quoteId: selectedRequest.quote.id,
        serviceRequestId: selectedRequest.id,
      });

      // Step 3: Initialize payment (in a real app, this would redirect to payment gateway)
      if (booking.id && selectedRequest.quote.amount) {
        await initializePayment({
          bookingId: booking.id,
          amount: selectedRequest.quote.amount,
          currency: "RWF",
        });
      }

      if (onRequestUpdate) {
        onRequestUpdate();
      }
    } catch (error) {
      console.error("Failed to approve quote:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to approve quote. Please try again.";
      setError(errorMessage);
      throw error;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleRejectClick = async (request: ServiceRequest, quote: QuoteItem) => {
    if (!quote.id) return;

    setError(null);
    try {
      await updateQuoteStatus(quote.id, "rejected");
      if (onRequestUpdate) {
        onRequestUpdate();
      }
    } catch (error) {
      console.error("Failed to reject quote:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to reject quote. Please try again.";
      setError(errorMessage);
    }
  };

  const isPlumbingService = (request: ServiceRequest) => {
    return request.service?.slug?.toLowerCase().includes("plumbing");
  };
  return (
    <>
      <div className="mt-6">
        <h2 className="text-2xl font-semibold text-black">
          Service Requests &amp; Quotes
        </h2>
        <p className="text-sm text-black/55">
          Request services and manage quotes from providers
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mt-5 space-y-4">
        {statsLoading ? (
          <p className="py-8 text-center text-black/60">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="py-8 text-center text-black/60">
            No service requests yet. Click &quot;Book Service&quot; to get
            started!
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
                    <h3 className="text-2xl font-medium leading-none text-black sm:text-[30px]">
                      {request.service?.title || "Service"}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${statusClassName(
                        request.status,
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>
                  {request.provider ? (
                    <div className="mt-2 flex items-center gap-2">
                      {request.provider.profileImageUrl && (
                        <img
                          src={request.provider.profileImageUrl}
                          alt={`${request.provider.firstName} ${request.provider.lastName}`}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      )}
                      <p className="text-sm text-black/70">
                        Provider: {request.provider.firstName}{" "}
                        {request.provider.lastName}
                      </p>
                    </div>
                  ) : null}
                  <p className="text-sm text-black/70">
                    Location: {request.city}
                  </p>
                  <p className="text-sm text-black/70">
                    Preferred Date:{" "}
                    {new Date(request.preferredDate).toLocaleDateString()}
                  </p>
                </div>

                <button className="inline-flex items-center rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black/75 hover:bg-black/[.02]">
                  💬 Message
                </button>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-black">Description:</p>
                <div className="mt-2 rounded-md bg-[#f5f6f8] px-4 py-3 text-sm text-black/70">
                  {request.description}
                </div>
              </div>

              {quotesMap[request.id] && quotesMap[request.id].length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-black">Quotes Received</p>
                  {quotesMap[request.id].map((quote) => (
                    <div key={quote.id} className="rounded-xl bg-[#eff6ff] p-4 sm:p-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="font-semibold text-black">Quote Details</p>
                        {quote.amount != null && <p className="text-xl font-medium text-black"><span className="mr-2 text-sm text-[#00a83b]">▣</span>RWF {quote.amount.toLocaleString()}</p>}
                      </div>
                      <div className="grid gap-4 text-sm text-black/70 sm:grid-cols-2">
                        {quote.estimatedDuration && (
                          <div className="flex justify-between">
                            <span>Timeline:</span>
                            <span>{quote.estimatedDuration}</span>
                          </div>
                        )}
                        {quote.validUntil && (
                          <div className="flex justify-between">
                            <span>Valid Until:</span>
                            <span>{new Date(quote.validUntil).toLocaleDateString()}</span>
                          </div>
                        )}
                        {quote.materialCost != null && quote.laborCost != null && (
                          <>
                            <div className="flex justify-between">
                              <span>Material Cost:</span>
                              <span>RWF {quote.materialCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Labor Cost:</span>
                              <span>RWF {quote.laborCost.toLocaleString()}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {quote.materials && quote.materials.length > 0 && (
                        <div className="mt-3">
                          <p className="mb-1 text-sm font-medium text-black/65">Materials:</p>
                          <p className="text-sm text-black">{quote.materials.join(", ")}</p>
                        </div>
                      )}

                      {quote.terms && (
                        <div className="mt-3">
                          <p className="mb-1 text-sm font-medium text-black/65">Terms & Conditions:</p>
                          <p className="text-sm text-black/70">{quote.terms}</p>
                        </div>
                      )}

                      <div className="mt-4 flex gap-2">
                        {isPlumbingService(request) ? (
                          <button
                            onClick={() => handleApproveClick(request, quote)}
                            className="flex-1 rounded-lg bg-[#00a83b] px-4 py-3 text-sm font-medium text-white hover:bg-[#008e32]"
                          >
                            Pay Materials
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApproveClick(request, quote)}
                            className="flex-1 rounded-lg bg-[#00a83b] px-4 py-3 text-sm font-medium text-white hover:bg-[#008e32]"
                          >
                            Approve & Pay
                          </button>
                        )}
                        <button
                          onClick={() => handleRejectClick(request, quote)}
                          className="flex-1 rounded-lg border border-red-300 bg-white px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))
        )}
      </div>

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        serviceName={selectedRequest?.service?.title || "Service"}
        providerName={selectedRequest?.provider ? `${selectedRequest.provider.firstName} ${selectedRequest.provider.lastName}` : "Your provider"}
        timeline={selectedRequest?.quote?.estimatedDuration}
        validUntil={selectedRequest?.quote?.validUntil}
        serviceCost={selectedRequest?.quote?.amount || 0}
        serviceFee={1000}
        onConfirm={handlePaymentConfirm}
        isLoading={isProcessingPayment}
      />
    </>
  );
}
