import type React from "react";
import { formatCurrency } from "./formatters";
import StatusPill from "./StatusPill";
import type { DashboardStats, RecentActivityItem } from "./types";

type Props = {
  recentActivity: RecentActivityItem[];
  stats: DashboardStats;
  statsLoading: boolean;
};

export default function OverviewTab({
  recentActivity,
  stats,
  statsLoading,
}: Props) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-black">Recent Activity</h2>
        </div>

        <div className="mt-4 space-y-3">
          {recentActivity.length === 0 ? (
            <p className="py-4 text-sm text-black/60">No recent activity</p>
          ) : (
            recentActivity.map((item) => (
              <article
                key={`${item.customer}-${item.amount}`}
                className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/[.05] text-sm font-semibold text-black/70">
                    {item.customer.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black">
                      {item.customer}
                    </p>
                    <p className="text-xs text-black/60">
                    {item.service} • {item.amount}
                    </p>
                  </div>
                </div>
                <StatusPill status={item.status} />
              </article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-4 text-black sm:p-5">
        <h2 className="text-xl font-semibold">This Month&apos;s Performance</h2>

        <dl className="mt-4 space-y-3">
          <Metric label="Jobs Completed" loading={statsLoading}>
            {stats.jobsCompleted}
          </Metric>
          <Metric label="Response Rate" loading={statsLoading}>
            {stats.responseRate}
          </Metric>
          <Metric label="Customer Satisfaction" loading={statsLoading}>
          {stats.rating.toFixed(1)} ⭐
          </Metric>
          <Metric
            label="Total Earnings"
            loading={statsLoading}
            valueClassName="text-[#22a355]"
          >
            {formatCurrency(stats.monthlyEarnings)}
          </Metric>
        </dl>
      </section>
    </div>
  );
}

function Metric({
  children,
  label,
  loading,
  valueClassName = "",
}: {
  children: React.ReactNode;
  label: string;
  loading: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-sm text-black/75">{label}</dt>
      <dd className={`text-sm font-semibold ${valueClassName}`}>
        {loading ? "..." : children}
      </dd>
    </div>
  );
}
