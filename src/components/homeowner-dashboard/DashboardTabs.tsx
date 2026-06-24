import type { HomeownerTab } from "./types";

export const homeownerTabs: HomeownerTab[] = [
  "Quotes",
  "Bookings",
  "Favorites",
  "Payments",
  "Settings",
];

type Props = {
  activeTab: number;
  onChange: (index: number) => void;
};

export default function DashboardTabs({ activeTab, onChange }: Props) {
  return (
    <div className="mt-5 overflow-x-auto rounded-full bg-[#eff1f4] p-1">
      <div className="grid min-w-[840px] grid-cols-5 gap-1">
        {homeownerTabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => onChange(index)}
            className={`rounded-full px-3 py-2 text-xs font-medium sm:text-sm ${
              index === activeTab
                ? "bg-white text-black shadow-sm"
                : "text-black/70"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
