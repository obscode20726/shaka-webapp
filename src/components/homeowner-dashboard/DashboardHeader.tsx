import Link from "next/link";
import type { HomeownerProfile } from "./types";

type Props = {
  loading: boolean;
  onBookService: () => void;
  onLogout: () => void;
  profile: HomeownerProfile | null;
  profileError: string | null;
};

export default function DashboardHeader({
  loading,
  onBookService,
  onLogout,
  profile,
  profileError,
}: Props) {
  const welcomeName = profile?.fullName?.split(" ").at(0) || "Homeowner";

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
          {loading ? "Loading dashboard..." : `Welcome back, ${welcomeName}!`}
        </h1>
        <p className="text-sm text-black/55">Manage your bookings and account</p>
        {profileError ? (
          <p className="mt-2 text-sm text-red-600">{profileError}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onBookService}
          className="inline-flex items-center gap-2 rounded-lg bg-[#ff6a00] px-4 py-2 text-sm font-medium text-white hover:bg-[#e85f00]"
        >
          <span>+</span>
          <span>Book Service</span>
        </button>
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-lg border border-red-400 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <span aria-hidden="true">[-&gt;</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
