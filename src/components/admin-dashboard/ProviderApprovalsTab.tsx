import {
  BriefcaseIcon,
  CheckCircleIcon,
  MapPinIcon,
  PhoneIcon,
  UserCheckIcon,
  XCircleIcon,
} from "./AdminIcons";
import type React from "react";
import type { ProviderApproval } from "./types";

type Props = {
  providers: ProviderApproval[];
};

export default function ProviderApprovalsTab({ providers }: Props) {
  return (
    <section className="mt-8 rounded-xl border border-[#d9d9df] bg-white p-6">
      <h2 className="flex items-center gap-2 text-base font-medium text-black">
        <UserCheckIcon className="h-5 w-5 text-[#ff5f00]" />
        Pending Provider Approvals ({providers.length})
      </h2>

      <div className="mt-7 space-y-4">
        {providers.map((provider) => (
          <article
            key={provider.id}
            className="rounded-lg border border-[#ffb86a] bg-[#fff7ed] p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar name={provider.name} />
                <div>
                  <h3 className="text-lg font-semibold text-black">
                    {provider.name}
                  </h3>
                  <span className="mt-1 inline-flex rounded-md bg-[#dbeafe] px-2 py-1 text-xs font-medium text-[#155dfc]">
                    {provider.service}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#4A5565]">Applied</p>
                <p className="text-sm font-medium text-black">
                  {provider.appliedDate}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 rounded-lg bg-white px-3 py-3 text-sm text-black md:grid-cols-3">
              <Info icon={<PhoneIcon />} value={provider.phone} />
              <Info icon={<MapPinIcon />} value={provider.location} />
              <Info
                icon={<BriefcaseIcon />}
                value={`${provider.yearsExperience} years experience`}
              />
            </div>

            <p className="mt-4 flex items-center gap-2 text-sm font-medium text-[#00a63e]">
              <CheckCircleIcon className="h-4 w-4" />
              Profile Complete
            </p>

            <div className="mt-4 grid gap-2 md:grid-cols-[1fr_1fr_130px]">
              <button className="inline-flex h-8 items-center justify-center gap-3 rounded-md bg-[#00a63e] text-sm font-medium text-white hover:bg-[#008a34]">
                <CheckCircleIcon className="h-4 w-4" />
                Approve Provider
              </button>
              <button className="inline-flex h-8 items-center justify-center gap-3 rounded-md border border-[#ff6467] bg-white text-sm font-medium text-[#fb2c36] hover:bg-red-50">
                <XCircleIcon className="h-4 w-4" />
                Reject
              </button>
              <button className="h-8 rounded-md border border-[#d9d9df] bg-white px-3 text-sm font-medium text-black hover:bg-black/[.02]">
                View Full Profile
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ffd6a8] text-sm font-medium text-[#ea580c]">
      {name[0]}
    </div>
  );
}

function Info({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#697282]">{icon}</span>
      <span>{value}</span>
    </div>
  );
}
