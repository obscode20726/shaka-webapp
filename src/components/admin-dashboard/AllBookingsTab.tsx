import { FilterIcon, SearchIcon } from "./AdminIcons";
import { formatCurrency } from "./formatters";
import StatusPill from "./StatusPill";
import type { RecentBooking } from "./types";

type Props = {
  bookings: RecentBooking[];
};

export default function AllBookingsTab({ bookings }: Props) {
  return (
    <section className="mt-8 rounded-xl border border-[#d9d9df] bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-medium text-black">All Bookings</h2>
        <div className="flex items-center gap-2">
          <label className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#99A1AF]" />
            <input
              placeholder="Search bookings..."
              className="h-9 w-full rounded-lg border-0 bg-[#f3f4f6] pl-10 pr-3 text-sm text-black outline-none placeholder:text-[#697282] sm:w-[210px]"
            />
          </label>
          <button className="inline-flex h-9 items-center gap-3 rounded-lg border border-[#d9d9df] bg-white px-3 text-sm font-medium text-black">
            <FilterIcon className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {bookings.map((booking) => (
          <article
            key={booking.id}
            className="rounded-lg border border-[#d9d9df] bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="grid flex-1 gap-6 md:grid-cols-2">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-black">
                      {booking.service}
                    </h3>
                    <StatusPill status={booking.status} />
                  </div>
                  <Field label="Customer" value={booking.homeowner} />
                  <Field label="Amount" value={formatCurrency(booking.amount)} />
                </div>
                <div className="md:pt-8">
                  <Field label="Provider" value={booking.provider} />
                  <Field label="Date" value={booking.date} />
                </div>
              </div>
              <button className="h-8 rounded-md border border-[#d9d9df] bg-white px-3 text-sm font-medium text-black hover:bg-black/[.02]">
                View Details
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4">
      <p className="text-base text-[#4A5565]">{label}</p>
      <p className="mt-1 text-base font-medium text-black">{value}</p>
    </div>
  );
}
