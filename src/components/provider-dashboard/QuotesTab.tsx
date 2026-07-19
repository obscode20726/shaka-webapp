import { useState } from "react";
import { parseHomeownerName } from "./formatters";
import type { ServiceRequest } from "./types";
import { submitQuote } from "@/lib/api";

type Props = { requests: ServiceRequest[]; statsLoading: boolean };

const plumbingMaterials = [
  "PVC pipes",
  "Copper pipes",
  "Pipe fittings",
  "Faucet seals",
  "Plumber's tape",
  "Silicone sealant",
  "Washers & O-rings",
  "Water valves",
  "Drain pipes",
  "Flexible hoses",
];

const fieldClass =
  "mt-1.5 w-full rounded-[9px] border border-transparent bg-[#f3f3f5] px-3.5 py-3 text-sm text-[#111827] outline-none placeholder:text-[#68738b] focus:border-[#ff6b00] focus:bg-white focus:ring-2 focus:ring-[#ff6b00]/15";

export default function QuotesTab({ requests, statsLoading }: Props) {
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [materialCost, setMaterialCost] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [quoteDescription, setQuoteDescription] = useState("");
  const [quoteDuration, setQuoteDuration] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [terms, setTerms] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [customMaterial, setCustomMaterial] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totalAmount = (Number(materialCost) || 0) + (Number(laborCost) || 0);

  const resetQuote = () => {
    setSelectedRequest(null);
    setMaterialCost("");
    setLaborCost("");
    setQuoteDescription("");
    setQuoteDuration("");
    setValidUntil("");
    setTerms("");
    setSelectedMaterials([]);
    setCustomMaterial("");
    setSubmitError(null);
  };

  const toggleMaterial = (material: string) => {
    setSelectedMaterials((current) =>
      current.includes(material)
        ? current.filter((item) => item !== material)
        : [...current, material],
    );
  };

  const addCustomMaterial = () => {
    const material = customMaterial.trim();
    if (material && !selectedMaterials.includes(material)) {
      setSelectedMaterials((current) => [...current, material]);
    }
    setCustomMaterial("");
  };

  const handleSubmitQuote = async () => {
    if (!selectedRequest || totalAmount <= 0 || !quoteDuration.trim() || !quoteDescription.trim()) {
      setSubmitError("Add the costs, timeline, and work description before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await submitQuote({
        serviceRequestId: selectedRequest.id,
        amount: totalAmount,
        description: quoteDescription,
        estimatedDuration: quoteDuration,
      });
      resetQuote();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to submit quote");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mt-6">
        <h2 className="text-2xl font-semibold text-black">Booking Requests &amp; Quotes</h2>
        <p className="text-sm text-black/55">View requests and submit quotes to customers</p>
      </div>
      <div className="mt-5 space-y-4">
        {statsLoading ? <p className="py-8 text-center text-black/60">Loading requests...</p> :
          requests.length === 0 ? <p className="py-8 text-center text-black/60">No service requests yet.</p> :
          requests.map((request) => <RequestCard key={request.id} request={request} onQuote={() => setSelectedRequest(request)} />)}
      </div>

      {selectedRequest ? (
        <div className="fixed inset-0 z-50 bg-black/45 p-0 sm:flex sm:items-center sm:justify-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="quote-title">
          <div className="h-full w-full overflow-y-auto bg-white sm:h-auto sm:max-h-[92vh] sm:max-w-[600px] sm:rounded-xl">
            <div className="p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <h3 id="quote-title" className="text-xl font-bold text-[#060606]">Submit Quote for {selectedRequest.service?.title || "Service"}</h3>
                <button type="button" onClick={resetQuote} aria-label="Close quote form" className="-mr-1 -mt-1 rounded p-1 text-xl leading-none text-[#666] hover:bg-black/5">×</button>
              </div>

              <div className="mt-4 rounded-[10px] bg-[#f5f6f7] px-4 py-3.5 text-[15px] leading-6 text-[#07102b]">
                <p><strong>Customer:</strong> {parseHomeownerName(selectedRequest.homeowner)}</p>
                <p><strong>Service:</strong> {selectedRequest.service?.title || "Service"}</p>
                <p><strong>Location:</strong> {selectedRequest.city}</p>
                <p><strong>Description:</strong> {selectedRequest.description}</p>
              </div>

              <div className="mt-4 rounded-[10px] border border-[#a9d0ff] bg-[#edf6ff] px-4 py-4 text-[#0844b7]">
                <h4 className="text-lg font-semibold">Two-Phase Payment System</h4>
                <p className="mt-2 text-[15px] leading-6">Homeowner pays for materials upfront before work begins, then pays the remaining labor cost after work is completed.</p>
              </div>

              {submitError ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p> : null}

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <MoneyField id="material-cost" label="Material Cost (RWF) *" hint="Paid upfront" value={materialCost} onChange={setMaterialCost} />
                <MoneyField id="labor-cost" label="Labor Cost (RWF) *" hint="Paid after completion" value={laborCost} onChange={setLaborCost} />
                <div>
                  <label className="block text-sm font-semibold">Total Amount (RWF) *</label>
                  <div className={`${fieldClass} flex items-center gap-2 font-medium`}><MoneyIcon />{totalAmount.toLocaleString()}</div>
                  <p className="mt-1.5 text-xs text-[#68738b]">Auto-calculated</p>
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="quote-duration" className="block text-sm font-semibold">Timeline *</label>
                <input id="quote-duration" value={quoteDuration} onChange={(event) => setQuoteDuration(event.target.value)} className={fieldClass} placeholder="e.g., 2-3 days" />
              </div>
              <div className="mt-4">
                <label htmlFor="work-description" className="block text-sm font-semibold">Work Description *</label>
                <textarea id="work-description" value={quoteDescription} onChange={(event) => setQuoteDescription(event.target.value)} className={`${fieldClass} min-h-[72px] resize-y`} placeholder="Describe the work you will perform." />
              </div>

              <div className="mt-4">
                <p className="text-sm font-semibold">Materials &amp; Equipment</p>
                <p className="text-xs text-[#68738b]">Select materials needed for this job (click to toggle)</p>
                <div className="mt-3 rounded-xl border border-[#d9dce1] bg-[#fafbfc] p-4">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {plumbingMaterials.map((material) => {
                      const checked = selectedMaterials.includes(material);
                      return <button key={material} type="button" onClick={() => toggleMaterial(material)} className={`flex min-h-10 items-center gap-2 rounded-[5px] border px-2.5 py-2 text-left text-sm font-medium ${checked ? "border-[#ff9b4a] bg-[#fff8ef]" : "border-[#e1e4e9] bg-white hover:border-[#c7ccd5]"}`}><span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border ${checked ? "border-[#02040a] bg-[#02040a] text-white" : "border-[#dfe2e6] bg-[#f6f6f7]"}`}>{checked ? "✓" : ""}</span>{material}</button>;
                    })}
                  </div>
                </div>
                {selectedMaterials.length ? <div className="mt-3 rounded-[10px] border border-[#91ebae] bg-[#effff4] p-3"><p className="text-sm font-medium text-[#006b2e]">Selected Materials ({selectedMaterials.length}):</p><div className="mt-2 flex flex-wrap gap-2">{selectedMaterials.map((material) => <button key={material} type="button" onClick={() => toggleMaterial(material)} className="rounded-full border border-[#6ee69a] bg-white px-3 py-1.5 text-sm text-[#1f344d]">{material} <span className="ml-1 text-[#008a3b]">×</span></button>)}</div></div> : null}
                <div className="mt-3 flex gap-2"><input value={customMaterial} onChange={(event) => setCustomMaterial(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustomMaterial(); } }} className="min-w-0 flex-1 rounded-[9px] border border-transparent bg-[#f3f3f5] px-3.5 py-2.5 text-sm outline-none placeholder:text-[#68738b] focus:border-[#ff6b00]" placeholder="Add custom material not in the list..." /><button type="button" onClick={addCustomMaterial} className="rounded-[9px] bg-[#ff6a00] px-4 text-sm font-semibold text-white hover:bg-[#e85f00]">＋ Add</button></div>
              </div>

              <div className="mt-4"><label htmlFor="valid-until" className="block text-sm font-semibold">Quote Valid Until</label><input id="valid-until" type="date" value={validUntil} onChange={(event) => setValidUntil(event.target.value)} className={fieldClass} /></div>
              <div className="mt-4"><label htmlFor="terms" className="block text-sm font-semibold">Terms &amp; Conditions</label><textarea id="terms" value={terms} onChange={(event) => setTerms(event.target.value)} className={`${fieldClass} min-h-[72px] resize-y`} placeholder="Payment terms, cancellation policy, warranties, etc." /></div>

              <div className="mt-7 flex gap-3"><button type="button" onClick={handleSubmitQuote} disabled={isSubmitting} className="flex-1 rounded-[9px] bg-[#ff6a00] px-4 py-3 text-sm font-semibold text-white hover:bg-[#e85f00] disabled:opacity-60">{isSubmitting ? "Submitting..." : "⌁  Submit Quote"}</button><button type="button" onClick={resetQuote} className="flex-1 rounded-[9px] border border-[#d9dce1] bg-white px-4 py-3 text-sm font-semibold hover:bg-[#f8f8f8]">Cancel</button></div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function RequestCard({ request, onQuote }: { request: ServiceRequest; onQuote: () => void }) {
  return <article className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h3 className="text-lg font-medium text-black">{request.service?.title || "Service"}</h3><span className="rounded-full bg-[#fff4cf] px-2 py-0.5 text-xs text-[#987303]">{request.status}</span></div><p className="mt-2 text-base text-black/70">Customer: {parseHomeownerName(request.homeowner)}</p><p className="text-base text-black/70">Location: {request.city}</p></div></div><div className="mt-4"><p className="text-sm font-medium text-black">Description:</p><div className="mt-2 rounded-md bg-[#f5f6f8] px-4 py-3 text-sm text-black/70">{request.description}</div></div><button type="button" onClick={onQuote} className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#ff6a00] px-4 py-3 text-sm font-medium text-white hover:bg-[#e85f00]">Submit Quote</button></article>;
}

function MoneyField({ id, label, hint, value, onChange }: { id: string; label: string; hint: string; value: string; onChange: (value: string) => void }) {
  return <div><label htmlFor={id} className="block text-sm font-semibold">{label}</label><div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#68738b]"><MoneyIcon /></span><input id={id} type="number" min="0" value={value} onChange={(event) => onChange(event.target.value)} className={`${fieldClass} pl-9`} placeholder="0" /></div><p className="mt-1.5 text-xs text-[#68738b]">{hint}</p></div>;
}

function MoneyIcon() { return <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="5" width="15" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" /><path d="M5 8h.01M15 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>; }
