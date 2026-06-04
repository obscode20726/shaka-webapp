"use client";

import React from "react";
import { isValidRwandanMobile } from "@/lib/phone";
import { createServiceRequest, type CreateServiceRequestPayload } from "@/lib/api";

type ServiceOption = {
  icon: string;
  label: string;
  value: string;
};

type ProviderOption = {
  id: string;
  name: string;
  service: string;
  rating: string;
  reviews: string;
  distance: string;
  skills: string[];
  availability: string;
};

type BookingForm = {
  service: string;
  city: string;
  address: string;
  providerId: string;
  date: string;
  time: string;
  description: string;
  fullName: string;
  phone: string;
  email: string;
};

type Props = {
  onBackToDashboard: () => void;
};

const steps = ["Service", "Location", "Provider", "Details"];

const services: ServiceOption[] = [
  { icon: "🚚", label: "Removal Service", value: "removal" },
  { icon: "🔧", label: "Plumbing", value: "plumbing" },
  { icon: "🌱", label: "Gardening", value: "gardening" },
  { icon: "✨", label: "Cleaning", value: "cleaning" },
  { icon: "🎨", label: "Painting", value: "painting" },
];

const providers: ProviderOption[] = [
  {
    id: "john-smith",
    name: "John Smith",
    service: "removal",
    rating: "4.9",
    reviews: "127 reviews",
    distance: "2.3 miles away",
    skills: ["Residential Wiring", "Panel Upgrades", "Emergency Repairs"],
    availability: "Available Today",
  },
  {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    service: "plumbing",
    rating: "4.8",
    reviews: "89 reviews",
    distance: "3.5 miles away",
    skills: ["Smart Home Installation", "LED Lighting", "Outlet Installation"],
    availability: "Available Tomorrow",
  },
  {
    id: "mike-rodriguez",
    name: "Mike Rodriguez",
    service: "cleaning",
    rating: "4.7",
    reviews: "156 reviews",
    distance: "5.1 miles away",
    skills: ["Commercial Electric", "Generator Installation", "Troubleshooting"],
    availability: "Available This Week",
  },
];

// Service slug mapping for API
const serviceSlugMap: Record<string, string> = {
  removal: "removal",
  plumbing: "plumbing",
  gardening: "gardening",
  cleaning: "cleaning",
  painting: "painting",
};

const initialForm: BookingForm = {
  service: "",
  city: "",
  address: "",
  providerId: providers[0].id,
  date: "",
  time: "",
  description: "",
  fullName: "",
  phone: "",
  email: "",
};

