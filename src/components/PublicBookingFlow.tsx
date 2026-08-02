"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  createServiceRequest,
  fetchProviders,
  fetchServices,
  type CreateServiceRequestPayload,
  type ProviderProfile,
} from "@/lib/api";

type ServiceOption = {
  icon: string;
  label: string;
  value: string;
  serviceId: string;
};

type ProviderOption = {
  id: string;
  name: string;
  businessName?: string;
  primaryService: string;
  rating: string;
  reviews: string;
  serviceArea: string;
  description: string;
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
  onClose: () => void;
};

const steps = ["Service", "Location", "Provider", "Details"];

const serviceIcons: Record<string, string> = {
  removal: "🚚",
  plumbing: "🔧",
  gardening: "🌱",
  cleaning: "✨",
  painting: "🎨",
};

const initialForm: BookingForm = {
  service: "",
  city: "",
  address: "",
  providerId: "",
  date: "",
  time: "",
  description: "",
  fullName: "",
  phone: "",
  email: "",
};

function providerDisplayName(provider: ProviderProfile) {
  const full = `${provider.firstName} ${provider.lastName}`.trim();
  return provider.businessName?.trim() || full || "Provider";
}

function mapProvider(profile: ProviderProfile): ProviderOption {
  const rating =
    profile.averageRating != null ? profile.averageRating.toFixed(1) : "—";
  const reviewCount = profile.totalReviews ?? 0;

  return {
    id: profile.id,
    name: providerDisplayName(profile),
    businessName: profile.businessName,
    primaryService: profile.primaryService,
    rating,
    reviews:
      reviewCount === 1 ? "1 review" : `${reviewCount} reviews`,
    serviceArea: profile.serviceArea || "Service area not listed",
    description:
      profile.serviceDescription?.trim() ||
      `${profile.yearsExperience ?? 0}+ years experience`,
  };
}

function filterProvidersForBooking(
  providers: ProviderProfile[],
  serviceSlug: string,
  city: string,
) {
  const normalizedCity = city.trim().toLowerCase();

  return providers.filter((provider) => {
    const matchesService =
      !serviceSlug ||
      provider.primaryService?.toLowerCase() === serviceSlug.toLowerCase();

    if (!normalizedCity) return matchesService;

    const area = provider.serviceArea?.trim().toLowerCase() ?? "";
    const matchesCity =
      !area ||
      area.includes(normalizedCity) ||
      normalizedCity.includes(area);

    return matchesService && matchesCity;
  });
}

