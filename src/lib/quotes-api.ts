import { apiRequest } from "./api";

export interface QuoteItem {
  id?: string;
  amount?: number;
  description?: string;
  estimatedDuration?: string;
  materials?: string[];
  terms?: string;
  validUntil?: string;
  materialCost?: number;
  laborCost?: number;
  status?: string;
  createdAt?: string;
  serviceRequestId?: string;
}

export const fetchAllQuotes = async (): Promise<QuoteItem[]> => {
  try {
    const response = await apiRequest<unknown>("/api/quotes");
    if (Array.isArray(response)) {
      return response as QuoteItem[];
    }
    if (response && typeof response === "object") {
      const record = response as Record<string, unknown>;
      const quotes = record.quotes || record.data || record.items;
      if (Array.isArray(quotes)) {
        return quotes as QuoteItem[];
      }
    }
    return [];
  } catch {
    return [];
  }
};

export const fetchQuotesForServiceRequest = async (
  serviceRequestId: string,
): Promise<QuoteItem[]> => {
  try {
    const allQuotes = await fetchAllQuotes();
    return allQuotes.filter(
      (quote) => quote.serviceRequestId === serviceRequestId,
    );
  } catch {
    return [];
  }
};
