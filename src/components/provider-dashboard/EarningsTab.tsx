import type React from "react";
import {
  formatMoney,
  formatShortDate,
  parsePaymentCustomer,
} from "./formatters";
import type { Payment } from "./types";

type EarningsSnapshot = {
  thisMonth: number;
  lastMonth: number;
  yearToDate: number;
  averageJobValue: number;
  recentPayments: Payment[];
};

type Props = {
  earningsSnapshot: EarningsSnapshot;
  statsLoading: boolean;
};

export default function EarningsTab({
  earningsSnapshot,
  statsLoading,
}: Props) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-black/10 bg-white p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-black">Earnings Summary</h2>

        <dl className="mt-4 divide-y divide-black/10">
          <EarningsMetric
            label="This Month"
            loading={statsLoading}
            valueClassName="text-[#22a355]"
          >
            {formatMoney(earningsSnapshot.thisMonth)}
          </EarningsMetric>
          <EarningsMetric label="Last Month" loading={statsLoading}>
            {formatMoney(earningsSnapshot.lastMonth)}
          </EarningsMetric>
          <EarningsMetric label="Year to Date" loading={statsLoading}>
            {formatMoney(earningsSnapshot.yearToDate)}
          </EarningsMetric>
          <EarningsMetric label="Average Job Value" loading={statsLoading}>
            {formatMoney(earningsSnapshot.averageJobValue)}
          </EarningsMetric>
        </dl>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-black">Recent Payments</h2>

        <div className="mt-4 space-y-3">
          {statsLoading ? (
            <p className="py-4 text-sm text-black/60">Loading payments...</p>
          ) : earningsSnapshot.recentPayments.length === 0 ? (
            <p className="py-4 text-sm text-black/60">No payments yet.</p>
          ) : (
            earningsSnapshot.recentPayments.map((payment, idx) => (
              <article
                key={payment.id || `${payment.createdAt || "p"}-${idx}`}
                className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-black">
                    {parsePaymentCustomer(payment)}
                  </p>
                  <p className="text-xs text-black/60">
                    {formatShortDate(payment.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#22a355]">
                    {formatMoney(payment.amount || 0)}
                  </p>
                  <p className="text-xs text-black/60">Paid</p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function EarningsMetric({
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
    <div className="flex items-center justify-between py-3">
      <dt className="text-sm text-black/70">{label}</dt>
      <dd className={`text-sm font-semibold ${valueClassName}`}>
        {loading ? "..." : children}
      </dd>
    </div>
  );
}
