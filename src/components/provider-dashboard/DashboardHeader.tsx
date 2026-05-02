import Link from "next/link";
import type { ProviderProfile } from "./types";

type Props = {
  loading: boolean;
  profile: ProviderProfile | null;
  profileError: string | null;
};

export default function DashboardHeader({
  loading,
  profile,
  profileError,
}: Props) {
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
      </div>

      <div className="flex items-center gap-2 rounded-full bg-black/[.03] px-3 py-1.5">
        <button
          aria-label="toggle availability"
          className="relative h-5 w-9 rounded-full bg-[#0f172a]"
        >
          <span className="absolute right-[2px] top-[2px] h-4 w-4 rounded-full bg-white" />
        </button>
        <span className="text-sm text-black/70">Available</span>
        <span className="rounded-full bg-[#e8f8ed] px-2 py-0.5 text-xs text-[#1f9d4a]">
          Online
        </span>
      </div>
    </div>
  );
}
