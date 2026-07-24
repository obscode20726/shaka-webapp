"use client";

import { useState } from "react";

type PaymentMethod = {
  id: string;
  type: "mobile_money" | "card";
  name: string;
  detail: string;
  isDefault?: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  providerName: string;
  timeline?: string;
  validUntil?: string;
  serviceCost: number;
  serviceFee: number;
  onConfirm: (paymentMethod: string) => Promise<void>;
  isLoading?: boolean;
};

const money = (amount: number) => `RWF ${amount.toLocaleString()}`;

export default function PaymentModal({
  isOpen,
  onClose,
  serviceName,
  providerName,
  timeline,
  validUntil,
  serviceCost,
  serviceFee,
  onConfirm,
  isLoading = false,
}: Props) {
  const [step, setStep] = useState<"review" | "method" | "success">("review");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("mtn");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const totalAmount = serviceCost + serviceFee;

  const methods: PaymentMethod[] = [
    { id: "mtn", type: "mobile_money", name: "MTN Mobile Money", detail: "0781234567", isDefault: true },
    { id: "card_4242", type: "card", name: "•••• 4242", detail: "Expires 12/27" },
  ];

  const resetAndClose = () => {
    setStep("review");
    setPaymentError(null);
    onClose();
  };

  const handlePay = async () => {
    setPaymentError(null);
    try {
      await onConfirm(selectedPaymentMethod);
      setStep("success");
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Payment could not be completed. Please try again.");
    }
  };

  if (!isOpen) return null;

  const displayDate = validUntil
    ? new Date(validUntil).toLocaleDateString("en-CA")
    : "Not specified";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Payment">
      <div className="w-full max-w-[512px] rounded-xl bg-white p-6 shadow-2xl sm:p-7">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-[#161616]">
            {step === "review" ? "Review & Pay" : step === "method" ? "Payment Details" : "Success"}
          </h3>
          <button type="button" onClick={resetAndClose} aria-label="Close payment dialog" className="text-xl leading-none text-black/60 hover:text-black">×</button>
        </div>

        {step === "review" && (
          <>
            <h4 className="mb-4 text-lg font-medium text-[#161616]">Payment Review</h4>
            <section className="rounded-xl border border-[#b9d7ff] bg-[#eff6ff] p-4">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-lg font-medium text-black">{serviceName}</p><p className="text-sm text-black/60">Provider: {providerName || "Your provider"}</p></div>
                <strong className="whitespace-nowrap text-2xl text-[#00a83b]">{money(serviceCost)}</strong>
              </div>
              <div className="mt-3 grid grid-cols-2 border-t border-black/10 pt-3 text-sm">
                <div><p className="text-black/60">Timeline:</p><p className="font-semibold text-black">{timeline || "To be confirmed"}</p></div>
                <div><p className="text-black/60">Valid Until:</p><p className="font-semibold text-black">{displayDate}</p></div>
              </div>
            </section>
            <section className="mt-5 rounded-xl border border-[#f6d664] bg-[#fffceb] p-4 text-sm text-[#945000]">
              <div className="flex gap-3"><span className="text-lg">♢</span><div><p className="font-semibold">Direct Payment</p><p className="mt-1 leading-5">Your payment will be sent to the provider after you confirm the work is completed to your satisfaction.</p></div></div>
            </section>
            <h4 className="mb-3 mt-6 text-base font-medium text-black">Payment Breakdown</h4>
            <div className="rounded-xl bg-[#f7f8fa] p-4 text-sm">
              <Row label="Total Service Cost:" value={money(serviceCost)} />
              <Row label="Service Fee:" value={money(serviceFee)} accent />
              <div className="my-2 border-t border-black/10" />
              <Row label="Total:" value={money(totalAmount)} bold />
            </div>
            <div className="mt-6 border-t border-black/10 pt-3"><Row label="Amount Due Now" value={money(totalAmount)} bold green /></div>
            <button type="button" onClick={() => setStep("method")} className="mt-5 w-full rounded-lg bg-[#ff6900] px-4 py-3 text-sm font-semibold text-white hover:bg-[#e85f00]">Continue to Payment</button>
          </>
        )}

        {step === "method" && !isLoading && (
          <>
            <h4 className="mb-4 text-lg font-medium text-black">Payment Method</h4>
            <div className="space-y-3">
              {methods.map((method) => {
                const selected = selectedPaymentMethod === method.id;
                return <button key={method.id} type="button" onClick={() => setSelectedPaymentMethod(method.id)} className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left ${selected ? "border-[#ff6900] bg-[#fff8ef]" : "border-[#dfe2e7] bg-white hover:bg-black/[.02]"}`}>
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${selected ? "border-[#111]" : "border-black/10"}`}>{selected && <span className="h-2 w-2 rounded-full bg-[#0c1735]" />}</span>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full ${method.type === "mobile_money" ? "bg-[#ffc400]" : "bg-[#f3f4f6]"}`}>{method.type === "mobile_money" ? "▯" : "▰"}</span>
                  <span className="flex-1"><span className="block font-medium text-black">{method.name}</span><span className="block text-sm text-black/60">{method.detail}</span></span>
                  {method.isDefault && <span className="rounded-full bg-[#d9f8e5] px-2 py-1 text-xs text-[#08753a]">Default</span>}
                </button>;
              })}
            </div>
            <button type="button" className="mt-3 w-full rounded-lg border border-[#dfe2e7] py-2.5 text-sm font-medium hover:bg-black/[.02]">+ Add New Card</button>
            <div className="mt-5 rounded-xl border border-[#dfe2e7] bg-[#fafbfc] p-4 text-sm"><Row label="Service Cost:" value={money(serviceCost)} /><Row label="Service Fee:" value={money(serviceFee)} accent /><div className="my-2 border-t border-black/10" /><Row label="Amount Due" value={money(totalAmount)} bold /></div>
            <p className="mt-5 text-center text-sm text-black/60">♙ &nbsp; Secure payment with {selectedPaymentMethod === "mtn" ? "MTN Mobile Money" : "your card"}</p>
            {paymentError && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{paymentError}</p>}
            <div className="mt-5 flex gap-3"><button type="button" onClick={() => setStep("review")} className="flex-1 rounded-lg border border-[#dfe2e7] py-3 text-sm font-medium hover:bg-black/[.02]">Back</button><button type="button" onClick={handlePay} className="flex-1 rounded-lg bg-[#00a83b] py-3 text-sm font-semibold text-white hover:bg-[#008e32]">♙ &nbsp; Pay {money(totalAmount)}</button></div>
          </>
        )}

        {isLoading && <div className="py-16 text-center"><div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-[#ff6900] border-t-transparent" /><h4 className="mt-7 text-xl font-medium text-black">Processing Payment</h4><p className="mt-2 text-black/60">Please wait while we process your payment securely...</p></div>}

        {step === "success" && !isLoading && <div className="pb-1 pt-6 text-center"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#d9f9e4] text-5xl text-[#00a83b]">✓</div><h4 className="mt-7 text-[28px] font-semibold text-black">Payment Successful!</h4><p className="mt-3 text-black/60">Your payment of {money(totalAmount)} has been sent to the provider.</p><div className="mt-4 rounded-xl border border-[#b9d7ff] bg-[#eff6ff] p-4 text-left"><p className="font-semibold text-black">What happens next:</p><p className="mt-3 text-sm text-black/60">◉ &nbsp; Provider has received your payment</p><p className="mt-3 text-sm text-black/60">☆ &nbsp; Please leave a review after the service</p></div><button type="button" onClick={resetAndClose} className="mt-6 w-full rounded-lg bg-[#00a83b] py-3 text-sm font-semibold text-white hover:bg-[#008e32]">Done</button></div>}
      </div>
    </div>
  );
}

function Row({ label, value, accent = false, bold = false, green = false }: { label: string; value: string; accent?: boolean; bold?: boolean; green?: boolean }) {
  return <div className={`flex items-center justify-between gap-3 ${bold ? "font-bold text-black" : accent ? "text-[#e54200]" : "text-black/70"} ${green ? "text-xl text-[#00a83b]" : ""}`}><span>{label}</span><span className="whitespace-nowrap">{value}</span></div>;
}
