import type React from "react";

type StatCard = {
  title: string;
  value: React.ReactNode;
  icon: string;
  iconClass: string;
};

type Props = {
  cards: StatCard[];
  loading: boolean;
};

export default function StatsGrid({ cards, loading }: Props) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.title}
          className="rounded-xl border border-black/10 bg-white px-4 py-3"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-black/60">{card.title}</p>
              <p className="mt-1 text-[30px] font-semibold leading-none text-black">
                {loading ? "..." : card.value}
              </p>
            </div>
            <span className={`text-lg ${card.iconClass}`}>{card.icon}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