export default function PublicBookingFlow({ onClose }: Props) {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [isComplete, setIsComplete] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState(initialForm);
  const [services, setServices] = React.useState<ServiceOption[]>([]);
  const [allProviders, setAllProviders] = React.useState<ProviderProfile[]>([]);
  const [catalogLoading, setCatalogLoading] = React.useState(true);
  const [catalogError, setCatalogError] = React.useState("");

  // Check for pending booking data on mount
  React.useEffect(() => {
    const pendingBooking = sessionStorage.getItem("pendingBooking");
    if (pendingBooking) {
      try {
        const parsed = JSON.parse(pendingBooking);
        // Merge parsed data with initialForm, coercing all values to strings
        const mergedForm: BookingForm = {
          ...initialForm,
          service: parsed.service != null ? String(parsed.service) : initialForm.service,
          city: parsed.city != null ? String(parsed.city) : initialForm.city,
          address: parsed.address != null ? String(parsed.address) : initialForm.address,
          providerId: parsed.providerId != null ? String(parsed.providerId) : initialForm.providerId,
          date: parsed.date != null ? String(parsed.date) : initialForm.date,
          time: parsed.time != null ? String(parsed.time) : initialForm.time,
          description: parsed.description != null ? String(parsed.description) : initialForm.description,
          fullName: parsed.fullName != null ? String(parsed.fullName) : initialForm.fullName,
          phone: parsed.phone != null ? String(parsed.phone) : initialForm.phone,
          email: parsed.email != null ? String(parsed.email) : initialForm.email,
        };
        setForm(mergedForm);
        setStep(4); // Jump to details step
      } catch (err) {
        sessionStorage.removeItem("pendingBooking");
      }
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const loadCatalog = async () => {
      try {
        setCatalogLoading(true);
        setCatalogError("");

        const [apiServices, apiProviders] = await Promise.all([
          fetchServices(),
          fetchProviders(),
        ]);

        if (cancelled) return;

        setServices(
          apiServices.map((service) => ({
            icon: serviceIcons[service.slug] || "🛠️",
            label: service.title,
            value: service.slug,
            serviceId: service.id,
          })),
        );
        setAllProviders(apiProviders);
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to load services";
          setCatalogError(message);
        }
      } finally {
        if (!cancelled) {
          setCatalogLoading(false);
        }
      }
    };

    loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  const availableProviders = React.useMemo(
    () =>
      filterProvidersForBooking(allProviders, form.service, form.city).map(
        mapProvider,
      ),
    [allProviders, form.service, form.city],
  );

  const selectedService = services.find(
    (service) => service.value === form.service,
  );

  const selectedProvider = React.useMemo(
    () => {
      const provider = allProviders.find((p) => p.id === form.providerId);
      return provider ? mapProvider(provider) : null;
    },
    [allProviders, form.providerId],
  );

  // Validation for each step
  const isStepValid = React.useMemo(() => {
    switch (step) {
      case 1:
        return !!form.service;
      case 2:
        return !!form.city;
      case 3:
        return !!form.providerId && !catalogLoading;
      case 4:
        return (
          !!form.date &&
          !!form.time
        );
      default:
        return false;
    }
  }, [step, form, catalogLoading]);

  const update = (key: keyof BookingForm, value: string) => {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "service" || key === "city") {
        next.providerId = "";
      }
      return next;
    });
  };

  const goPrevious = () => {
    if (isComplete) {
      setIsComplete(false);
      setStep(4);
      return;
    }
    if (step === 1) {
      // Clear pending booking when user cancels
      sessionStorage.removeItem("pendingBooking");
      sessionStorage.removeItem("pendingBookingReturn");
      onClose();
      return;
    }
    setStep((current) => Math.max(1, current - 1));
  };

  const checkAuthAndProceed = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (!token || !user) {
      // Store booking data for after authentication
      sessionStorage.setItem("pendingBooking", JSON.stringify(form));
      sessionStorage.setItem("pendingBookingReturn", window.location.pathname);
      
      // Redirect to signin
      router.push("/signin/homeowner");
      return false;
    }
    
    return true;
  };

  const handleSubmitBooking = async () => {
    // Check authentication before proceeding
    if (!checkAuthAndProceed()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const service = selectedService;
      if (!service) {
        throw new Error("Please select a service.");
      }
      if (!form.providerId) {
        throw new Error("Please select a provider.");
      }

      const dateStr = form.date;
      const timeStr = form.time;

      let dateTime: string;
      if (timeStr) {
        const [time, period] = timeStr.split(" ");
        const [hours, minutes] = time.split(":");
        let hour = parseInt(hours, 10);
        if (period === "PM" && hour !== 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;
        // Create date in local time and convert to ISO for backend
        const localDate = new Date(`${dateStr}T${String(hour).padStart(2, "0")}:${minutes}:00`);
        dateTime = localDate.toISOString();
      } else {
        const localDate = new Date(`${dateStr}T08:00:00`);
        dateTime = localDate.toISOString();
      }

      const payload: CreateServiceRequestPayload = {
        serviceId: service.serviceId,
        providerId: form.providerId,
        city: form.city,
        address: form.address || undefined,
        preferredDate: dateTime,
        preferredTime: form.time,
        description: form.description,
      };

      await createServiceRequest(payload);

      // Clear pending booking data
      sessionStorage.removeItem("pendingBooking");
      sessionStorage.removeItem("pendingBookingReturn");

      setIsComplete(true);
      setLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create booking";
      
      // Check if error is about missing homeowner profile
      if (errorMessage.toLowerCase().includes("homeowner profile") || 
          errorMessage.toLowerCase().includes("complete your")) {
        setError("Please complete your homeowner profile first. Redirecting to sign in...");
        setTimeout(() => {
          sessionStorage.setItem("pendingBooking", JSON.stringify(form));
          sessionStorage.setItem("pendingBookingReturn", window.location.pathname);
          router.push("/signin/homeowner?profile=missing");
        }, 2000);
      } else {
        setError(errorMessage);
      }
      setLoading(false);
    }
  };

  const goNext = () => {
    if (step === 1 && !form.service) {
      setError("Please select a service.");
      return;
    }
    if (step === 2 && !form.city) {
      setError("Please select your city.");
      return;
    }
    if (step === 3) {
      if (catalogLoading) {
        setError("Loading providers, please wait.");
        return;
      }
      if (!form.providerId) {
        setError("Please select a provider.");
        return;
      }
    }
    if (step === 4) {
      if (!form.date) {
        setError("Please select a date.");
        return;
      }
      if (!form.time) {
        setError("Please select a time.");
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

          {catalogError && !isComplete ? (
            <p className="mb-4 text-sm text-amber-700">{catalogError}</p>
          ) : null}

          {isComplete && selectedProvider ? (
            <BookingComplete
              form={form}
              onClose={onClose}
              provider={selectedProvider}
              serviceLabel={selectedService?.label || "Service"}
            />
          ) : isComplete ? (
            <BookingCompleteFallback
              form={form}
              onClose={onClose}
              serviceLabel={selectedService?.label || "Service"}
            />
          ) : !isComplete && step === 1 ? (
            <ServiceStep
              selected={form.service}
              services={services}
              loading={catalogLoading}
              onSelect={(value) => update("service", value)}
            />
          ) : !isComplete && step === 2 ? (
            <LocationStep form={form} update={update} />
          ) : !isComplete && step === 3 ? (
            <ProviderStep
              providers={availableProviders}
              loading={catalogLoading}
              selectedId={form.providerId}
              serviceLabel={selectedService?.label}
              city={form.city}
              onSelect={(value) => update("providerId", value)}
            />
          ) : !isComplete ? (
            <DetailsStep form={form} update={update} />
          ) : null}

          {!isComplete ? (
            <div className="mt-8 flex justify-end">
              {error ? (
                <p className="mr-4 self-center text-sm text-red-500">{error}</p>
              ) : null}
              <button
                type="button"
                onClick={goNext}
                disabled={loading || (step === 1 && catalogLoading) || !isStepValid}
                className="inline-flex items-center gap-4 rounded-lg bg-[#e65100] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#bf360c] disabled:opacity-50 disabled:cursor-not-allowed"
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
  services,
  loading,
}: {
  onSelect: (service: string) => void;
  selected: string;
  services: ServiceOption[];
  loading: boolean;
}) {
  return (
    <Panel>
      <h1 className="text-2xl font-semibold text-black">
        What service do you need?
      </h1>
      <p className="mt-2 text-sm text-black/60">
        Select the type of service you&apos;re looking for
      </p>

      {loading ? (
        <p className="mt-7 text-sm text-black/60">Loading services...</p>
      ) : services.length === 0 ? (
        <p className="mt-7 text-sm text-black/60">
          No services are available right now. Please try again later.
        </p>
      ) : (
        <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
          {services.map((service) => (
            <button
              key={service.serviceId}
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
      )}
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
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const locationGroups = [
    {
      label: "Kigali City - Gasabo District",
      locations: [
        "Bumbogo", "Gatsata", "Gikomero", "Gisozi", "Jabana", "Jali",
        "Kacyiru", "Kimihurura", "Kimironko", "Kinyinya", "Ndera",
        "Nduba", "Remera", "Rusororo", "Rutunga"
      ]
    },
    {
      label: "Kigali City - Kicukiro District",
      locations: [
        "Gahanga", "Gatenga", "Gikondo", "Kagarama", "Kanombe",
        "Kicukiro", "Kigarama", "Masaka", "Niboye", "Nyarugunga"
      ]
    },
    {
      label: "Kigali City - Nyarugenge District",
      locations: [
        "Gitega", "Kanyinya", "Kigali", "Kimisagara", "Mageragere",
        "Muhima", "Nyakabanda", "Nyamirambo", "Nyarugenge", "Rwezamenyo"
      ]
    },
    {
      label: "Eastern Province",
      locations: ["Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana"]
    },
    {
      label: "Northern Province",
      locations: ["Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo"]
    },
    {
      label: "Southern Province",
      locations: ["Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango"]
    },
    {
      label: "Western Province",
      locations: ["Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro"]
    }
  ];

  const filteredGroups = locationGroups.map(group => ({
    ...group,
    locations: group.locations.filter(loc =>
      loc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.locations.length > 0);

  const selectedLocation = locationGroups
    .flatMap(g => g.locations)
    .find(loc => loc === form.city);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <div ref={dropdownRef} className="relative mt-1">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-black/10 bg-white px-4 py-3 text-left text-sm text-black/80 shadow-sm hover:border-black/20 focus:outline-none focus:ring-2 focus:ring-[#ff5f00] focus:ring-offset-2"
            >
              <span className={form.city ? "text-black" : "text-black/40"}>
                {selectedLocation || "Select your location"}
              </span>
              <svg
                className={`h-5 w-5 text-black/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOpen && (
              <div className="absolute z-50 mt-2 max-h-[400px] w-full overflow-y-auto rounded-xl border border-black/10 bg-white shadow-xl">
                <div className="sticky top-0 z-10 border-b border-black/5 bg-white p-3">
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-black/10 bg-[#f8f9fa] py-2.5 pl-10 pr-4 text-sm text-black outline-none placeholder:text-black/40 focus:border-[#ff5f00] focus:ring-1 focus:ring-[#ff5f00]"
                    />
                  </div>
                </div>

                <div className="p-2">
                  {filteredGroups.length === 0 ? (
                    <p className="py-8 text-center text-sm text-black/60">No locations found</p>
                  ) : (
                    filteredGroups.map((group) => (
                      <div key={group.label} className="mb-2 last:mb-0">
                        <div className="px-3 py-2 text-xs font-semibold text-black/50 uppercase tracking-wide">
                          {group.label}
                        </div>
                        {group.locations.map((location) => (
                          <button
                            key={location}
                            type="button"
                            onClick={() => {
                              update("city", location);
                              setIsOpen(false);
                              setSearchQuery("");
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                              form.city === location
                                ? "bg-[#ff5f00]/10 text-[#ff5f00]"
                                : "text-black/80 hover:bg-black/5"
                            }`}
                          >
                            <span>{location}</span>
                            {form.city === location && (
                              <svg className="h-4 w-4 text-[#ff5f00]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-black">
            Specific Address (Optional)
          </span>
          <input
            value={form.address}
            onChange={(event) => update("address", event.target.value)}
            placeholder="Enter your street address"
            className="mt-1 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none placeholder:text-black/40 focus:border-[#ff5f00] focus:ring-2 focus:ring-[#ff5f00] focus:ring-offset-2"
          />
        </label>
      </div>
    </Panel>
  );
}

function ProviderStep({
  onSelect,
  providers,
  loading,
  selectedId,
  serviceLabel,
  city,
}: {
  onSelect: (providerId: string) => void;
  providers: ProviderOption[];
  loading: boolean;
  selectedId: string;
  serviceLabel?: string;
  city: string;
}) {
  return (
    <Panel>
      <h1 className="text-2xl font-semibold text-black">Choose a Provider</h1>
      <p className="mt-2 text-sm text-black/60">
        {serviceLabel
          ? `Providers offering ${serviceLabel.toLowerCase()}${city ? ` in ${city}` : ""}`
          : "Select from registered professionals in your area"}
      </p>

      {loading ? (
        <p className="mt-7 text-sm text-black/60">Loading providers...</p>
      ) : providers.length === 0 ? (
        <p className="mt-7 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          No providers match this service and location yet. Try another city or
          service, or check back after more providers register.
        </p>
      ) : (
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
                {provider.businessName &&
                provider.businessName !== provider.name ? (
                  <p className="text-sm text-black/60">{provider.businessName}</p>
                ) : null}
                <p className="mt-4 text-sm text-black">
                  <span className="text-[#f6b500]">★</span> {provider.rating} (
                  {provider.reviews}){" "}
                  <span className="ml-3 text-black/60">
                    ⌖ {provider.serviceArea}
                  </span>
                </p>
                <p className="mt-4 text-sm text-black/70">{provider.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
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
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [isRecording, setIsRecording] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState("en-US");
  const accumulatedTranscriptRef = React.useRef("");
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);

  // Cleanup on unmount: abort recognition and clear recording state
  React.useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsRecording(false);
    };
  }, []);

  const validateField = (key: keyof BookingForm, value: string) => {
    let error = "";
    switch (key) {
      case "date":
        if (!value) error = "Please select a date";
        else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) error = "Please select a date today or in the future";
        }
        break;
      case "time":
        if (!value) error = "Please select a time";
        break;
    }
    setFieldErrors((prev) => ({ ...prev, [key]: error }));
    return error;
  };

  const handleBlur = (key: keyof BookingForm) => {
    validateField(key, form[key]);
  };

  const handleChange = (key: keyof BookingForm, value: string) => {
    update(key, value);
    if (fieldErrors[key]) {
      validateField(key, value);
    }
  };

  const toggleDictation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      alert('Speech recognition is not available in your browser.');
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    // Start fresh with accumulated transcript
    accumulatedTranscriptRef.current = form.description;

    const recognition = new SpeechRecognitionConstructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLanguage;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }

      // Only update when we have final results to avoid replacing content
      if (finalTranscript) {
        const updatedDescription = accumulatedTranscriptRef.current + (accumulatedTranscriptRef.current && !accumulatedTranscriptRef.current.endsWith(' ') ? ' ' : '') + finalTranscript;
        update('description', updatedDescription);
        accumulatedTranscriptRef.current = updatedDescription;
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

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
            onChange={(event) => handleChange("date", event.target.value)}
            onBlur={() => handleBlur("date")}
            aria-invalid={!!fieldErrors.date}
            aria-describedby={fieldErrors.date ? "date-error" : undefined}
            min={new Date().toISOString().split('T')[0]}
            className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none"
          />
          {fieldErrors.date && (
            <p id="date-error" className="mt-1 text-sm text-red-500">{fieldErrors.date}</p>
          )}
        </label>

        <div className="row-span-2 block">
          <label htmlFor="description" className="block text-sm font-medium text-black">
            Project Description
          </label>
          <div className="mt-3 relative">
            <textarea
              id="description"
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Describe what you need help with..."
              className="h-[74px] w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 pr-16 text-sm outline-none placeholder:text-black/40 focus:border-[#e65100] focus:ring-1 focus:ring-[#e65100]"
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1.5 shadow-sm">
              <label htmlFor="dictation-language" className="sr-only">
                Select dictation language
              </label>
              <select
                id="dictation-language"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-[10px] font-medium text-black/60 bg-transparent outline-none hover:text-black/80 cursor-pointer"
              >
                <option value="en-US">EN</option>
                <option value="fr-FR">FR</option>
                <option value="rw-RW">RW</option>
              </select>
              <div className="h-4 w-px bg-black/10"></div>
              <button
                type="button"
                onClick={toggleDictation}
                aria-label={isRecording ? "Stop dictation" : "Start dictation"}
                className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                  isRecording
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-black/5 text-black/60 hover:bg-black/10 hover:text-black/80'
                }`}
              >
                {isRecording ? (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                ) : (
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-black">Preferred Time</span>
          <select
            value={form.time}
            onChange={(event) => handleChange("time", event.target.value)}
            onBlur={() => handleBlur("time")}
            aria-invalid={!!fieldErrors.time}
            aria-describedby={fieldErrors.time ? "time-error" : undefined}
            className="mt-1 w-full rounded-lg border-0 bg-[#f0f0f2] px-3 py-2.5 text-sm text-black/80 outline-none"
          >
            <option value="">Select time</option>
            <option value="08:00 AM">08:00 AM</option>
            <option value="10:00 AM">10:00 AM</option>
            <option value="02:00 PM">02:00 PM</option>
            <option value="04:00 PM">04:00 PM</option>
          </select>
          {fieldErrors.time && (
            <p id="time-error" className="mt-1 text-sm text-red-500">{fieldErrors.time}</p>
          )}
        </label>
      </div>
    </Panel>
  );
}

function BookingCompleteFallback({
  form,
  onClose,
  serviceLabel,
}: {
  form: BookingForm;
  onClose: () => void;
  serviceLabel: string;
}) {
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
        Your request has been successfully submitted
      </p>

      <div className="mx-auto mt-7 max-w-[520px] rounded-xl border border-black/10 bg-white p-6 text-left">
        <h2 className="text-base font-medium text-black">Booking Summary</h2>
        <div className="mt-7 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0f0f2]">
            <span className="text-xl">🛠️</span>
          </div>
          <div>
            <p className="font-semibold text-black">{serviceLabel}</p>
            <p className="text-sm text-black/60">Service requested</p>
          </div>
        </div>

        <dl className="mt-5 space-y-3 text-sm">
          <SummaryRow label="Date:" value={form.date} />
          <SummaryRow label="Time:" value={form.time} />
          <SummaryRow
            label="Location:"
            value={[form.city, form.address].filter(Boolean).join(", ")}
          />
        </dl>
      </div>

      <div className="mt-7 rounded-lg border border-[#99c2ff] bg-[#e8f1ff] p-4 text-left text-sm text-[#1242c9]">
        <p className="font-semibold">What happens next?</p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>Your service request will be reviewed</li>
          <li>You may receive quotes from providers</li>
          <li>You&apos;ll receive quotes in your dashboard for review</li>
          <li>Once you approve, payment will be held in escrow</li>
          <li>Payment is released after work is completed</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#ff6a00] px-5 py-3 text-sm font-medium text-white hover:bg-[#e85f00]"
      >
        Back to Home
      </button>
    </Panel>
  );
}

function BookingComplete({
  form,
  onClose,
  provider,
  serviceLabel,
}: {
  form: BookingForm;
  onClose: () => void;
  provider: ProviderOption;
  serviceLabel: string;
}) {
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
        Your request has been sent to {provider.name}
      </p>

      <div className="mx-auto mt-7 max-w-[520px] rounded-xl border border-black/10 bg-white p-6 text-left">
        <h2 className="text-base font-medium text-black">Booking Summary</h2>
        <div className="mt-7 flex items-center gap-4">
          <ProviderAvatar name={provider.name} />
          <div>
            <p className="font-semibold text-black">{provider.name}</p>
            <p className="text-sm text-black/60">{serviceLabel.toLowerCase()}</p>
          </div>
        </div>

        <dl className="mt-5 space-y-3 text-sm">
          <SummaryRow label="Date:" value={form.date} />
          <SummaryRow label="Time:" value={form.time} />
          <SummaryRow
            label="Location:"
            value={[form.city, form.address].filter(Boolean).join(", ")}
          />
          <SummaryRow label="Contact:" value={form.phone} />
        </dl>
      </div>

      <div className="mt-7 rounded-lg border border-[#99c2ff] bg-[#e8f1ff] p-4 text-left text-sm text-[#1242c9]">
        <p className="font-semibold">What happens next?</p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>{provider.name} will review your service request</li>
          <li>They may submit a quote for you to review</li>
          <li>You&apos;ll receive quotes in your dashboard for review</li>
          <li>Once you approve, payment will be held in escrow</li>
          <li>Payment is released after work is completed</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#ff6a00] px-5 py-3 text-sm font-medium text-white hover:bg-[#e85f00]"
      >
        Back to Home
      </button>
    </Panel>
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