export default function BookingFlow({ onBackToDashboard }: Props) {
  const [step, setStep] = React.useState(1);
  const [isComplete, setIsComplete] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState(initialForm);

  const selectedProvider =
    providers.find((provider) => provider.id === form.providerId) || providers[0];

  const update = (key: keyof BookingForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const goPrevious = () => {
    if (isComplete) {
      setIsComplete(false);
      setStep(4);
      return;
    }
    if (step === 1) {
      onBackToDashboard();
      return;
    }
    setStep((current) => Math.max(1, current - 1));
  };

  const handleSubmitBooking = async () => {
    setLoading(true);
    setError("");

    try {
      // Convert date and time to ISO format
      const dateStr = form.date; // Format: YYYY-MM-DD
      const timeStr = form.time; // Format: HH:MM AM/PM
      
      // Combine date and time
      let dateTime: string;
      if (timeStr) {
        const [time, period] = timeStr.split(" ");
        const [hours, minutes] = time.split(":");
        let hour = parseInt(hours, 10);
        if (period === "PM" && hour !== 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;
        dateTime = new Date(`${dateStr}T${String(hour).padStart(2, "0")}:${minutes}:00`).toISOString();
      } else {
        dateTime = new Date(`${dateStr}T08:00:00`).toISOString();
      }

      const payload: CreateServiceRequestPayload = {
        serviceId: serviceSlugMap[form.service] || form.service,
        city: form.city,
        address: form.address || undefined,
        preferredDate: dateTime,
        preferredTime: form.time,
        description: form.description,
      };

      await createServiceRequest(payload);
      
      setIsComplete(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create booking";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const goNext = () => {
    if (step === 4) {
      if (!isValidRwandanMobile(form.phone)) {
        setError("Enter a valid Rwandan phone number (e.g. 0781234567).");
        return;
      }
      setError("");
      handleSubmitBooking();
      return;
    }
    setError("");
    setStep((current) => Math.min(4, current + 1));
  };

  return (
    <section className="min-h-screen bg-[#f3f4f6] py-6 sm:py-10">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6">
        <div className="bg-[#f6f7f9] px-4 py-5 sm:px-5 sm:py-7">
          <div className="mb-8 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrevious}
              disabled={loading}
              className="inline-flex items-center gap-4 text-sm font-medium text-black disabled:opacity-50"
            >
              <span className="text-lg">←</span>
              <span>{step === 1 && !isComplete ? "Back to Home" : "Previous"}</span>
            </button>
            {!isComplete ? (
              <span className="text-sm text-black/60">Step {step} of 4</span>
            ) : null}
          </div>

          {!isComplete ? <Progress step={step} /> : null}

          {isComplete ? (
            <BookingComplete
              form={form}
              onDashboard={onBackToDashboard}
              provider={selectedProvider}
            />
          ) : step === 1 ? (
            <ServiceStep
              selected={form.service}
              onSelect={(value) => update("service", value)}
            />
          ) : step === 2 ? (
            <LocationStep form={form} update={update} />
          ) : step === 3 ? (
            <ProviderStep
              providers={providers}
              selectedId={form.providerId}
              onSelect={(value) => update("providerId", value)}
            />
          ) : (
            <DetailsStep form={form} update={update} />
          )}

          {!isComplete ? (
            <div className="mt-8 flex justify-end">
              {error ? (
                <p className="mr-4 self-center text-sm text-red-500">{error}</p>
              ) : null}
              <button
                type="button"
                onClick={goNext}
                disabled={loading}
                className="inline-flex items-center gap-4 rounded-lg bg-[#ffad7a] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#ff8b47] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? "Processing..." : step === 4 ? "Book Service" : "Continue"}</span>
                <span>{!loading && "→"}</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div className="mb-8">
      <div className="mb-3 grid grid-cols-4 text-sm">
        {steps.map((label, index) => (
          <span
            key={label}
            className={index + 1 <= step ? "text-[#ff5f00]" : "text-black/35"}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/10">
        <div
          className="h-full rounded-full bg-[#ff5f00] transition-all"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>
    </div>
  );
}

function ServiceStep({
  onSelect,
  selected,
}: {
  onSelect: (service: string) => void;
  selected: string;
}) {
  return (
    <Panel>
      <h1 className="text-2xl font-semibold text-black">
        What service do you need?
      </h1>
      <p className="mt-2 text-sm text-black/60">
        Select the type of service you&apos;re looking for
      </p>

      <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
        {services.map((service) => (
          <button
            key={service.value}
            type="button"
            onClick={() => onSelect(service.value)}
            className={`flex h-32 flex-col items-center justify-center rounded-xl border bg-white text-center transition ${
              selected === service.value
                ? "border-[#ff5f00] ring-1 ring-[#ff5f00]"
                : "border-black/10 hover:border-black/20"
            }`}
          >
            <span className="text-3xl">{service.icon}</span>
            <span className="mt-4 text-lg font-semibold text-black">
              {service.label}
            </span>
          </button>
        ))}
      </div>
    </Panel>
  );
}

function LocationStep({
  form,
  update,
}: {
  form: BookingForm;
  update: (key: keyof BookingForm, value: string) => void;
}) {
  return (
    <Panel>
      <h1 className="text-2xl font-semibold text-black">
        Where do you need the service?
      </h1>
      <p className="mt-2 text-sm text-black/60">
        Select your location to find nearby providers
      </p>

      <div className="mt-7 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-black">Service Location</span>
          <select
            value={form.city}
            onChange={(event) => update("city", event.target.value)}
            className="mt-1 w-full rounded-lg border-0 bg-[#f0f0f2] px-3 py-2.5 text-sm text-black/80 outline-none"
          >
            <option value="">Select your city</option>
            <option value="San Francisco, CA">San Francisco, CA</option>
            <option value="Nyarugenge">Nyarugenge</option>
            <option value="Gasabo">Gasabo</option>
            <option value="Kicukiro">Kicukiro</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-black">
            Specific Address (Optional)
          </span>
          <input
            value={form.address}
            onChange={(event) => update("address", event.target.value)}
            placeholder="Enter your street address"
            className="mt-1 w-full rounded-lg border-0 bg-[#f0f0f2] px-3 py-2.5 text-sm outline-none placeholder:text-black/40"
          />
        </label>
      </div>
    </Panel>
  );
}

function ProviderStep({
  onSelect,
  providers,
  selectedId,
}: {
  onSelect: (providerId: string) => void;
  providers: ProviderOption[];
  selectedId: string;
}) {
  return (
    <Panel>
      <h1 className="text-2xl font-semibold text-black">Choose a Provider</h1>
      <p className="mt-2 text-sm text-black/60">
        Select from vetted professionals in your area
      </p>

      <div className="mt-7 space-y-4">
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            onClick={() => onSelect(provider.id)}
            className={`flex w-full items-start gap-5 rounded-xl border bg-white p-5 text-left transition ${
              selectedId === provider.id
                ? "border-[#ff5f00] ring-1 ring-[#ff5f00]"
                : "border-black/10 hover:border-black/20"
            }`}
          >
            <ProviderAvatar name={provider.name} />
            <div>
              <h2 className="text-lg font-semibold text-black">{provider.name}</h2>
              <p className="mt-4 text-sm text-black">
                <span className="text-[#f6b500]">★</span> {provider.rating} (
                {provider.reviews}){" "}
                <span className="ml-3 text-black/60">⌖ {provider.distance}</span>
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {provider.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-[#eef0f4] px-2 py-1 text-xs text-black"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-[#00a63d]">◷ {provider.availability}</p>
            </div>
          </button>
        ))}
      </div>
    </Panel>
  );
}

function DetailsStep({
  form,
  update,
}: {
  form: BookingForm;
  update: (key: keyof BookingForm, value: string) => void;
}) {
  return (
    <Panel>
      <h1 className="text-2xl font-semibold text-black">Booking Details</h1>
      <p className="mt-2 text-sm text-black/60">
        When would you like the service and tell us about your project
      </p>

      <div className="mt-7 grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-black">Select Date</span>
          <input
            type="date"
            value={form.date}
            onChange={(event) => update("date", event.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none"
          />
        </label>

        <label className="row-span-2 block">
          <span className="text-sm font-medium text-black">
            Project Description
          </span>
          <textarea
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="Describe what you need help with..."
            className="mt-1 h-[74px] w-full resize-none rounded-lg border-0 bg-[#f0f0f2] px-3 py-2.5 text-sm outline-none placeholder:text-black/40"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-black">Preferred Time</span>
          <select
            value={form.time}
            onChange={(event) => update("time", event.target.value)}
            className="mt-1 w-full rounded-lg border-0 bg-[#f0f0f2] px-3 py-2.5 text-sm text-black/80 outline-none"
          >
            <option value="">Select time</option>
            <option value="08:00 AM">08:00 AM</option>
            <option value="10:00 AM">10:00 AM</option>
            <option value="02:00 PM">02:00 PM</option>
            <option value="04:00 PM">04:00 PM</option>
          </select>
        </label>
      </div>

      <h2 className="mt-7 text-lg font-medium text-black">Contact Information</h2>
      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <TextField
          label="Full Name"
          onChange={(value) => update("fullName", value)}
          placeholder="Your name"
          value={form.fullName}
        />
        <TextField
          label="Phone Number"
          onChange={(value) => update("phone", value)}
          inputMode="numeric"
          placeholder="0781234567"
          type="tel"
          value={form.phone}
        />
        <div className="md:col-span-2">
          <TextField
            label="Email Address"
            onChange={(value) => update("email", value)}
            placeholder="Your email"
            value={form.email}
          />
        </div>
      </div>
    </Panel>
  );
}

function BookingComplete({
  form,
  onDashboard,
  provider,
}: {
  form: BookingForm;
  onDashboard: () => void;
  provider: ProviderOption;
}) {
  const selectedService =
    services.find((service) => service.value === form.service)?.label || "Service";

  return (
    <Panel className="py-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#02c75a] text-white">
          ✓
        </span>
      </div>
      <h1 className="mt-7 text-2xl font-semibold text-black">
        Booking Request Sent!
      </h1>
      <p className="mt-2 text-sm text-black/60">
        Your booking request has been sent to available providers
      </p>

      <div className="mx-auto mt-7 max-w-[520px] rounded-xl border border-black/10 bg-white p-6 text-left">
        <h2 className="text-base font-medium text-black">Booking Summary</h2>
        <div className="mt-7 flex items-center gap-4">
          <ProviderAvatar name={provider.name} />
          <div>
            <p className="font-semibold text-black">{provider.name}</p>
            <p className="text-sm text-black/60">{selectedService.toLowerCase()}</p>
          </div>
        </div>

        <dl className="mt-5 space-y-3 text-sm">
          <SummaryRow label="Date:" value={form.date || "February 2nd, 2026"} />
          <SummaryRow label="Time:" value={form.time || "10:00 AM"} />
          <SummaryRow
            label="Location:"
            value={form.city || form.address || "San Francisco, CA"}
          />
          <SummaryRow label="Contact:" value={form.phone || "0781234567"} />
        </dl>
      </div>

      <div className="mt-7 rounded-lg border border-[#99c2ff] bg-[#e8f1ff] p-4 text-left text-sm text-[#1242c9]">
        <p className="font-semibold">What happens next?</p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>Your request has been sent to available providers</li>
          <li>Providers will review your request and submit quotes</li>
          <li>You&apos;ll receive quotes in your dashboard for review</li>
          <li>Once you approve, payment will be held in escrow</li>
          <li>Payment is released after work is completed</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={onDashboard}
        className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#ff6a00] px-5 py-3 text-sm font-medium text-white hover:bg-[#e85f00]"
      >
        Go to Dashboard
      </button>
    </Panel>
  );
}

function TextField({
  inputMode,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: React.HTMLInputTypeAttribute;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-black">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border-0 bg-[#f0f0f2] px-3 py-2.5 text-sm outline-none placeholder:text-black/40"
      />
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-black">{label}</dt>
      <dd className="text-right text-black">{value}</dd>
    </div>
  );
}

function ProviderAvatar({ name }: { name: string }) {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-black/10 to-black/30 text-sm font-semibold text-black">
      {name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)}
    </div>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-black/10 bg-white px-8 py-8 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
