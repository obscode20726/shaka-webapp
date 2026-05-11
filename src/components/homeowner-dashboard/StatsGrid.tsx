import { formatCurrency } from "./formatters";
import type { HomeownerStats } from "./types";

type Props = {
  stats: HomeownerStats;
  statsLoading: boolean;
};

export default function StatsGrid({ stats, statsLoading }: Props) {
  const topStats = [
    { title: "Upcoming", value: stats.upcoming, icon: "📅" },
    { title: "In Progress", value: stats.inProgress, icon: "🕒" },
    { title: "Completed", value: stats.completed, icon: "✅" },
    {
      title: "Total Spent",
      value: formatCurrency(stats.totalSpent),
      icon: "💳",
    },
  ];

  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {topStats.map((card) => (
        <article
          key={card.title}
          className="rounded-xl border border-black/10 bg-white px-4 py-3"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-black/60">{card.title}</p>
              <p className="mt-1 text-[30px] font-semibold leading-none text-black">
                {statsLoading ? "..." : card.value}
              </p>
            </div>
            <span className="text-lg">{card.icon}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
