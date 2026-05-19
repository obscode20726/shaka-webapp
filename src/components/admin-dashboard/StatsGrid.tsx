import { formatCurrency } from "./formatters";
import type { AdminSummaryStats } from "./types";

type StatCard = {
  title: string;
  value: string;
  subtext: string;
  subtextClass: string;
  icon: "users" | "briefcase" | "approval" | "document" | "dollar";
  iconClass: string;
};

type Props = {
  stats: AdminSummaryStats;
};

export default function StatsGrid({ stats }: Props) {
  const cards: StatCard[] = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString("en-US"),
      subtext: "+12% this month",
      subtextClass: "text-[#00a63e]",
      icon: "users",
      iconClass: "text-[#2b7fff]",
    },
    {
      title: "Active Providers",
      value: stats.activeProviders.toLocaleString("en-US"),
      subtext: "+8% this month",
      subtextClass: "text-[#00a63e]",
      icon: "briefcase",
      iconClass: "text-[#ff5f00]",
    },
    {
      title: "Pending Approvals",
      value: String(stats.pendingApprovals),
      subtext: "Requires action",
      subtextClass: "text-[#ff5f00]",
      icon: "approval",
      iconClass: "text-[#ff5f00]",
    },
    {
      title: "Active Bookings",
      value: String(stats.activeBookings),
      subtext: "Currently in progress",
      subtextClass: "text-[#4A5565]",
      icon: "document",
      iconClass: "text-[#ad46ff]",
    },
    {
      title: "Platform Revenue",
      value: formatCurrency(stats.platformRevenue),
      subtext: "+15% this month",
      subtextClass: "text-[#00a63e]",
      icon: "dollar",
      iconClass: "text-[#00a63e]",
    },
  ];

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <article
          key={card.title}
          className="min-h-[118px] rounded-xl border border-[#d9d9df] bg-white px-6 py-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm leading-5 text-[#4A5565]">{card.title}</p>
              <p className="mt-1 text-2xl font-medium leading-7 text-black">
                {card.value}
              </p>
              <p className={`mt-1 text-xs leading-4 ${card.subtextClass}`}>
                {card.subtext}
              </p>
            </div>
            <StatIcon name={card.icon} className={card.iconClass} />
          </div>
        </article>
      ))}
    </div>
  );
}

function StatIcon({
  className,
  name,
}: {
  className: string;
  name: StatCard["icon"];
}) {
  if (name === "dollar") {
    return <span className={`text-4xl font-light leading-none ${className}`}>$</span>;
  }

  const common = {
    className: `h-8 w-8 ${className}`,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2.4,
    viewBox: "0 0 24 24",
  };

  if (name === "users") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (name === "briefcase") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M12 7v14" />
      </svg>
    );
  }

  if (name === "approval") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="m16 11 2 2 4-4" />
      </svg>
    );
  }

  return (
    <svg {...common} aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h8" />
      <path d="M8 9h2" />
    </svg>
  );
}
