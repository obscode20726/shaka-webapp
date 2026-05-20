import { AlertCircleIcon } from "./AdminIcons";
import type { AdminDispute } from "./types";

type Props = {
  disputes: AdminDispute[];
};

export default function DisputesTab({ disputes }: Props) {
  return (
    <section className="mt-8 rounded-xl border border-[#d9d9df] bg-white p-6">
      <h2 className="flex items-center gap-2 text-base font-medium text-black">
        <AlertCircleIcon className="h-5 w-5 text-[#fb2c36]" />
        Active Disputes ({disputes.length})
      </h2>

      <div className="mt-8 space-y-4">
        {disputes.map((dispute) => (
          <article
            key={dispute.id}
            className="rounded-lg border border-[#ffa2a2] bg-[#fff1f2] p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-medium text-black">
                  {dispute.bookingId}
                </h3>
                <p className="mt-2 text-sm text-[#364153]">
                  {dispute.customer} vs {dispute.provider}
                </p>
              </div>
              <span className="rounded-full bg-[#fb0018] px-3 py-1 text-xs font-medium text-white">
                {dispute.status}
              </span>
            </div>

            <div className="mt-4 rounded bg-white p-3">
              <p className="text-sm font-medium text-black">Reason:</p>
              <p className="mt-2 text-sm text-[#364153]">{dispute.reason}</p>
            </div>

            <p className="mt-4 text-xs text-[#4A5565]">
              Filed: {dispute.filedDate}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button className="h-8 rounded-md bg-[#00a63e] px-3 text-sm font-medium text-white hover:bg-[#008a34]">
                Resolve in Customer Favor
              </button>
              <button className="h-8 rounded-md border border-[#d9d9df] bg-white px-3 text-sm font-medium text-black hover:bg-black/[.02]">
                Resolve in Provider Favor
              </button>
              <button className="h-8 rounded-md border border-[#d9d9df] bg-white px-3 text-sm font-medium text-black hover:bg-black/[.02]">
                Request More Info
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
