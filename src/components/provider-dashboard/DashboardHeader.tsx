import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ProviderProfile } from "./types";
import { updateProviderAvailability } from "@/lib/api";

type Props = {
  loading: boolean;
  onLogout: () => void;
  profile: ProviderProfile | null;
  profileError: string | null;
};

export default function DashboardHeader({
  loading,
  onLogout,
  profile,
  profileError,
}: Props) {
  const [isAvailable, setIsAvailable] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const handleToggleAvailability = async () => {
    setIsUpdating(true);
    setAvailabilityError(null);
    try {
      await updateProviderAvailability(!isAvailable);
      setIsAvailable(!isAvailable);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update availability";
      console.error("Failed to update availability:", err);
      setAvailabilityError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <Link
          href="/"
          className="inline-flex items-center text-sm text-black/60 hover:text-black"
        >
          <span className="mr-1 text-lg">←</span>
          <span>Back to Home</span>
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-black sm:text-[34px]">
          {loading
            ? "Loading dashboard..."
            : `Welcome ${profile?.firstName || "Provider"} 👋`}
        </h1>
        <p className="text-sm text-black/55">
          Manage your bookings and grow your business
        </p>
        {profileError ? (
          <p className="mt-2 text-sm text-red-600">{profileError}</p>
        ) : null}
        {availabilityError ? (
          <p className="mt-2 text-sm text-red-600">{availabilityError}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full bg-black/[.03] px-3 py-1.5">
          <button
            aria-label="toggle availability"
            onClick={handleToggleAvailability}
            disabled={isUpdating}
            className={`relative h-5 w-9 rounded-full transition-colors ${
              isAvailable ? "bg-[#0f172a]" : "bg-black/20"
            }`}
          >
            <span
              className={`absolute top-[2px] h-4 w-4 rounded-full bg-white transition-all ${
                isAvailable ? "right-[2px]" : "left-[2px]"
              }`}
            />
          </button>
          <span className="text-sm text-black/70">
            {isAvailable ? "Available" : "Unavailable"}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              isAvailable
                ? "bg-[#e8f8ed] text-[#1f9d4a]"
                : "bg-[#fef3f3] text-[#dc2626]"
            }`}
          >
            {isAvailable ? "Online" : "Offline"}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-lg border border-red-400 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <Image
            src="/icons/logout.svg"
            alt=""
            width={16}
            height={16}
            aria-hidden="true"
          />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
