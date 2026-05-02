import type { TabName } from "./types";

type Props = {
  activeTab: TabName;
  onChange: (tab: TabName) => void;
  tabs: Array<{ name: TabName; badge?: string }>;
};

export default function DashboardTabs({ activeTab, onChange, tabs }: Props) {
  return (
    <div className="mt-5 rounded-full bg-[#eff1f4] p-1">
      <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            className={`rounded-full px-3 py-2 text-xs font-medium sm:text-sm ${
              tab.name === activeTab
                ? "bg-white text-black shadow-sm"
                : "text-black/70"
            }`}
            onClick={() => onChange(tab.name)}
          >
            <span>{tab.name}</span>
            {tab.badge ? (
              <span className="ml-1 rounded-full bg-[#ef4444] px-1.5 py-0.5 text-[10px] text-white">
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
