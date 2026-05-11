import { formatMoney, formatShortDate, fullName } from "./formatters";
import type { Payment } from "./types";

type Props = {
  payments: Payment[];
  statsLoading: boolean;
};

export default function PaymentsTab({ payments, statsLoading }: Props) {
  return (
    <div className="mt-6 space-y-5">
      <section className="rounded-2xl border border-black/10 bg-white p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-black">Payment Methods</h2>

        <div className="mt-5 rounded-xl border border-black/10 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563eb] text-sm font-bold text-white">
                ....
              </div>
              <div>
                <p className="font-semibold text-black">**** **** **** 4242</p>
                <p className="text-sm text-black/55">Expires 12/27</p>
              </div>
            </div>
            <span className="rounded-full bg-[#f1f3f6] px-3 py-1 text-xs font-semibold text-black">
              Default
            </span>
          </div>
        </div>

        <button className="mt-4 rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold text-black hover:bg-black/[.02]">
          Add Payment Method
        </button>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-black">Recent Transactions</h2>

        <div className="mt-5 divide-y divide-black/10">
          {statsLoading ? (
            <p className="py-5 text-sm text-black/60">Loading transactions...</p>
          ) : payments.length === 0 ? (
            <p className="py-5 text-sm text-black/60">No transactions yet.</p>
          ) : (
            payments.map((payment, index) => (
              <article
                key={payment.id || `${payment.createdAt || "payment"}-${index}`}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="font-semibold text-black">
                    {payment.service?.title ||
                      payment.serviceRequest?.service?.title ||
                      "Service"}{" "}
                    - {payment.providerName || fullName(payment.provider)}
                  </p>
                  <p className="text-sm text-black/55">
                    {formatShortDate(payment.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-black">
                    {formatMoney(payment.amount)}
                  </p>
                  <p className="text-sm capitalize text-black/55">
                    {payment.status || "pending"}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
