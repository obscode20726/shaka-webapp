import type { AdminTabName } from "./types";

type Tab = {
  name: AdminTabName;
  badge?: number;
  badgeClass?: string;
};

type Props = {
  activeTab: AdminTabName;
  onChange: (tab: AdminTabName) => void;
  tabs: Tab[];
};

export default function DashboardTabs({ activeTab, onChange, tabs }: Props) {
  return (
    <div className="mt-8 overflow-x-auto rounded-[12px] bg-[#e8e8ec] p-1">
      <div className="grid min-w-[840px] grid-cols-6 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            type="button"
            className={`flex h-8 items-center justify-center whitespace-nowrap rounded-[10px] px-3 text-sm font-medium ${
              tab.name === activeTab
                ? "bg-white text-black shadow-sm"
                : "text-black/80"
            }`}
            onClick={() => onChange(tab.name)}
          >
            <span>{tab.name}</span>
            {tab.badge !== undefined && tab.badge > 0 ? (
              <span
                className={`ml-3 rounded-full px-2 py-0.5 text-xs font-semibold text-white ${
                  tab.badgeClass ?? "bg-[#ff5f00]"
                }`}
              >
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
