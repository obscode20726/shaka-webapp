import type React from "react";
import { formatCurrency } from "./formatters";
import StatusPill from "./StatusPill";
import type { PlatformStats, RecentBooking } from "./types";

type Props = {
  bookings: RecentBooking[];
  stats: PlatformStats;
};

export default function OverviewTab({ bookings, stats }: Props) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-[#d9d9df] bg-white p-6">
        <h2 className="text-base font-medium text-black">Recent Bookings</h2>

        <div className="mt-7 space-y-4">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#d9d9df] bg-white px-3 py-4 sm:px-4"
            >
              <div>
                <p className="text-base font-medium text-black">
                  {booking.service}
                </p>
                <p className="mt-1 text-sm leading-5 text-[#4A5565]">
                  {booking.homeowner} <span aria-hidden="true">&rarr;</span>{" "}
                  {booking.provider}
                </p>
                <p className="text-sm leading-5 text-[#697282]">
                  {booking.date}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="text-base font-medium text-black">
                  {formatCurrency(booking.amount)}
                </p>
                <StatusPill status={booking.status} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[#d9d9df] bg-white p-6">
        <h2 className="text-base font-medium text-black">
          Platform Statistics
        </h2>

        <dl className="mt-8 divide-y divide-[#d9d9df]">
          <Metric label="Total Transaction Volume">
            {formatCurrency(stats.totalTransactionVolume)}
          </Metric>
          <Metric label="Platform Fees (5%)" valueClassName="text-[#00a63e]">
            {formatCurrency(stats.platformFees)}
          </Metric>
          <Metric label="Average Job Value">
            {formatCurrency(stats.averageJobValue)}
          </Metric>
          <Metric label="Completion Rate">{stats.completionRate}%</Metric>
          <Metric label="Customer Satisfaction">
            {stats.customerSatisfaction}/5.0
          </Metric>
        </dl>
      </section>
    </div>
  );
}

function Metric({
  children,
  label,
  valueClassName = "text-black",
}: {
  children: React.ReactNode;
  label: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <dt className="text-base text-black">{label}</dt>
      <dd className={`text-base font-medium ${valueClassName}`}>{children}</dd>
    </div>
  );
}
